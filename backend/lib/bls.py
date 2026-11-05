"""BLS Public Data API (OEWS) client for Nuclear Engineers (17-2161) and Nuclear Technicians (19-4051).

Uses v2 when BLS_API_KEY is set, keyless v1 otherwise. Run as a script to rebuild the
bundled snapshot: `cd /app/backend && python -m lib.bls`.
"""

import asyncio
import json
import os
from datetime import datetime, timezone
from pathlib import Path

import httpx

BLS_URL = "https://api.bls.gov/publicAPI"
SNAPSHOT_PATH = Path(__file__).parent.parent / "data" / "bls_snapshot.json"

OCCUPATIONS = {"engineers": "172161", "technicians": "194051"}
# datatype codes: 01 employment, 04 annual mean wage, 13 annual median wage
STATE_DATATYPES = {"01": "employment", "04": "mean_wage"}
NATIONAL_DATATYPES = {"01": "employment", "04": "mean_wage", "13": "median_wage"}

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


async def _post(client: httpx.AsyncClient, ids: list[str]) -> dict[str, dict]:
    key = os.environ.get("BLS_API_KEY", "").strip()
    payload: dict = {"seriesid": ids}
    if key:
        payload["registrationkey"] = key
    r = await client.post(f"{BLS_URL}/{'v2' if key else 'v1'}/timeseries/data/", json=payload)
    r.raise_for_status()
    body = r.json()
    if body.get("status") != "REQUEST_SUCCEEDED":
        raise RuntimeError("; ".join(body.get("message", [])) or "BLS request failed")
    out = {}
    for s in body["Results"]["series"]:
        data = s.get("data") or []
        out[s["seriesID"]] = data[0] if data else None
    return out


async def fetch_oews() -> dict:
    """Pull national + all-state OEWS values. ~10 v1 requests (25 series each)."""
    plan: list[tuple[str, str, str, str]] = []  # (area, occ, field, series)
    for occ, soc in OCCUPATIONS.items():
        for dt, field in NATIONAL_DATATYPES.items():
            plan.append(("US", occ, field, series_id("N", "0000000", soc, dt)))
        for st, fips in STATE_FIPS.items():
            for dt, field in STATE_DATATYPES.items():
                plan.append((st, occ, field, series_id("S", f"{fips}00000", soc, dt)))

    batch = 50 if os.environ.get("BLS_API_KEY") else 25
    results: dict[str, dict] = {}
    async with httpx.AsyncClient(timeout=httpx.Timeout(30.0, connect=10.0)) as client:
        for i in range(0, len(plan), batch):
            results.update(await _post(client, [p[3] for p in plan[i : i + batch]]))

    national: dict = {"engineers": {}, "technicians": {}}
    states: dict[str, dict] = {st: {"engineers": {}, "technicians": {}} for st in STATE_FIPS}
    year = None
    for area, occ, field, sid in plan:
        point = results.get(sid)
        val = _parse(point.get("value")) if point else None
        if point and not year:
            year = point.get("year")
        (national if area == "US" else states[area])[occ][field] = val
    return {
        "source": "BLS OEWS via api.bls.gov",
        "data_year": int(year) if year else None,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "national": national,
        "states": states,
    }


if __name__ == "__main__":
    snap = asyncio.run(fetch_oews())
    SNAPSHOT_PATH.parent.mkdir(exist_ok=True)
    SNAPSHOT_PATH.write_text(json.dumps(snap, indent=1))
    print("wrote", SNAPSHOT_PATH, snap["data_year"], snap["national"])
