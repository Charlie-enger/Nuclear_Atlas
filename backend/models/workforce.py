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


class MetroWorkforce(BaseModel):
    code: str
    name: str
    lat: float
    lng: float
    ne_employment: float | None
    ne_mean_wage: float | None
    ne_location_quotient: float | None
    tech_employment: float | None
    anchor: str | None
    suppressed: bool  # BLS publishes no employment estimate for this hub


class TrainingSite(BaseModel):
    id: str
    name: str
    type: str
    city: str
    state: str
    lat: float
    lng: float
    credentials: list[str]
    annual_completers: int | None
    partners: list[str]
    delivery: str
    website: str


class TechnicianPipeline(BaseModel):
    civilian_annual_completers: int
    navy_annual_trainees: int
    apprenticeship_annual: int
    annual_technician_openings: int
    site_count: int


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
    metros: list[MetroWorkforce]
    metro_source: str
    metro_fetched_at: str
    training_sites: list[TrainingSite]
    technician_pipeline: TechnicianPipeline
