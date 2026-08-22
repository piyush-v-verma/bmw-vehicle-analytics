# BMW Analytics Dataset Archive (1929 – 2026)

## 1. Executive Summary & Collection Overview
- **Data Collection Date**: 2026-08-22
- **Coverage Period**: 1929 through 2026 (Continuous 97-year historical and modern lineage)
- **Primary Focus**: Authentic BMW production passenger automobiles, technical specifications, generation lifecycles, and global sales/deliveries.
- **Relational Integrity**: 100% interconnected across all datasets using the canonical `generation_id` relationship key.

---

## 2. Dataset Purpose & Product Architecture
The BMW Analytics dataset powers an interactive automotive data visualization platform designed to explore BMW's vehicle evolution, technical engineering milestones, production lifecycles, and global commercial performance.

The archive comprises three primary operational datasets, three provenance/source tables, and one technical conflict reconciliation register:

```text
dataset/
├── bmw_specs.csv              # Technical specifications & representative powertrain variants
├── bmw_history.csv            # Canonical generation registry, lifecycles & status
├── bmw_sales.csv              # Global annual & monthly sales / production deliveries
├── bmw_specs_sources.csv      # Field-level specifications provenance
├── bmw_history_sources.csv    # Generation lifecycle provenance
├── bmw_sales_sources.csv      # Sales data source tracking
├── bmw_specs_conflicts.csv    # Documented engineering & catalog discrepancies
└── DATASET_README.md          # Comprehensive architecture & methodology documentation
```

---

## 3. Dataset Schemas

### Primary File 1: `dataset/bmw_specs.csv`
Stores technical parameters, powertrain configurations, and physical dimensions for generation variants.

| Column Name | Type | Description / Units |
| :--- | :--- | :--- |
| `generation_id` | String | Canonical relationship key (e.g. `BMW_3_E46`) |
| `generation` | String | Generation designation / chassis code |
| `series` | String | BMW model family / series classification |
| `variant_id` | String | Specific variant / trim identifier |
| `engine` | String | Internal factory engine code (e.g. `M54B30`, `B58B30`) |
| `engine_type` | String | Engine cylinder layout (`I3`, `I4`, `I6`, `V8`, `V10`, `V12`, `Boxer 2`, `Electric`) |
| `fuel_type` | String | `Petrol`, `Diesel`, `Hybrid`, `Plug-in Hybrid`, `Electric` |
| `displacement_cc` | Integer | Displacement in cubic centimetres (blank for pure EVs) |
| `cylinders` | Integer | Cylinder count (blank for pure EVs) |
| `horsepower_hp` | Integer | Metric horsepower (hp / PS DIN) |
| `torque_nm` | Integer | Peak torque in Newton-metres (Nm) |
| `transmission` | String | Transmission type (e.g. `6-speed manual`, `8-speed automatic`, `7-speed DCT`) |
| `drivetrain` | String | `RWD`, `FWD`, `AWD` |
| `acceleration_0_100_s` | Float | 0 to 100 km/h acceleration time in seconds |
| `top_speed_kmh` | Integer | Maximum factory speed in km/h |
| `weight_kg` | Integer | DIN unladen kerb weight in kilograms |
| `length_mm` | Integer | Overall vehicle length in millimetres |
| `width_mm` | Integer | Overall vehicle width (without mirrors) in millimetres |
| `height_mm` | Integer | Overall vehicle height in millimetres |
| `wheelbase_mm` | Integer | Wheelbase distance in millimetres |
| `fuel_consumption` | Float | Combined fuel consumption in L/100 km (blank for EVs) |
| `battery_kwh` | Float | Gross battery capacity in kWh (where applicable) |
| `electric_range_km` | Integer | Electric range in km (WLTP / historical equivalent) |

### Primary File 2: `dataset/bmw_history.csv`
Describes the identity, lifecycle, and active/discontinued status of every BMW generation.

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `generation_id` | String | Canonical relationship key (e.g. `BMW_5_E39`) |
| `model_name` | String | Recognized BMW model series / name |
| `vehicle_type` | String | Vehicle body style category (`Sedan`, `Coupe`, `SUV`, `Roadster`, etc.) |
| `production_start` | Integer | Initial production start year |
| `production_end` | Integer | Production end year (blank for currently active models) |
| `status` | String | `Active` or `Discontinued` |

### Primary File 3: `dataset/bmw_sales.csv`
Stores global sales and historical production deliveries.

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `generation_id` | String | Canonical relationship key |
| `year` | Integer | Calendar year |
| `month` | Integer / Blank | Calendar month (1–12) for monthly records; blank for annual-level records |
| `units_sold` | Integer | Total verified global deliveries |

### Provenance Files: `bmw_*_sources.csv`
- `bmw_specs_sources.csv`: `generation_id,field_name,source_name,source_url,access_date,confidence`
- `bmw_history_sources.csv`: `generation_id,field_name,source_name,source_url,access_date,confidence`
- `bmw_sales_sources.csv`: `generation_id,year,month,source_name,source_url,access_date,confidence`

### Discrepancy File: `bmw_specs_conflicts.csv`
- `generation_id,field_name,value_1,source_1,value_2,source_2,selected_value,reason`

---

## 4. Canonical `generation_id` Methodology
1. Modern BMW model series follow the structured standard:
   `BMW_<series_or_model>_<generation_code>`
   - Examples: `BMW_3_E30`, `BMW_5_G30`, `BMW_7_G70`, `BMW_X5_E53`, `BMW_I4_G26`
2. Historical models predating modern chassis codes utilize stable historical identifiers:
   - Examples: `BMW_3-15_DA2`, `BMW_3-20_AM`, `BMW_303`, `BMW_328`, `BMW_507`, `BMW_ISETTA`, `BMW_NK_SEDAN`, `BMW_02_SERIES`, `BMW_E9_COUPE`
3. Relationship Rule: `generation_id` is the **exclusive** join key across all datasets. No secondary joins or text-matching heuristics are permitted.

---

## 5. Sources Used
1. **BMW Group Classic Archives** ([bmwgroup-classic.com](https://www.bmwgroup-classic.com/en/history/historic-modeloverview-bmw.html)): Verified technical datasheets, production year spans, and cumulative production quantities for all pre-war, post-war, and classic BMW vehicles.
2. **BMW Group Investor Relations Annual & Financial Reports** ([bmwgroup.com](https://www.bmwgroup.com/en/investor-relations/company-reports.html)): Verified global annual delivery numbers by model series and generation.
3. **BMW Group PressClub Global Archive** ([press.bmwgroup.com](https://www.press.bmwgroup.com)): Official technical data bulletins, homologation certificates, and monthly/quarterly press releases.
4. **Authoritative Engineering Technical Registries**: Verified vehicle dimensions, transmission ratios, and DIN unladen weights.

---

## 6. Data Cleaning & Normalization Rules
1. **SI / Metric Standardization**:
   - Engine Displacement: Integer cubic centimetres (`cc`).
   - Horsepower: Metric horsepower (`hp` / DIN `PS`).
   - Torque: Newton-metres (`Nm`).
   - Dimensions & Wheelbase: Millimetres (`mm`).
   - Weight: Unladen kerb weight in kilograms (`kg`).
   - Speed: Kilometres per hour (`km/h`).
   - Fuel Consumption: Litres per 100 kilometres (`L/100 km`).
   - Battery Capacity: Kilowatt-hours (`kWh`).
   - Electric Range: Kilometres (`km`).
2. **No Embedded Units**: All numeric cells contain raw numbers without text annotations (e.g. `2998`, not `2998 cc`).
3. **Missing Data Policy**: Unrecorded, non-applicable (e.g. displacement for EVs), or historical unmeasured fields are left strictly empty (empty string `""`). Prohibited placeholders (`N/A`, `unknown`, `?`, `-1`, `0`) are not present in numeric fields.
4. **Honest Sales Preservation**: Annual sales figures are never divided by 12 to invent false monthly distributions. Annual totals have empty month columns, while genuine monthly releases maintain explicit months (1–12).

---

## 7. Conflict Handling & Reconciliation
Where discrepancies between authoritative regional documentation exist (e.g., US EPA SAE ratings vs. European DIN PS ratings, catalyst vs. non-catalyst homologation, or dry weight vs. EU weight with driver):
- The European DIN / ECE factory homologation specification is established as the primary baseline.
- All instances of notable divergence are formally logged in `bmw_specs_conflicts.csv` with full citations and technical justifications.

---

## 8. Coverage & Verification Summary
- **Historical Generations Documented**: 101 unique canonical generations spanning from 1929 through 2026.
- **Powertrain / Technical Variants**: 165 fully specified engine and trim variants.
- **Active Generations (as of 2026)**: 25 active production models.
- **Discontinued Generations**: 76 historical models with validated lifecycle conclusion dates.
- **Sales & Production Data**: 706 global annual and monthly delivery records spanning 1929 to 2026.
- **Referential Integrity**: 100% parity across `bmw_specs.csv`, `bmw_history.csv`, and `bmw_sales.csv` with zero orphaned keys.
