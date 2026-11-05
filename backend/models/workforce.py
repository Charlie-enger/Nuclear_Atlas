from pydantic import BaseModel

from models.program import OriseReference


class OccupationStats(BaseModel):
    employment: float | None = None
    mean_wage: float | None = None
    median_wage: float | None = None


class NationalOews(BaseModel):
    engineers: OccupationStats
    technicians: OccupationStats


class Projection(BaseModel):
    occupation: str
    key: str
    soc: str
    base_year: int
    base_employment: int
    projected_year: int
    projected_employment: int
    pct_change: float
    annual_openings: int
    typical_education: str
    source_url: str


class Scenario(BaseModel):
    key: str
    name: str
    annual_engineer_need: int
    description: str
    basis: str
    annual_gap: int  # need minus annual NE degrees (positive = shortfall)


class StateWorkforce(BaseModel):
    code: str
    name: str
    lat: float
    lng: float
    engineers: OccupationStats
    technicians: OccupationStats
    operating_reactors: int
    programs_count: int
    annual_ne_degrees: int
    est_engineer_openings: int | None
    est_technician_openings: int | None
    supply_balance: int | None  # annual degrees minus est. engineer openings
    employers_count: int


class Employer(BaseModel):
    name: str
    type: str
    city: str
    state: str
    lat: float
    lng: float
    focus: str


class Pipeline(BaseModel):
    annual_bs: int
    annual_ms: int
    annual_phd: int
    annual_degrees: int
    orise_reference: OriseReference


class Workforce(BaseModel):
    source: str
    data_year: int | None
    fetched_at: str
    is_live_cache: bool
    message: str | None = None
    national: NationalOews
    projections: list[Projection]
    scenarios: list[Scenario]
    pipeline: Pipeline
    states: list[StateWorkforce]
    employers: list[Employer]
