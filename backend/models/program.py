from pydantic import BaseModel


class EnrollmentPoint(BaseModel):
    year: int
    total: int


class GraduatesPoint(BaseModel):
    year: int
    bs: int
    ms: int
    phd: int
    total: int


class ResearchReactor(BaseModel):
    name: str
    type: str
    power_kw: float


class Program(BaseModel):
    id: str
    name: str
    short_name: str
    department: str
    city: str
    state: str
    region: str
    lat: float
    lng: float
    established: int
    website: str
    ug_enrollment: int
    grad_enrollment: int
    total_enrollment: int
    growth_1y: float
    growth_5y: float
    growth_10y: float
    annual_bs: int
    annual_ms: int
    annual_phd: int
    annual_degrees: int
    enrollment_history: list[EnrollmentPoint]
    graduates_by_year: list[GraduatesPoint]
    budget_musd: float
    research_expenditure_musd: float
    placement_rate: float
    median_starting_salary: int | None
    research_reactor: ResearchReactor | None
    degrees: list[str]
    abet_accredited: bool
    us_news_rank: int | None
    faculty: int
    students_per_faculty: float | None
    tuition_in_state: int | None
    tuition_out_state: int | None
    research_focus: list[str]
    partners: list[str]
    estimate_fields: list[str]
    data_year: int


class SourceRef(BaseModel):
    label: str
    url: str


class OriseReference(BaseModel):
    year: int
    bs: int
    ms: int
    phd: int
    ug_juniors_seniors: int
    grad_enrollment: int


class ProgramsSummary(BaseModel):
    program_count: int
    states_count: int
    total_enrollment: int
    ug_enrollment: int
    grad_enrollment: int
    annual_bs: int
    annual_ms: int
    annual_phd: int
    research_reactors: int
    total_budget_musd: float
    avg_placement_rate: float
    avg_growth_5y: float
    enrollment_by_year: list[EnrollmentPoint]
    graduates_by_year: list[GraduatesPoint]
    orise_reference: OriseReference
    sources: list[SourceRef]
