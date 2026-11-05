"""Technician supply: two-year nuclear technology programs, Navy nuclear training, shipyard apprenticeships.

Annual completer counts are estimates compiled from college catalogs/IPEDS (CIP 15.0505 nuclear
engineering technology, 41.0205 nuclear/industrial radiologic technology) and Navy public material.
"""

# (id, name, type, city, state, lat, lng, credentials, annual_completers | None, partners, delivery, website)
_RAW = [
    ("nnptc", "Naval Nuclear Power Training Command (Nuclear Field 'A' School & Nuclear Power School)", "Navy Nuclear Training", "Goose Creek", "SC", 32.9850, -80.0300,
     ["Nuclear Field 'A' School (MM / EM / ET)", "Nuclear Power School (officer & enlisted)"], 3000, ["Naval Reactors"], "Residential (military)", "https://www.netc.navy.mil/NNPTC/"),
    ("nptu-charleston", "Nuclear Power Training Unit Charleston (moored training ships)", "Navy Nuclear Training", "Goose Creek", "SC", 32.9420, -79.9400,
     ["Prototype reactor operator qualification"], None, ["Naval Reactors"], "Residential (military)", "https://www.netc.navy.mil/NNPTC/"),
    ("nptu-ballston", "Nuclear Power Training Unit Ballston Spa (Kesselring Site)", "Navy Nuclear Training", "West Milton", "NY", 43.0310, -73.9380,
     ["Prototype reactor operator qualification"], None, ["Naval Reactors", "Naval Nuclear Laboratory"], "Residential (military)", "https://www.navalnuclearlab.energy.gov/"),
    ("apprentice-nns", "The Apprentice School — Newport News Shipbuilding", "Shipyard Apprenticeship", "Newport News", "VA", 36.9850, -76.4330,
     ["Nuclear test technician apprenticeship", "Radiological control technician"], 60, ["HII Newport News Shipbuilding"], "Paid apprenticeship", "https://www.as.edu/"),
    ("aiken-tech", "Aiken Technical College", "Community / Technical College", "Graniteville", "SC", 33.5390, -81.8270,
     ["AAS Radiation Protection Technology", "Nuclear Quality Systems certificate"], 40, ["Savannah River Site", "Plant Vogtle"], "On campus", "https://www.atc.edu/"),
    ("augusta-tech", "Augusta Technical College", "Community / Technical College", "Augusta", "GA", 33.4480, -82.0410,
     ["Nuclear Engineering Technology (AAS)"], 30, ["Southern Nuclear — Plant Vogtle", "Savannah River Site"], "On campus", "https://www.augustatech.edu/"),
    ("cvcc", "Central Virginia Community College", "Community / Technical College", "Lynchburg", "VA", 37.3700, -79.1880,
     ["AAS Nuclear Technology"], 25, ["BWX Technologies", "Framatome"], "On campus", "https://www.centralvirginia.edu/"),
    ("lakeshore-tc", "Lakeshore Technical College", "Community / Technical College", "Cleveland", "WI", 43.9180, -87.7540,
     ["AAS Nuclear Technology"], 20, ["NextEra Point Beach"], "On campus", "https://gotoltc.edu/"),
    ("state-tech-mo", "State Technical College of Missouri", "Community / Technical College", "Linn", "MO", 38.4770, -91.8530,
     ["AAS Nuclear Technology"], 25, ["Ameren Callaway Energy Center"], "On campus", "https://www.statetechmo.edu/"),
    ("chattanooga-state", "Chattanooga State Community College", "Community / Technical College", "Chattanooga", "TN", 35.1010, -85.2400,
     ["AAS Nuclear Power Technology", "Radiation Protection concentration"], 35, ["TVA Sequoyah & Watts Bar"], "On campus", "https://www.chattanoogastate.edu/"),
    ("cbc", "Columbia Basin College", "Community / Technical College", "Pasco", "WA", 46.2630, -119.1150,
     ["AAS Nuclear Technology (operations, radiation protection)"], 30, ["Energy Northwest — Columbia Station", "Hanford Site"], "On campus", "https://www.columbiabasin.edu/"),
    ("isu-estec", "Idaho State University — Energy Systems Technology & Education Center", "Community / Technical College", "Pocatello", "ID", 42.8750, -112.4450,
     ["AAS Nuclear Operations Technology", "AAS Radiation Safety Technology", "Instrumentation & control"], 50, ["Idaho National Laboratory", "Idaho Power"], "On campus", "https://www.isu.edu/estec/"),
    ("bismarck-state", "Bismarck State College", "Community / Technical College", "Bismarck", "ND", 46.8270, -100.8100,
     ["AAS Nuclear Power Technology (online)", "Radiation Protection Technology"], 60, ["Utilities nationwide (distance learning)"], "Online", "https://bismarckstate.edu/"),
    ("atu", "Arkansas Tech University — Russellville", "Community / Technical College", "Russellville", "AR", 35.2940, -93.1370,
     ["AAS Nuclear Technology"], 25, ["Entergy Arkansas Nuclear One"], "On campus", "https://www.atu.edu/"),
    ("trcc", "Three Rivers Community College", "Community / Technical College", "Norwich", "CT", 41.5530, -72.0880,
     ["AS Nuclear Engineering Technology"], 20, ["Dominion Millstone", "General Dynamics Electric Boat"], "On campus", "https://threerivers.edu/"),
    ("salem-cc", "Salem Community College", "Community / Technical College", "Carneys Point", "NJ", 39.7110, -75.4690,
     ["AAS Nuclear Energy Technology"], 20, ["PSEG Salem / Hope Creek"], "On campus", "https://www.salemcc.edu/"),
    ("luzerne-ccc", "Luzerne County Community College", "Community / Technical College", "Nanticoke", "PA", 41.2010, -76.0010,
     ["AAS Nuclear Engineering Technology"], 20, ["Talen Energy — Susquehanna"], "On campus", "https://www.luzerne.edu/"),
    ("lmc", "Lake Michigan College", "Community / Technical College", "Benton Harbor", "MI", 42.1080, -86.4220,
     ["AAS Energy Production Technology — Nuclear"], 20, ["AEP D.C. Cook", "Holtec Palisades"], "On campus", "https://www.lakemichigancollege.edu/"),
    ("lakeland-cc", "Lakeland Community College", "Community / Technical College", "Kirtland", "OH", 41.6390, -81.3650,
     ["AAS Nuclear Engineering Technology"], 15, ["Vistra — Perry Nuclear"], "On campus", "https://www.lakelandcc.edu/"),
    ("wcjc", "Wharton County Junior College — Bay City", "Community / Technical College", "Bay City", "TX", 28.9830, -95.9700,
     ["AAS Nuclear Power Technology"], 20, ["South Texas Project"], "On campus", "https://www.wcjc.edu/"),
    ("emcc", "Estrella Mountain Community College", "Community / Technical College", "Avondale", "AZ", 33.4810, -112.3410,
     ["Power Plant Technology — nuclear pathway"], 25, ["APS Palo Verde"], "On campus", "https://www.estrellamountain.edu/"),
    ("nnmc", "Northern New Mexico College", "Community / Technical College", "Española", "NM", 35.9880, -106.0780,
     ["AAS Radiation Protection Technology"], 15, ["Los Alamos National Laboratory"], "On campus", "https://nnmc.edu/"),
    ("irsc", "Indian River State College", "Community / Technical College", "Fort Pierce", "FL", 27.4180, -80.3540,
     ["AS Nuclear Technology / Electrical Power Technology"], 20, ["FPL St. Lucie"], "On campus", "https://www.irsc.edu/"),
]

TRAINING_SITES = [
    {
        "id": r[0], "name": r[1], "type": r[2], "city": r[3], "state": r[4], "lat": r[5], "lng": r[6],
        "credentials": r[7], "annual_completers": r[8], "partners": r[9], "delivery": r[10], "website": r[11],
    }
    for r in _RAW
]
