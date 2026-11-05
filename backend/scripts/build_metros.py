"""One-off builder for the metro hotspot dataset.

Inputs (download first):
  /tmp/oe.area                    https://download.bls.gov/pub/time.series/oe/oe.area
  /tmp/2024_Gaz_cbsa_national.txt Census Gazetteer CBSA file (centroids)
Queries every metro OEWS series for 17-2161 / 19-4051 and keeps only metros where BLS
publishes a value. Writes data/metro_areas.json + data/metro_snapshot.json.
Run: cd /app/backend && python -m scripts.build_metros
"""

import asyncio
import json

from dotenv import load_dotenv

load_dotenv()

from lib.bls import METRO_AREAS_PATH, METRO_SNAPSHOT_PATH, fetch_metros  # noqa: E402


def load_areas() -> list[dict]:
    coords = {}
    with open("/tmp/2024_Gaz_cbsa_national.txt") as f:
        next(f)
        for line in f:
            c = [x.strip() for x in line.split("\t")]
            coords[c[1]] = (float(c[8]), float(c[9]))
    areas = {}
    with open("/tmp/oe.area") as f:
        next(f)
        for line in f:
            _, code, typ, name = line.rstrip("\n").split("\t")[:4]
            if typ == "M" and code.startswith("00") and code[2:] in coords:
                lat, lng = coords[code[2:]]
                areas[code] = {"code": code, "name": name.strip(), "lat": lat, "lng": lng}
    return list(areas.values())


async def main():
    areas = load_areas()
    print("metros queried:", len(areas))
    snap = await fetch_metros(areas)
    keep = [a for a in areas if any(v is not None for occ in snap["metros"][a["code"]].values() for v in occ.values())]
    snap["metros"] = {a["code"]: snap["metros"][a["code"]] for a in keep}
    METRO_AREAS_PATH.write_text(json.dumps(keep, indent=1))
    METRO_SNAPSHOT_PATH.write_text(json.dumps(snap, indent=1))
    print("metros with data:", len(keep), snap["source"], snap["data_year"])


if __name__ == "__main__":
    asyncio.run(main())
