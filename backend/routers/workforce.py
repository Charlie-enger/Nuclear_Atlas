import json
import logging
import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter

from data.programs import PROGRAMS
from data.training import TRAINING_SITES
from data.workforce import (
    EMPLOYERS, METRO_ANCHORS, OPERATING_REACTORS, ORISE_REFERENCE, PROJECTIONS, SCENARIOS, STATES, SUPPRESSED_HUBS,
)
from lib.bls import METRO_AREAS_PATH, METRO_SNAPSHOT_PATH, SNAPSHOT_PATH, fetch_metros, fetch_oews
from lib.db import db
from models.workforce import Workforce

router = APIRouter(tags=["workforce"])
logger = logging.getLogger(__name__)

CACHE_ID = "oews_latest"
METRO_CACHE_ID = "oews_metro_latest"
REFRESH_COOLDOWN = timedelta(hours=6)  # v1 keyless API allows only 25 queries/day

METRO_AREAS: list[dict] = json.loads(METRO_AREAS_PATH.read_text())
_known = {a["code"] for a in METRO_AREAS}
METRO_FETCH_LIST = METRO_AREAS + [h for h in SUPPRESSED_HUBS if h["code"] not in _known]


async def _load(cache_id: str, path) -> tuple[dict, bool]:
    doc = await db.bls_cache.find_one({"_id": cache_id})
    if doc:
        doc.pop("_id", None)
        return doc, True
    return json.loads(path.read_text()), False


def _metros(snap: dict) -> list[dict]:
    out = []
    for a in METRO_FETCH_LIST:
        v = snap["metros"].get(a["code"], {"engineers": {}, "technicians": {}})
        e, t = v.get("engineers", {}), v.get("technicians", {})
        out.append({
            "code": a["code"], "name": a["name"], "lat": a["lat"], "lng": a["lng"],
            "ne_employment": e.get("employment"), "ne_mean_wage": e.get("mean_wage"),
            "ne_location_quotient": e.get("location_quotient"), "tech_employment": t.get("employment"),
            "anchor": METRO_ANCHORS.get(a["code"]) or a.get("anchor"),
            "suppressed": e.get("employment") is None,
        })
    return out


def _tech_pipeline() -> dict:
    civ = sum(s["annual_completers"] or 0 for s in TRAINING_SITES if s["type"] == "Community / Technical College")
    navy = sum(s["annual_completers"] or 0 for s in TRAINING_SITES if s["type"] == "Navy Nuclear Training")
    appr = sum(s["annual_completers"] or 0 for s in TRAINING_SITES if s["type"] == "Shipyard Apprenticeship")
    tech = next(p for p in PROJECTIONS if p["key"] == "technicians")
    return {
        "civilian_annual_completers": civ, "navy_annual_trainees": navy, "apprenticeship_annual": appr,
        "annual_technician_openings": tech["annual_openings"], "site_count": len(TRAINING_SITES),
    }


def _build(oews: dict, is_live: bool, metro: dict, message: str | None = None) -> dict:
    proj = {p["key"]: p for p in PROJECTIONS}
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
        "national": oews["national"],
        "projections": PROJECTIONS,
        "scenarios": [{**s, "annual_gap": s["annual_engineer_need"] - degrees} for s in SCENARIOS],
        "pipeline": {"annual_bs": bs, "annual_ms": ms, "annual_phd": phd, "annual_degrees": degrees, "orise_reference": ORISE_REFERENCE},
        "states": states,
        "employers": [
            {"name": e[0], "type": e[1], "city": e[2], "state": e[3], "lat": e[4], "lng": e[5], "focus": e[6]}
            for e in EMPLOYERS
        ],
        "metros": _metros(metro),
        "metro_source": metro.get("source", "BLS OEWS (metro)"),
        "metro_fetched_at": metro.get("fetched_at", ""),
        "training_sites": TRAINING_SITES,
        "technician_pipeline": _tech_pipeline(),
    }


@router.get("/workforce", response_model=Workforce)
async def get_workforce():
    oews, live = await _load(CACHE_ID, SNAPSHOT_PATH)
    metro, _ = await _load(METRO_CACHE_ID, METRO_SNAPSHOT_PATH)
    return _build(oews, live, metro)


@router.post("/workforce/refresh", response_model=Workforce)
async def refresh_workforce():
    oews, live = await _load(CACHE_ID, SNAPSHOT_PATH)
    metro, _ = await _load(METRO_CACHE_ID, METRO_SNAPSHOT_PATH)
    if live:
        fetched = datetime.fromisoformat(oews["fetched_at"])
        cooldown = timedelta(hours=1) if os.environ.get("BLS_API_KEY") else REFRESH_COOLDOWN
        if datetime.now(timezone.utc) - fetched < cooldown:
            return _build(oews, live, metro, "Live BLS data already fetched recently — using cached copy.")
    try:
        fresh = await fetch_oews()
        fresh_metro = await fetch_metros(METRO_FETCH_LIST)
    except Exception as exc:  # BLS outage / daily quota — keep serving the last good copy
        logger.warning("BLS refresh failed: %s", exc)
        return _build(oews, live, metro, "BLS API unavailable right now — showing last saved data.")
    await db.bls_cache.replace_one({"_id": CACHE_ID}, {"_id": CACHE_ID, **fresh}, upsert=True)
    await db.bls_cache.replace_one({"_id": METRO_CACHE_ID}, {"_id": METRO_CACHE_ID, **fresh_metro}, upsert=True)
    return _build(fresh, True, fresh_metro, "Pulled fresh state + metro data from the BLS API.")
