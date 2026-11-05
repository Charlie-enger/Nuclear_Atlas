# NuclearAtlas — SPEC

## What it does
Interactive dashboard of US nuclear engineering programs and the nuclear engineering/technician job market.
- `/` Programs Atlas: Leaflet map (32 programs, marker size = enrollment, cyan = research reactor, amber = grad-only), search + region/reactor/ABET/undergrad filters, list, detail sheet (enrollment, 1/5/10-yr growth, graduates by year chart, budget, placement, salary, tuition, reactor, focus, partners), national charts, sortable table, add-to-compare.
- `/workforce` Jobs map: BLS OEWS state bubbles (metric selector: engineer/tech employment, wage, reactors, supply balance), employer layer (labs/vendors/utilities), state profile panel, BLS 2024–34 projections, supply-vs-demand scenarios, state ranking table, "Refresh from BLS API" button.
- Jobs map also has a **Metro hotspots** view (States | Metro hotspots toggle): 28 BLS metros with published 17-2161/19-4051 values (employment, mean wage, location quotient, technician employment) + 3 suppressed known hubs (Albuquerque, Santa Fe, Lynchburg). Idaho Falls is shown as suppressed employment with wage. Anchors (what employer drives each hub) in `data/workforce.py` METRO_ANCHORS. Metro ranking table below.
- **Technician training sites** layer (toggle) + section: 23 sites in `data/training.py` (19 two-year colleges, 3 Navy nuclear training sites, 1 shipyard apprenticeship) with estimated completers/yr; state panel lists sites in the state.
- `/compare` up to 3 programs side by side (context state, in-memory), best-value highlighting, overlay charts.
- `/sources` methodology + labels.

## Data
- Curated static data: `backend/data/programs.py` (32 programs; history interpolated from growth rates), `backend/data/workforce.py` (state centroids, reactor counts, projections, scenarios, employers).
- BLS: `backend/lib/bls.py` fetches OEWS series (v2 if `BLS_API_KEY` set; auto-falls back to keyless v1 if BLS rejects the key). Bundled snapshot `backend/data/bls_snapshot.json` (May 2025 data). `POST /api/workforce/refresh` stores live copy in Mongo `bls_cache` (_id `oews_latest`), 6h cooldown; failures fall back to last saved data.

Metro data: built once by `python -m scripts.build_metros` (needs /tmp/oe.area + Census CBSA gazetteer) → `data/metro_areas.json`, `data/metro_snapshot.json`; refresh also re-fetches metros into Mongo `bls_cache` _id `oews_metro_latest`.

## API
- GET /api/programs, GET /api/programs/summary, GET /api/programs/{id} (404 if unknown)
- GET /api/workforce, POST /api/workforce/refresh

## Auth
None.
