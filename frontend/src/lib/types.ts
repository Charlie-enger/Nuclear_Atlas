// Hand-written mirrors of backend/models/program.py and backend/models/workforce.py — keep in sync.

export interface EnrollmentPoint { year: number; total: number }
export interface GraduatesPoint { year: number; bs: number; ms: number; phd: number; total: number }
export interface ResearchReactor { name: string; type: string; power_kw: number }

export interface Program {
  id: string;
  name: string;
  short_name: string;
  department: string;
  city: string;
  state: string;
  region: string;
  lat: number;
  lng: number;
  established: number;
  website: string;
  ug_enrollment: number;
  grad_enrollment: number;
  total_enrollment: number;
  growth_1y: number;
  growth_5y: number;
  growth_10y: number;
  annual_bs: number;
  annual_ms: number;
  annual_phd: number;
  annual_degrees: number;
  enrollment_history: EnrollmentPoint[];
  graduates_by_year: GraduatesPoint[];
  budget_musd: number;
  research_expenditure_musd: number;
  placement_rate: number;
  median_starting_salary: number | null;
  research_reactor: ResearchReactor | null;
  degrees: string[];
  abet_accredited: boolean;
  us_news_rank: number | null;
  faculty: number;
  students_per_faculty: number | null;
  tuition_in_state: number | null;
  tuition_out_state: number | null;
  research_focus: string[];
  partners: string[];
  estimate_fields: string[];
  data_year: number;
}

export interface SourceRef { label: string; url: string }

export interface OriseReference {
  year: number;
  bs: number;
  ms: number;
  phd: number;
  ug_juniors_seniors: number;
  grad_enrollment: number;
}

export interface ProgramsSummary {
  program_count: number;
  states_count: number;
  total_enrollment: number;
  ug_enrollment: number;
  grad_enrollment: number;
  annual_bs: number;
  annual_ms: number;
  annual_phd: number;
  research_reactors: number;
  total_budget_musd: number;
  avg_placement_rate: number;
  avg_growth_5y: number;
  enrollment_by_year: EnrollmentPoint[];
  graduates_by_year: GraduatesPoint[];
  orise_reference: OriseReference;
  sources: SourceRef[];
}

export interface OccupationStats {
  employment: number | null;
  mean_wage: number | null;
  median_wage: number | null;
}

export interface Projection {
  occupation: string;
  key: string;
  soc: string;
  base_year: number;
  base_employment: number;
  projected_year: number;
  projected_employment: number;
  pct_change: number;
  annual_openings: number;
  typical_education: string;
  source_url: string;
}

export interface Scenario {
  key: string;
  name: string;
  annual_engineer_need: number;
  description: string;
  basis: string;
  annual_gap: number;
}

export interface StateWorkforce {
  code: string;
  name: string;
  lat: number;
  lng: number;
  engineers: OccupationStats;
  technicians: OccupationStats;
  operating_reactors: number;
  programs_count: number;
  annual_ne_degrees: number;
  est_engineer_openings: number | null;
  est_technician_openings: number | null;
  supply_balance: number | null;
  employers_count: number;
}

export interface Employer {
  name: string;
  type: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  focus: string;
}

export interface Pipeline {
  annual_bs: number;
  annual_ms: number;
  annual_phd: number;
  annual_degrees: number;
  orise_reference: OriseReference;
}

export interface MetroWorkforce {
  code: string;
  name: string;
  lat: number;
  lng: number;
  ne_employment: number | null;
  ne_mean_wage: number | null;
  ne_location_quotient: number | null;
  tech_employment: number | null;
  anchor: string | null;
  suppressed: boolean;
}

export interface TrainingSite {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  credentials: string[];
  annual_completers: number | null;
  partners: string[];
  delivery: string;
  website: string;
}

export interface TechnicianPipeline {
  civilian_annual_completers: number;
  navy_annual_trainees: number;
  apprenticeship_annual: number;
  annual_technician_openings: number;
  site_count: number;
}

export interface Workforce {
  source: string;
  data_year: number | null;
  fetched_at: string;
  is_live_cache: boolean;
  message: string | null;
  national: { engineers: OccupationStats; technicians: OccupationStats };
  projections: Projection[];
  scenarios: Scenario[];
  pipeline: Pipeline;
  states: StateWorkforce[];
  employers: Employer[];
  metros: MetroWorkforce[];
  metro_source: string;
  metro_fetched_at: string;
  training_sites: TrainingSite[];
  technician_pipeline: TechnicianPipeline;
}
