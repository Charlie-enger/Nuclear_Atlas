"""Curated dataset of US nuclear engineering programs (AY 2023-24 reference year).

Values are compiled from public sources (ORISE NE Enrollments & Degrees survey totals,
NCES IPEDS completions, NRC research & test reactor list, US News graduate rankings,
department fact pages). Program-level enrollment/degree splits, budgets and placement
rates are calibrated estimates where institutions do not publish exact figures — each
program carries `estimate_fields` so the UI can label them.
"""

REF_YEAR = 2024

# (id, name, short, department, city, state, lat, lng, established,
#  ug_enroll, grad_enroll, growth_1y%, growth_5y%, growth_10y%, bs/yr, ms/yr, phd/yr,
#  budget $M, research expenditure $M, placement %, median starting salary,
#  reactor (name, type, power_kw) | None, degrees, abet, us_news_rank, faculty,
#  tuition_in, tuition_out, research focus, partners, website)
_RAW = [
    ("mit", "Massachusetts Institute of Technology", "MIT", "Dept. of Nuclear Science & Engineering", "Cambridge", "MA", 42.3601, -71.0942, 1958,
     62, 165, 4.1, 12.5, 21.0, 15, 22, 25, 78, 62, 97, 98000, ("MITR-II", "Tank-type, light-water cooled", 6000),
     ["BS", "MS", "MEng", "PhD"], True, 1, 26, 62396, 62396, ["Fusion & plasma", "Advanced fission reactors", "Nuclear materials", "Nonproliferation"], ["Commonwealth Fusion Systems", "INL", "Sandia"], "https://web.mit.edu/nse/"),
    ("umich", "University of Michigan", "Michigan", "Nuclear Engineering & Radiological Sciences (NERS)", "Ann Arbor", "MI", 42.2936, -83.7130, 1953,
     175, 172, 3.2, 14.8, 27.5, 30, 25, 22, 62, 48, 95, 92000, None,
     ["BSE", "MSE", "PhD"], True, 2, 31, 17736, 58072, ["Radiation detection", "Plasma science", "Reactor physics", "Nuclear materials"], ["ORNL", "INL", "Consortium for Monitoring, Technology & Verification"], "https://ners.engin.umich.edu/"),
    ("tamu", "Texas A&M University", "Texas A&M", "Dept. of Nuclear Engineering", "College Station", "TX", 30.6187, -96.3365, 1958,
     410, 205, 6.4, 22.0, 41.0, 55, 30, 18, 46, 34, 95, 85000, ("NSC TRIGA Mark I", "TRIGA pool-type", 1000),
     ["BS", "MS", "MEng", "PhD"], True, 3, 32, 13239, 40607, ["Reactor safety & thermal hydraulics", "Nonproliferation & safeguards", "Health physics", "Microreactors"], ["Los Alamos", "Sandia", "Texas Nuclear Security Consortium"], "https://engineering.tamu.edu/nuclear/"),
    ("ncsu", "North Carolina State University", "NC State", "Dept. of Nuclear Engineering", "Raleigh", "NC", 35.7847, -78.6821, 1950,
     255, 142, 5.2, 18.3, 34.8, 40, 15, 14, 41, 30, 94, 84000, ("PULSTAR", "Pool-type", 1000),
     ["BS", "MS", "MNE", "PhD"], True, 4, 23, 9101, 32029, ["Reactor physics & simulation", "Thermal hydraulics", "Radiation detection", "Isotope production"], ["Duke Energy", "Framatome", "CASL/ORNL"], "https://ne.ncsu.edu/"),
    ("uwisc", "University of Wisconsin–Madison", "Wisconsin", "Dept. of Nuclear Engineering & Engineering Physics", "Madison", "WI", 43.0766, -89.4125, 1958,
     140, 112, 2.1, 6.0, 12.3, 18, 12, 14, 31, 24, 93, 86000, ("UWNR", "TRIGA pool-type", 1000),
     ["BS", "MS", "PhD"], True, 5, 19, 11205, 40603, ["Fusion technology", "Nuclear materials", "Thermal hydraulics", "Plasma physics"], ["INL", "Realta Fusion", "SHINE Technologies"], "https://directory.engr.wisc.edu/ep/"),
    ("uiuc", "University of Illinois Urbana-Champaign", "Illinois", "Nuclear, Plasma & Radiological Engineering (NPRE)", "Urbana", "IL", 40.1106, -88.2272, 1958,
     215, 118, 3.8, 10.4, 22.1, 30, 12, 14, 30, 22, 92, 85000, None,
     ["BS", "MS", "MEng", "PhD"], True, 6, 21, 17640, 36018, ["Plasma & fusion", "Radiological science", "Power & safety", "Materials"], ["Argonne", "Constellation", "Fermilab"], "https://npre.illinois.edu/"),
    ("gatech", "Georgia Institute of Technology", "Georgia Tech", "Nuclear & Radiological Engineering Program (ME)", "Atlanta", "GA", 33.7756, -84.3963, 1962,
     158, 92, 3.9, 8.1, 10.2, 20, 12, 10, 28, 20, 93, 84000, None,
     ["BS", "MS", "PhD"], True, 7, 18, 12682, 33794, ["Reactor physics & computation", "Medical physics", "Fusion", "Fuel cycle"], ["Southern Nuclear", "Kairos Power", "ORNL"], "https://www.me.gatech.edu/nuclear"),
    ("berkeley", "University of California, Berkeley", "UC Berkeley", "Dept. of Nuclear Engineering", "Berkeley", "CA", 37.8719, -122.2585, 1958,
     128, 102, 5.0, 14.2, 25.4, 18, 12, 14, 36, 28, 94, 95000, None,
     ["BS", "MS", "MEng", "PhD"], True, 8, 17, 15891, 48465, ["Advanced reactors (FHR/molten salt)", "Fusion", "Nonproliferation", "Nuclear waste"], ["LLNL", "LBNL", "Kairos Power"], "https://nuc.berkeley.edu/"),
    ("psu", "Pennsylvania State University", "Penn State", "Ken & Mary Alice Lindquist Dept. of Nuclear Engineering", "University Park", "PA", 40.7982, -77.8599, 1959,
     228, 108, 3.1, 9.6, 15.0, 30, 12, 10, 32, 23, 92, 82000, ("Breazeale Reactor", "TRIGA pool-type (oldest operating US university reactor)", 1000),
     ["BS", "MS", "MEng", "PhD"], True, 9, 21, 19672, 40148, ["Reactor dynamics", "Radiation science", "Fuel performance", "Microreactors"], ["Westinghouse", "Naval Reactors", "Constellation"], "https://www.nuce.psu.edu/"),
    ("purdue", "Purdue University", "Purdue", "School of Nuclear Engineering", "West Lafayette", "IN", 40.4237, -86.9212, 1958,
     226, 98, 4.8, 15.9, 24.3, 30, 10, 10, 29, 21, 93, 84000, ("PUR-1", "Pool-type, first all-digital I&C US reactor", 12),
     ["BS", "MS", "PhD"], True, 10, 18, 9992, 28794, ["Digital instrumentation & control", "Thermal hydraulics", "Fusion materials", "Nuclear security"], ["Argonne", "Duke Energy", "Rolls-Royce"], "https://engineering.purdue.edu/NE"),
    ("utk", "University of Tennessee, Knoxville", "Tennessee", "Dept. of Nuclear Engineering", "Knoxville", "TN", 35.9544, -83.9295, 1957,
     305, 132, 7.2, 25.0, 45.2, 40, 18, 15, 37, 28, 95, 83000, None,
     ["BS", "MS", "PhD"], True, 11, 26, 13244, 32505, ["Radiation transport & detection", "Reliability & I&C", "Fuel cycle & materials", "Fusion"], ["ORNL", "TVA", "Kairos Power"], "https://ne.utk.edu/"),
    ("rpi", "Rensselaer Polytechnic Institute", "RPI", "Mechanical, Aerospace & Nuclear Engineering", "Troy", "NY", 42.7298, -73.6789, 1958,
     118, 68, 1.2, 4.0, 8.0, 12, 6, 6, 18, 12, 92, 83000, ("Walthousen RCF", "Zero-power critical facility", 0.1),
     ["BS", "MS", "MEng", "PhD"], True, 12, 13, 63400, 63400, ["Reactor physics", "Medical imaging", "Thermal hydraulics"], ["Naval Nuclear Lab (KAPL)", "NRC"], "https://mane.rpi.edu/"),
    ("ufl", "University of Florida", "Florida", "Nuclear Engineering Program (MSE)", "Gainesville", "FL", 29.6436, -82.3549, 1957,
     148, 82, 2.8, 7.9, 5.0, 18, 8, 8, 22, 15, 90, 80000, ("UFTR", "Argonaut-type", 100),
     ["BS", "MS", "PhD"], True, 13, 15, 6380, 28658, ["Radiation detection", "Medical physics", "Fuel performance"], ["Florida Power & Light", "INL"], "https://mse.ufl.edu/nuclear/"),
    ("osu-or", "Oregon State University", "Oregon State", "School of Nuclear Science & Engineering", "Corvallis", "OR", 44.5646, -123.2620, 1958,
     255, 90, 6.1, 20.4, 30.0, 25, 12, 7, 24, 17, 92, 80000, ("OSTR", "TRIGA Mark II", 1100),
     ["BS", "MS", "PhD", "Radiation Health Physics"], True, 14, 17, 13950, 38120, ["SMR thermal hydraulics (NuScale)", "Radiation health physics", "Nuclear security"], ["NuScale Power", "PNNL", "INL"], "https://ne.oregonstate.edu/"),
    ("mst", "Missouri University of Science & Technology", "Missouri S&T", "Nuclear Engineering & Radiation Science", "Rolla", "MO", 37.9537, -91.7724, 1961,
     128, 40, 4.0, 12.0, 18.0, 15, 6, 3, 10, 6, 90, 78000, ("MSTR", "Pool-type", 200),
     ["BS", "MS", "PhD"], True, None, 10, 11700, 31800, ["Reactor operations", "Radiation measurement", "Fuel cycle"], ["Ameren Missouri", "Westinghouse"], "https://nuclear.mst.edu/"),
    ("mizzou", "University of Missouri", "Mizzou (MURR)", "Nuclear Science & Engineering Institute", "Columbia", "MO", 38.9404, -92.3277, 1964,
     0, 62, 2.0, 6.0, 10.0, 0, 6, 6, 15, 10, 92, 85000, ("MURR", "Tank-in-pool (highest-power US university reactor)", 10000),
     ["MS", "PhD", "Grad Certificate"], False, None, 9, 12600, 32000, ["Medical isotope production", "Neutron science", "Health physics"], ["NorthStar Medical Radioisotopes", "NNSA"], "https://engineering.missouri.edu/nsei/"),
    ("vt", "Virginia Tech", "Virginia Tech", "Nuclear Engineering Program (ME)", "Blacksburg", "VA", 37.2284, -80.4234, 2007,
     92, 70, 8.3, 30.1, 60.0, 10, 10, 5, 14, 9, 91, 82000, None,
     ["BS (option)", "MS", "MEng", "PhD"], True, None, 12, 14700, 36100, ["Reactor physics", "Nuclear security", "Naval nuclear"], ["BWX Technologies", "Framatome", "Dominion Energy"], "https://www.me.vt.edu/research/nuclear.html"),
    ("ohio-state", "The Ohio State University", "Ohio State", "Nuclear Engineering Program (MAE)", "Columbus", "OH", 39.9985, -83.0154, 1960,
     0, 72, 2.5, 7.5, 12.0, 0, 10, 6, 12, 8, 91, 84000, ("OSURR", "Pool-type", 500),
     ["MS", "PhD", "Undergrad minor"], False, None, 10, 12859, 38365, ["Reliability & risk (PRA)", "Radiation detection", "Fuel cycle"], ["Energy Harbor", "BWXT", "INL"], "https://mae.osu.edu/nuclear-engineering"),
    ("isu", "Idaho State University", "Idaho State", "Dept. of Nuclear Engineering & Health Physics", "Pocatello", "ID", 42.8620, -112.4300, 1984,
     108, 48, 3.0, 10.0, 15.0, 12, 6, 2, 9, 5, 93, 76000, ("AGN-201", "Low-power training reactor", 0.005),
     ["BS", "MS", "PhD", "Health Physics"], True, None, 9, 8064, 26136, ["Health physics", "Reactor operations", "Accelerator applications"], ["INL", "Bechtel"], "https://www.isu.edu/nuclear/"),
    ("uidaho", "University of Idaho (Idaho Falls)", "U of Idaho", "Nuclear Engineering & Industrial Management", "Idaho Falls", "ID", 43.4917, -112.0339, 1972,
     0, 52, 4.0, 10.0, 14.0, 0, 10, 4, 7, 4, 94, 85000, None,
     ["MS", "MEng", "PhD"], False, None, 8, 9100, 28400, ["Advanced reactor design", "Nuclear criticality safety", "Fuel cycle"], ["INL / Center for Advanced Energy Studies"], "https://www.uidaho.edu/engr/departments/nuclear-engineering"),
    ("unm", "University of New Mexico", "New Mexico", "Dept. of Nuclear Engineering", "Albuquerque", "NM", 35.0843, -106.6198, 1960,
     110, 60, 2.0, 5.0, 10.0, 10, 6, 4, 10, 7, 90, 80000, ("AGN-201M", "Low-power training reactor", 0.005),
     ["BS", "MS", "PhD"], True, None, 11, 9200, 27200, ["Radiation effects", "Plasma", "Nuclear criticality safety", "Waste management"], ["Sandia", "Los Alamos", "WIPP"], "https://ne.unm.edu/"),
    ("ksu", "Kansas State University", "Kansas State", "Mechanical & Nuclear Engineering", "Manhattan", "KS", 39.1836, -96.5717, 1958,
     62, 38, 2.2, 6.5, 9.0, 8, 5, 3, 8, 5, 91, 78000, ("KSU TRIGA Mark II", "TRIGA pool-type", 1250),
     ["BS (option)", "MS", "PhD"], True, None, 7, 10500, 27600, ["Semiconductor neutron detectors", "Radiation transport", "Reactor operations"], ["Wolf Creek", "Kansas City National Security Campus"], "https://www.mne.k-state.edu/"),
    ("utah", "University of Utah", "Utah", "Nuclear Engineering Program (Civil & Env.)", "Salt Lake City", "UT", 40.7649, -111.8421, 1975,
     0, 46, 3.5, 9.0, 14.0, 0, 8, 4, 8, 5, 90, 80000, ("UUTR", "TRIGA Mark I", 100),
     ["MS", "PhD", "Undergrad minor"], False, None, 6, 9800, 31900, ["Nuclear forensics", "Radiochemistry", "Radiation detection"], ["INL", "DTRA"], "https://www.nuclear.utah.edu/"),
    ("uml", "University of Massachusetts Lowell", "UMass Lowell", "Nuclear Engineering Program (ME)", "Lowell", "MA", 42.6544, -71.3247, 1975,
     52, 30, 2.0, 5.5, 8.0, 8, 5, 2, 8, 5, 90, 82000, ("UMLRR", "Pool-type", 1000),
     ["BS (option)", "MS", "PhD"], True, None, 7, 16500, 36100, ["Radiation hardness testing", "Reactor physics", "Medical isotopes"], ["Holtec", "Naval Nuclear Lab"], "https://www.uml.edu/engineering/mechanical/nuclear/"),
    ("uc", "University of Cincinnati", "Cincinnati", "Nuclear Engineering (Mechanical & Materials)", "Cincinnati", "OH", 39.1329, -84.5150, 1960,
     45, 36, 1.5, 4.0, 6.0, 6, 6, 3, 7, 4, 89, 78000, None,
     ["BS (option)", "MS", "PhD"], False, None, 6, 12000, 27300, ["Health physics", "Thermal hydraulics", "Nuclear criticality"], ["Fernald legacy cleanup", "GE Aerospace"], "https://ceas.uc.edu/academics/departments/mechanical-materials-engineering.html"),
    ("utexas", "University of Texas at Austin", "UT Austin", "Nuclear & Radiation Engineering Program (ME)", "Austin", "TX", 30.2849, -97.7341, 1963,
     0, 54, 4.5, 12.0, 15.0, 0, 8, 5, 14, 10, 93, 86000, ("NETL TRIGA Mark II", "TRIGA pool-type", 1100),
     ["MS", "PhD", "BS option (ME)"], False, None, 8, 11700, 41100, ["Nuclear security & forensics", "Neutron imaging", "Radiation detection"], ["Sandia", "Los Alamos", "NNSA"], "https://www.me.utexas.edu/research/areas/nuclear-radiation-engineering"),
    ("sc", "University of South Carolina", "South Carolina", "Nuclear Engineering Program (ME)", "Columbia", "SC", 33.9940, -81.0270, 2004,
     70, 42, 9.0, 32.0, 48.0, 8, 5, 3, 9, 6, 92, 80000, None,
     ["BS", "MS", "ME", "PhD"], True, None, 9, 12688, 34934, ["Fuel cycle & materials", "Thermal hydraulics", "Nuclear forensics"], ["Savannah River National Lab", "Westinghouse Columbia Fuel Fab", "Dominion Energy"], "https://sc.edu/study/colleges_schools/engineering_and_computing/"),
    ("scsu", "South Carolina State University", "SC State", "Nuclear Engineering Program (HBCU)", "Orangeburg", "SC", 33.4980, -80.8536, 2008,
     38, 0, 3.0, 8.0, 12.0, 6, 0, 0, 3, 1.5, 90, 72000, None,
     ["BS"], True, None, 4, 10948, 20768, ["Health physics", "Reactor operations", "Workforce pipeline"], ["Savannah River Site", "Duke Energy"], "https://www.scsu.edu/"),
    ("mines", "Colorado School of Mines", "Colorado Mines", "Nuclear Science & Engineering Program", "Golden", "CO", 39.7510, -105.2226, 2008,
     0, 44, 4.0, 11.0, 20.0, 0, 8, 4, 8, 5, 92, 85000, None,
     ["MS", "PhD", "Undergrad minor"], False, None, 8, 20990, 43280, ["Fuel cycle & radiochemistry", "Nuclear materials", "Mining/uranium"], ["USGS TRIGA (Denver)", "NREL", "INL"], "https://nuclear.mines.edu/"),
    ("usna", "United States Naval Academy", "Naval Academy", "Mechanical & Nuclear Engineering Dept.", "Annapolis", "MD", 38.9827, -76.4840, 1980,
     85, 0, 1.0, 3.0, 5.0, 20, 0, 0, 6, 1.5, 100, 0, None,
     ["BS"], True, None, 10, 0, 0, ["Naval propulsion", "Reactor engineering", "Radiation"], ["Naval Reactors", "Naval Nuclear Lab"], "https://www.usna.edu/MechNuclear/"),
    ("usma", "United States Military Academy", "West Point", "Dept. of Physics & Nuclear Engineering", "West Point", "NY", 41.3915, -73.9560, 1997,
     45, 0, 1.0, 4.0, 6.0, 10, 0, 0, 4, 1, 100, 0, None,
     ["BS"], True, None, 8, 0, 0, ["Nuclear weapons effects", "Counter-WMD", "Reactor fundamentals"], ["DTRA", "Army Nuclear & CWMD Agency"], "https://www.westpoint.edu/academics/academic-departments/physics-and-nuclear-engineering"),
    ("acu", "Abilene Christian University", "Abilene Christian", "NEXT Lab — Engineering & Physics", "Abilene", "TX", 32.4687, -99.7096, 2016,
     30, 0, 12.0, 40.0, 60.0, 5, 0, 0, 6, 4.5, 90, 75000, ("MSRR (construction permit 2022)", "Molten salt research reactor — under development", 1000),
     ["BS Engineering (nuclear focus)"], False, None, 6, 41000, 41000, ["Molten salt reactors", "Salt chemistry"], ["Natura Resources", "ORNL"], "https://www.acu.edu/next-lab.html"),
]

ESTIMATE_FIELDS = [
    "ug_enrollment", "grad_enrollment", "growth", "graduates_by_year",
    "budget_musd", "research_expenditure_musd", "placement_rate", "median_starting_salary",
]

SOURCES = [
    {"label": "ORISE Nuclear Engineering Enrollments & Degrees Survey (national totals)", "url": "https://orise.orau.gov/stem/workforce-studies/nuclear-engineering-enrollments.html"},
    {"label": "NCES IPEDS completions (CIP 14.2301)", "url": "https://nces.ed.gov/ipeds/"},
    {"label": "NRC Research & Test Reactors list", "url": "https://www.nrc.gov/reactors/non-power.html"},
    {"label": "US News Best Nuclear Engineering Programs", "url": "https://www.usnews.com/best-graduate-schools/top-engineering-schools/nuclear-engineering-rankings"},
]

REGIONS = {
    "Northeast": {"MA", "NY", "PA", "MD", "CT", "NJ", "NH", "VT", "ME", "RI", "DE", "DC"},
    "Southeast": {"NC", "SC", "GA", "FL", "TN", "VA", "AL", "MS", "KY", "WV", "AR", "LA"},
    "Midwest": {"MI", "IL", "IN", "OH", "WI", "MN", "IA", "MO", "KS", "NE", "ND", "SD"},
    "Southwest": {"TX", "NM", "AZ", "OK"},
    "West": {"CA", "OR", "WA", "ID", "UT", "CO", "NV", "MT", "WY", "AK", "HI"},
}


def region_of(state: str) -> str:
    return next((r for r, s in REGIONS.items() if state in s), "Other")


def _interp_enrollment(total: int, g1: float, g5: float, g10: float) -> list[dict]:
    """Anchor points from growth rates (2014, 2019, 2023, 2024) with linear interpolation."""
    anchors = {
        REF_YEAR - 10: total / (1 + g10 / 100),
        REF_YEAR - 5: total / (1 + g5 / 100),
        REF_YEAR - 1: total / (1 + g1 / 100),
        REF_YEAR: float(total),
    }
    years = sorted(anchors)
    out = []
    for y in range(REF_YEAR - 10, REF_YEAR + 1):
        lo = max(a for a in years if a <= y)
        hi = min(a for a in years if a >= y)
        v = anchors[lo] if lo == hi else anchors[lo] + (anchors[hi] - anchors[lo]) * (y - lo) / (hi - lo)
        out.append({"year": y, "total": round(v)})
    return out


def _graduates(enroll_hist: list[dict], bs: int, ms: int, phd: int, seed: int) -> list[dict]:
    """Degrees by year scaled to the enrollment trend (lagged), with small deterministic variation."""
    latest = enroll_hist[-1]["total"] or 1
    out = []
    for i, row in enumerate(enroll_hist):
        lag = enroll_hist[max(0, i - 1)]["total"]
        f = lag / latest
        wobble = 1 + (((seed * 31 + i * 17) % 9) - 4) / 100
        b, m, p = round(bs * f * wobble), round(ms * f * wobble), round(phd * f * (2 - wobble))
        out.append({"year": row["year"], "bs": b, "ms": m, "phd": p, "total": b + m + p})
    out[-1] = {"year": REF_YEAR, "bs": bs, "ms": ms, "phd": phd, "total": bs + ms + phd}
    return out


def _build(idx: int, r: tuple) -> dict:
    (pid, name, short, dept, city, st, lat, lng, est, ug, grad, g1, g5, g10, bs, ms, phd,
     budget, rexp, placement, salary, reactor, degrees, abet, rank, faculty, tin, tout,
     focus, partners, site) = r
    total = ug + grad
    hist = _interp_enrollment(total, g1, g5, g10)
    return {
        "id": pid, "name": name, "short_name": short, "department": dept, "city": city, "state": st,
        "region": region_of(st), "lat": lat, "lng": lng, "established": est, "website": site,
        "ug_enrollment": ug, "grad_enrollment": grad, "total_enrollment": total,
        "growth_1y": g1, "growth_5y": g5, "growth_10y": g10,
        "annual_bs": bs, "annual_ms": ms, "annual_phd": phd, "annual_degrees": bs + ms + phd,
        "enrollment_history": hist, "graduates_by_year": _graduates(hist, bs, ms, phd, idx),
        "budget_musd": budget, "research_expenditure_musd": rexp,
        "placement_rate": placement, "median_starting_salary": salary or None,
        "research_reactor": {"name": reactor[0], "type": reactor[1], "power_kw": reactor[2]} if reactor else None,
        "degrees": degrees, "abet_accredited": abet, "us_news_rank": rank, "faculty": faculty,
        "students_per_faculty": round(total / faculty, 1) if faculty else None,
        "tuition_in_state": tin or None, "tuition_out_state": tout or None,
        "research_focus": focus, "partners": partners,
        "estimate_fields": ESTIMATE_FIELDS, "data_year": REF_YEAR,
    }


PROGRAMS: list[dict] = [_build(i, r) for i, r in enumerate(_RAW)]
PROGRAMS_BY_ID = {p["id"]: p for p in PROGRAMS}
