from fastapi import APIRouter, HTTPException

from data.programs import PROGRAMS, PROGRAMS_BY_ID, SOURCES
from data.workforce import ORISE_REFERENCE
from models.program import Program, ProgramsSummary

router = APIRouter(tags=["programs"])


@router.get("/programs", response_model=list[Program])
async def list_programs():
    return PROGRAMS


@router.get("/programs/summary", response_model=ProgramsSummary)
async def programs_summary():
    n = len(PROGRAMS)
    years = [row["year"] for row in PROGRAMS[0]["enrollment_history"]]
    enroll = [{"year": y, "total": sum(p["enrollment_history"][i]["total"] for p in PROGRAMS)} for i, y in enumerate(years)]
    grads = []
    for i, y in enumerate(years):
        bs = sum(p["graduates_by_year"][i]["bs"] for p in PROGRAMS)
        ms = sum(p["graduates_by_year"][i]["ms"] for p in PROGRAMS)
        phd = sum(p["graduates_by_year"][i]["phd"] for p in PROGRAMS)
        grads.append({"year": y, "bs": bs, "ms": ms, "phd": phd, "total": bs + ms + phd})
    return {
        "program_count": n,
        "states_count": len({p["state"] for p in PROGRAMS}),
        "total_enrollment": sum(p["total_enrollment"] for p in PROGRAMS),
        "ug_enrollment": sum(p["ug_enrollment"] for p in PROGRAMS),
        "grad_enrollment": sum(p["grad_enrollment"] for p in PROGRAMS),
        "annual_bs": sum(p["annual_bs"] for p in PROGRAMS),
        "annual_ms": sum(p["annual_ms"] for p in PROGRAMS),
        "annual_phd": sum(p["annual_phd"] for p in PROGRAMS),
        "research_reactors": sum(1 for p in PROGRAMS if p["research_reactor"]),
        "total_budget_musd": round(sum(p["budget_musd"] for p in PROGRAMS), 1),
        "avg_placement_rate": round(sum(p["placement_rate"] for p in PROGRAMS) / n, 1),
        "avg_growth_5y": round(sum(p["growth_5y"] for p in PROGRAMS) / n, 1),
        "enrollment_by_year": enroll,
        "graduates_by_year": grads,
        "orise_reference": ORISE_REFERENCE,
        "sources": SOURCES,
    }


@router.get("/programs/{id}", response_model=Program)
async def get_program(id: str):
    p = PROGRAMS_BY_ID.get(id)
    if not p:
        raise HTTPException(status_code=404, detail="program not found")
    return p
