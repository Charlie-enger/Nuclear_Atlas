"""BLS Public Data API (OEWS) client for Nuclear Engineers (17-2161) and Nuclear Technicians (19-4051).

Uses v2 when BLS_API_KEY is set (falls back to keyless v1 if BLS rejects the key).
Rebuild the bundled state snapshot: `cd /app/backend && python -m lib.bls`.
Metro snapshot: `python -m scripts.build_metros`.
"""

import asyncio
import json
import os
from datetime import datetime, timezone
from pathlib import Path

import httpx

BLS_URL = "https://api.bls.gov/publicAPI"
DATA_DIR = Path(__file__).parent.parent / "data"
SNAPSHOT_PATH = DATA_DIR / "bls_snapshot.json"
METRO_AREAS_PATH = DATA_DIR / "metro_areas.json"
METRO_SNAPSHOT_PATH = DATA_DIR / "metro_snapshot.json"

OCCUPATIONS = {"engineers": "172161", "technicians": "194051"}
# datatype codes: 01 employment, 04 annual mean wage, 13 annual median wage, 17 location quotient
STATE_DATATYPES = {"01": "employment", "04": "mean_wage"}
NATIONAL_DATATYPES = {"01": "employment", "04": "mean_wage", "13": "median_wage"}
METRO_PLAN = [("engineers", "01", "employment"), ("engineers", "04", "mean_wage"), ("engineers", "17", "location_quotient"), ("technicians", "01", "employment")]

STATE_FIPS = {
    "AL": "01", "AK": "02", "AZ": "04", "AR": "05", "CA": "06", "CO": "08", "CT": "09", "DE": "10",
    "DC": "11", "FL": "12", "GA": "13", "HI": "15", "ID": "16", "IL": "17", "IN": "18", "IA": "19",
    "KS": "20", "KY": "21", "LA": "22", "ME": "23", "MD": "24", "MA": "25", "MI": "26", "MN": "27",
    "MS": "28", "MO": "29", "MT": "30", "NE": "31", "NV": "32", "NH": "33", "NJ": "34", "NM": "35",
    "NY": "36", "NC": "37", "ND": "38", "OH": "39", "OK": "40", "OR": "41", "PA": "42", "RI": "44",
    "SC": "45", "SD": "46", "TN": "47", "TX": "48", "UT": "49", "VT": "50", "VA": "51", "WA": "53",
    "WV": "54", "WI": "55", "WY": "56",
}


def series_id(area_type: str, area_code: str, soc: str, datatype: str) -> str:
    return f"OEU{area_type}{area_code}000000{soc}{datatype}"


def _parse(value: str | None) -> float | None:
    try:
        return float(value) if value is not None else None
    except ValueError:  # "-", "(8)" etc. = suppressed estimate
        return None


class InvalidKeyError(RuntimeError):
    pass


async def _post(client: httpx.AsyncClient, ids: list[str], key: str) -> dict[str, dict | None]:
    payload: dict = {"seriesid": ids}
    if key:
        payload["registrationkey"] = key
    r = await client.post(f"{BLS_URL}/{'v2' if key else 'v1'}/timeseries/data/", json=payload)
    r.raise_for_status()
    body = r.json()
    if body.get("status") != "REQUEST_SUCCEEDED":
        msg = " ".join(body.get("message", []))
        if key and "key" in msg.lower() and "invalid" in msg.lower():
            raise InvalidKeyError("BLS rejected the API key")
        raise RuntimeError(msg or "BLS request failed")
    out: dict[str, dict | None] = {}
    for s in body["Results"]["series"]:
        data = s.get("data") or []
        out[s["seriesID"]] = data[0] if data else None
    return out


async def fetch_series(ids: list[str]) -> tuple[dict[str, dict | None], str]:
    """Fetch latest observation per series id, batching to the API limit. Returns (results, api label)."""
    key = os.environ.get("BLS_API_KEY", "").strip()
    results: dict[str, dict | None] = {}
    async with httpx.AsyncClient(timeout=httpx.Timeout(45.0, connect=10.0)) as client:
        try:
            step = 50 if key else 25
            for i in range(0, len(ids), step):
                results.update(await _post(client, ids[i : i + step], key))
            return results, "v2 (registered key)" if key else "v1 (keyless)"
        except InvalidKeyError:  # unactivated/invalid key — fall back to keyless v1
            results = {}
            for i in range(0, len(ids), 25):
                results.update(await _post(client, ids[i : i + 25], ""))
            return results, "v1 (keyless — saved key was rejected by BLS)"


def _year(results: dict[str, dict | None]) -> int | None:
    for p in results.values():
        if p and p.get("year"):
            return int(p["year"])
    return None


async def fetch_oews() -> dict:
    """National + all-state OEWS values."""
    plan: list[tuple[str, str, str, str]] = []  # (area, occ, field, series)
    for occ, soc in OCCUPATIONS.items():
        for dt, field in NATIONAL_DATATYPES.items():
            plan.append(("US", occ, field, series_id("N", "0000000", soc, dt)))
        for st, fips in STATE_FIPS.items():
            for dt, field in STATE_DATATYPES.items():
                plan.append((st, occ, field, series_id("S", f"{fips}00000", soc, dt)))

    results, api = await fetch_series([p[3] for p in plan])
    national: dict = {"engineers": {}, "technicians": {}}
    states: dict[str, dict] = {st: {"engineers": {}, "technicians": {}} for st in STATE_FIPS}
    for area, occ, field, sid in plan:
        point = results.get(sid)
        (national if area == "US" else states[area])[occ][field] = _parse(point.get("value")) if point else None
    return {
        "source": f"BLS OEWS via api.bls.gov {api}",
        "data_year": _year(results),
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "national": national,
        "states": states,
    }


async def fetch_metros(areas: list[dict]) -> dict:
    """Metro (MSA) OEWS values for the given areas [{code, name, lat, lng}]."""
    plan = [(a["code"], occ, field, series_id("M", a["code"], OCCUPATIONS[occ], dt)) for a in areas for occ, dt, field in METRO_PLAN]
    results, api = await fetch_series([p[3] for p in plan])
    vals: dict[str, dict] = {a["code"]: {"engineers": {}, "technicians": {}} for a in areas}
    for code, occ, field, sid in plan:
        point = results.get(sid)
        vals[code][occ][field] = _parse(point.get("value")) if point else None
    return {
        "source": f"BLS OEWS (metro) via api.bls.gov {api}",
        "data_year": _year(results),
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "metros": vals,
    }


if __name__ == "__main__":
    snap = asyncio.run(fetch_oews())
    SNAPSHOT_PATH.write_text(json.dumps(snap, indent=1))
    print("wrote", SNAPSHOT_PATH, snap["data_year"], snap["national"])
