# NuclearAtlas — SPEC

## What it does
Interactive dashboard of US nuclear engineering programs and the nuclear engineering/technician job market.
- `/` Programs Atlas: Leaflet map (32 programs, marker size = enrollment, cyan = research reactor, amber = grad-only), search + region/reactor/ABET/undergrad filters, list, detail sheet (enrollment, 1/5/10-yr growth, graduates by year chart, budget, placement, salary, tuition, reactor, focus, partners), national charts, sortable table, add-to-compare.
- `/workforce` Jobs map: BLS OEWS state bubbles (metric selector: engineer/tech employment, wage, reactors, supply balance), employer layer (labs/vendors/utilities), state profile panel, BLS 2024–34 projections, supply-vs-demand scenarios, state ranking table, "Refresh from BLS API" button.
- `/compare` up to 3 programs side by side (context state, in-memory), best-value highlighting, overlay charts.
- `/sources` methodology + labels.

## Data
- Curated static data: `backend/data/programs.py` (32 programs; history interpolated from growth rates), `backend/data/workforce.py` (state centroids, reactor counts, projections, scenarios, employers).
- BLS: `backend/lib/bls.py` fetches OEWS series (keyless v1, v2 if `BLS_API_KEY` set). Bundled snapshot `backend/data/bls_snapshot.json` (May 2025 data). `POST /api/workforce/refresh` stores live copy in Mongo `bls_cache` (_id `oews_latest`), 6h cooldown; failures fall back to last saved data.

## API
- GET /api/programs, GET /api/programs/summary, GET /api/programs/{id} (404 if unknown)
- GET /api/workforce, POST /api/workforce/refresh

## Auth
None.
