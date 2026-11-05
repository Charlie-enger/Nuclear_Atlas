import json
import logging
import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter

from data.programs import PROGRAMS
from data.workforce import EMPLOYERS, OPERATING_REACTORS, ORISE_REFERENCE, PROJECTIONS, SCENARIOS, STATES
from lib.bls import SNAPSHOT_PATH, fetch_oews
from lib.db import db
from models.workforce import Workforce

router = APIRouter(tags=["workforce"])
logger = logging.getLogger(__name__)

CACHE_ID = "oews_latest"
REFRESH_COOLDOWN = timedelta(hours=6)  # v1 keyless API allows only 25 queries/day


async def _load_oews() -> tuple[dict, bool]:
    doc = await db.bls_cache.find_one({"_id": CACHE_ID})
    if doc:
        doc.pop("_id", None)
        return doc, True
    return json.loads(SNAPSHOT_PATH.read_text()), False


def _build(oews: dict, is_live: bool, message: str | None = None) -> dict:
    proj = {p["key"]: p for p in PROJECTIONS}
    nat = oews["national"]
    eng_rate = proj["engineers"]["annual_openings"] / proj["engineers"]["base_employment"]
    tech_rate = proj["technicians"]["annual_openings"] / proj["technicians"]["base_employment"]

    bs = sum(p["annual_bs"] for p in PROGRAMS)
    ms = sum(p["annual_ms"] for p in PROGRAMS)
    phd = sum(p["annual_phd"] for p in PROGRAMS)
    degrees = bs + ms + phd

    states = []
    for code, (name, lat, lng) in STATES.items():
        o = oews["states"].get(code, {"engineers": {}, "technicians": {}})
        eng_emp = o["engineers"].get("employment")
        tech_emp = o["technicians"].get("employment")
        progs = [p for p in PROGRAMS if p["state"] == code]
        st_deg = sum(p["annual_degrees"] for p in progs)
        eng_open = round(eng_emp * eng_rate) if eng_emp else None
        states.append({
            "code": code, "name": name, "lat": lat, "lng": lng,
            "engineers": o["engineers"], "technicians": o["technicians"],
            "operating_reactors": OPERATING_REACTORS.get(code, 0),
            "programs_count": len(progs), "annual_ne_degrees": st_deg,
            "est_engineer_openings": eng_open,
            "est_technician_openings": round(tech_emp * tech_rate) if tech_emp else None,
            "supply_balance": st_deg - eng_open if eng_open is not None else None,
            "employers_count": sum(1 for e in EMPLOYERS if e[3] == code),
        })

    return {
        "source": oews.get("source", "BLS OEWS"),
        "data_year": oews.get("data_year"),
        "fetched_at": oews.get("fetched_at", ""),
        "is_live_cache": is_live,
        "message": message,
        "national": nat,
        "projections": PROJECTIONS,
        "scenarios": [{**s, "annual_gap": s["annual_engineer_need"] - degrees} for s in SCENARIOS],
        "pipeline": {"annual_bs": bs, "annual_ms": ms, "annual_phd": phd, "annual_degrees": degrees, "orise_reference": ORISE_REFERENCE},
        "states": states,
        "employers": [
            {"name": e[0], "type": e[1], "city": e[2], "state": e[3], "lat": e[4], "lng": e[5], "focus": e[6]}
            for e in EMPLOYERS
        ],
    }


@router.get("/workforce", response_model=Workforce)
async def get_workforce():
    oews, live = await _load_oews()
    return _build(oews, live)


@router.post("/workforce/refresh", response_model=Workforce)
async def refresh_workforce():
    oews, live = await _load_oews()
    if live:
        fetched = datetime.fromisoformat(oews["fetched_at"])
        cooldown = timedelta(hours=1) if os.environ.get("BLS_API_KEY") else REFRESH_COOLDOWN
        if datetime.now(timezone.utc) - fetched < cooldown:
            return _build(oews, live, "Live BLS data already fetched recently — using cached copy.")
    try:
        fresh = await fetch_oews()
    except Exception as exc:  # BLS outage / daily quota — keep serving the last good copy
        logger.warning("BLS refresh failed: %s", exc)
        return _build(oews, live, "BLS API unavailable right now — showing last saved data.")
    await db.bls_cache.replace_one({"_id": CACHE_ID}, {"_id": CACHE_ID, **fresh}, upsert=True)
    return _build(fresh, True, "Pulled fresh data from the BLS API.")
