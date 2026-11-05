"""Curated workforce context: state centroids, operating commercial reactors, BLS Employment
Projections (2024-34), and major nuclear employers. OEWS employment/wage values come from
the live BLS API (cached) or the bundled snapshot (bls_snapshot.json)."""

STATES = {
    "AL": ("Alabama", 32.8, -86.8), "AK": ("Alaska", 64.0, -152.0), "AZ": ("Arizona", 34.2, -111.7),
    "AR": ("Arkansas", 34.9, -92.4), "CA": ("California", 37.2, -119.5), "CO": ("Colorado", 39.0, -105.5),
    "CT": ("Connecticut", 41.6, -72.7), "DE": ("Delaware", 39.0, -75.5), "DC": ("District of Columbia", 38.9, -77.03),
    "FL": ("Florida", 28.6, -82.4), "GA": ("Georgia", 32.7, -83.4), "HI": ("Hawaii", 20.8, -156.3),
    "ID": ("Idaho", 44.4, -114.6), "IL": ("Illinois", 40.0, -89.2), "IN": ("Indiana", 39.9, -86.3),
    "IA": ("Iowa", 42.1, -93.5), "KS": ("Kansas", 38.5, -98.4), "KY": ("Kentucky", 37.5, -85.3),
    "LA": ("Louisiana", 31.1, -92.0), "ME": ("Maine", 45.4, -69.2), "MD": ("Maryland", 39.05, -76.8),
    "MA": ("Massachusetts", 42.3, -71.8), "MI": ("Michigan", 43.6, -84.7), "MN": ("Minnesota", 46.3, -94.3),
    "MS": ("Mississippi", 32.7, -89.7), "MO": ("Missouri", 38.4, -92.5), "MT": ("Montana", 47.0, -109.6),
    "NE": ("Nebraska", 41.5, -99.8), "NV": ("Nevada", 39.3, -116.6), "NH": ("New Hampshire", 43.7, -71.6),
    "NJ": ("New Jersey", 40.1, -74.7), "NM": ("New Mexico", 34.4, -106.1), "NY": ("New York", 42.9, -75.5),
    "NC": ("North Carolina", 35.5, -79.4), "ND": ("North Dakota", 47.5, -100.5), "OH": ("Ohio", 40.3, -82.8),
    "OK": ("Oklahoma", 35.6, -97.5), "OR": ("Oregon", 43.9, -120.6), "PA": ("Pennsylvania", 40.9, -77.8),
    "RI": ("Rhode Island", 41.7, -71.5), "SC": ("South Carolina", 33.9, -80.9), "SD": ("South Dakota", 44.4, -100.2),
    "TN": ("Tennessee", 35.9, -86.4), "TX": ("Texas", 31.5, -99.3), "UT": ("Utah", 39.3, -111.7),
    "VT": ("Vermont", 44.1, -72.7), "VA": ("Virginia", 37.5, -78.8), "WA": ("Washington", 47.4, -120.5),
    "WV": ("West Virginia", 38.6, -80.6), "WI": ("Wisconsin", 44.6, -89.9), "WY": ("Wyoming", 43.0, -107.5),
}

# Operating commercial power reactors by state (EIA/NRC, 2025; includes Vogtle 3&4 and Palisades restart)
OPERATING_REACTORS = {
    "AL": 5, "AZ": 3, "AR": 2, "CA": 2, "CT": 2, "FL": 4, "GA": 6, "IL": 11, "KS": 1, "LA": 2,
    "MD": 2, "MI": 4, "MN": 3, "MS": 1, "MO": 1, "NE": 1, "NH": 1, "NJ": 3, "NY": 4, "NC": 5,
    "OH": 2, "PA": 8, "SC": 7, "TN": 4, "TX": 4, "VA": 4, "WA": 1, "WI": 2,
}

PROJECTIONS = [
    {
        "occupation": "Nuclear Engineers", "key": "engineers", "soc": "17-2161",
        "base_year": 2024, "base_employment": 15400, "projected_year": 2034, "projected_employment": 15300,
        "pct_change": -1.0, "annual_openings": 800, "typical_education": "Bachelor's degree",
        "source_url": "https://www.bls.gov/ooh/architecture-and-engineering/nuclear-engineers.htm",
    },
    {
        "occupation": "Nuclear Technicians", "key": "technicians", "soc": "19-4051",
        "base_year": 2024, "base_employment": 6000, "projected_year": 2034, "projected_employment": 5500,
        "pct_change": -8.0, "annual_openings": 700, "typical_education": "Associate's degree",
        "source_url": "https://www.bls.gov/ooh/life-physical-and-social-science/nuclear-technicians.htm",
    },
]

# ORISE NE Enrollments & Degrees Survey (2022 data) — national reference
ORISE_REFERENCE = {"year": 2022, "bs": 454, "ms": 275, "phd": 211, "ug_juniors_seniors": 1470, "grad_enrollment": 1625}

# Demand scenarios for new nuclear-engineering graduates per year.
SCENARIOS = [
    {
        "key": "bls", "name": "BLS baseline", "annual_engineer_need": 800,
        "description": "BLS 2024–34 projection: ~800 nuclear engineer openings/yr, almost all replacement (retirements & transfers).",
        "basis": "Federal projection",
    },
    {
        "key": "restarts", "name": "Uprates, restarts & life extensions", "annual_engineer_need": 1100,
        "description": "Adds staffing for plant restarts (Palisades, Crane/TMI-1, Duane Arnold), 80-yr license renewals and ~2–3 GW of uprates. Derived estimate.",
        "basis": "Derived estimate",
    },
    {
        "key": "liftoff", "name": "Accelerated deployment (DOE Liftoff)", "annual_engineer_need": 1700,
        "description": "DOE 'Pathways to Commercial Liftoff: Advanced Nuclear' (2024) targets ~200 GW new capacity by 2050, ~375k added workers; engineer share derived. Derived estimate.",
        "basis": "Derived estimate",
    },
]

EMPLOYERS = [
    ("Idaho National Laboratory", "National Lab", "Idaho Falls", "ID", 43.4917, -112.0339, "Advanced reactor testing, fuels, MARVEL microreactor"),
    ("Oak Ridge National Laboratory", "National Lab", "Oak Ridge", "TN", 35.9310, -84.3100, "HFIR, isotopes, modeling & simulation"),
    ("Argonne National Laboratory", "National Lab", "Lemont", "IL", 41.7180, -87.9800, "Fast reactors, fuel cycle, reactor analysis"),
    ("Los Alamos National Laboratory", "National Lab", "Los Alamos", "NM", 35.8800, -106.3000, "Weapons science, plutonium, nuclear data"),
    ("Sandia National Laboratories", "National Lab", "Albuquerque", "NM", 35.0500, -106.5400, "Reactor safety, severe accidents, security"),
    ("Lawrence Livermore National Laboratory", "National Lab", "Livermore", "CA", 37.6880, -121.7060, "NIF fusion, stockpile stewardship"),
    ("Pacific Northwest National Laboratory", "National Lab", "Richland", "WA", 46.3430, -119.2780, "Hanford cleanup, nonproliferation, radiochemistry"),
    ("Savannah River National Laboratory", "National Lab", "Aiken", "SC", 33.3400, -81.7400, "Tritium, waste management, environmental"),
    ("Naval Nuclear Laboratory (Bettis)", "Naval", "West Mifflin", "PA", 40.3550, -79.9100, "Naval reactor design"),
    ("Naval Nuclear Laboratory (KAPL)", "Naval", "Niskayuna", "NY", 42.8200, -73.8800, "Naval reactor design"),
    ("Westinghouse Electric", "Vendor", "Cranberry Township", "PA", 40.6840, -80.1070, "AP1000, eVinci microreactor, fuel"),
    ("GE Vernova Hitachi Nuclear", "Vendor", "Wilmington", "NC", 34.3200, -77.9200, "BWRX-300 SMR, fuel"),
    ("TerraPower", "Vendor", "Bellevue", "WA", 47.6100, -122.2000, "Natrium sodium fast reactor (Kemmerer, WY)"),
    ("NuScale Power", "Vendor", "Portland", "OR", 45.5200, -122.6800, "VOYGR light-water SMR"),
    ("Kairos Power", "Vendor", "Alameda", "CA", 37.7650, -122.2400, "Fluoride-salt-cooled high-temp reactor (Hermes, TN)"),
    ("X-energy", "Vendor", "Rockville", "MD", 39.0840, -77.1530, "Xe-100 HTGR, TRISO-X fuel"),
    ("BWX Technologies", "Vendor", "Lynchburg", "VA", 37.4140, -79.1420, "Naval fuel & components, microreactors"),
    ("Framatome Inc.", "Vendor", "Lynchburg", "VA", 37.3800, -79.2000, "Fuel, services, I&C"),
    ("Constellation Energy", "Utility", "Baltimore", "MD", 39.2900, -76.6100, "Largest US nuclear fleet (21+ GW), Crane restart"),
    ("Duke Energy", "Utility", "Charlotte", "NC", 35.2270, -80.8430, "11 reactors in the Carolinas"),
    ("Southern Nuclear", "Utility", "Birmingham", "AL", 33.5200, -86.8100, "Vogtle 3&4, Hatch, Farley"),
    ("Tennessee Valley Authority", "Utility", "Chattanooga", "TN", 35.0450, -85.3100, "Browns Ferry, Sequoyah, Watts Bar, Clinch River SMR"),
    ("U.S. Nuclear Regulatory Commission", "Regulator", "Rockville", "MD", 39.0450, -77.1100, "Licensing & oversight"),
    ("Holtec International", "Vendor", "Camden", "NJ", 39.9440, -75.1200, "Palisades restart, SMR-300, spent fuel storage"),
]

# What anchors each metro hotspot (keyed by OEWS metro area code)
METRO_ANCHORS = {
    "0047260": "Norfolk Naval Shipyard, Newport News Shipbuilding, Naval Reactors field offices",
    "0047900": "NRC, DOE HQ, Naval Reactors (NAVSEA 08), X-energy, consultancies",
    "0016980": "Constellation fleet engineering, Argonne National Laboratory",
    "0038860": "Portsmouth Naval Shipyard (Kittery) submarine overhaul",
    "0040060": "Dominion Energy nuclear fleet (North Anna, Surry)",
    "0042660": "TerraPower, Boeing/defense, PNNL Seattle",
    "0016740": "Duke Energy nuclear HQ, Westinghouse/Framatome engineering offices",
    "0028940": "Oak Ridge National Laboratory, Y-12, Kairos Power, TVA (Oak Ridge hub)",
    "0028420": "Hanford Site, PNNL, Energy Northwest Columbia Station",
    "0038300": "Westinghouse HQ, Naval Nuclear Laboratory (Bettis)",
    "0024860": "Duke Energy Oconee, engineering services",
    "0017900": "Westinghouse Columbia Fuel Fabrication, V.C. Summer",
    "0045060": "Constellation Nine Mile Point & FitzPatrick",
    "0016860": "TVA Office of Nuclear Power, Sequoyah & Watts Bar",
    "0033780": "DTE Fermi 2",
    "0026620": "TVA Browns Ferry, defense/space nuclear",
    "0048900": "GE Vernova Hitachi Nuclear Energy, Global Nuclear Fuel",
    "0026820": "Idaho National Laboratory — the nation's lead nuclear R&D lab",
    "0012260": "Savannah River Site, SRNL, Plant Vogtle",
    "0016700": "Naval Nuclear Power Training Command, Charleston Naval Weapons Station",
}

# Known nuclear hubs where BLS publishes no metro estimate — shown as 'suppressed' hotspots.
SUPPRESSED_HUBS = [
    {"code": "0010740", "name": "Albuquerque, NM", "lat": 35.1, "lng": -106.65, "anchor": "Sandia National Laboratories, Kirtland AFB"},
    {"code": "0042140", "name": "Santa Fe, NM", "lat": 35.69, "lng": -105.94, "anchor": "Los Alamos National Laboratory (Los Alamos County commute shed)"},
    {"code": "0031340", "name": "Lynchburg, VA", "lat": 37.41, "lng": -79.14, "anchor": "BWX Technologies, Framatome Inc. HQ"},
]
