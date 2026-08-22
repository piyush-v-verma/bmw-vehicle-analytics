# BMW Analytics Dashboard

An interactive, high-performance web dashboard for exploring BMW passenger vehicles, technical specifications, production histories, global sales statistics, and engineering evolution. 

Built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Recharts**, this platform operates entirely using local static datasets and locally cached media assets, providing a premium, dark-themed analytical experience.

---

## 🚀 Key Features

### 📊 1. Overview Dashboard
* **KPI Ribbon:** Real-time metrics for total generations cataloged, currently active models, power leaders, and total lifecycle deliveries.
* **Global Annual Deliveries Line Graph:** Visualizes sales trajectories across decades.
* **Series Performance Bar Graph:** Ranks sales volume by Series (e.g., 3 Series, 5 Series, X Series).
* **Powertrain Distribution Donut Chart:** Breakdown of engine fuel configurations (Petrol, Diesel, Hybrid, EV).
* **Top Performers Hall of Fame:** Highlighting flagship models sorted by peak horsepower, top speed, and agility metrics.

### 🔍 2. Model Explorer
* **Search & Filters:** Real-time query search matching model names and generations, with filter tabs by **Era** (Pre-War, Classic, Modern, NextGen) and **Vehicle Type** (Sedan, Coupe, SUV, Roadster).
* **Pulsing Skeleton Image Loaders:** Bypasses placeholders instantly for cached files and displays smooth, pulsing skeleton layouts during disk read to eliminate visual pop-in.
* **Technical Datasheet Modals:** Inspects detailed powertrain specs, peak torque, weight, dimensions, efficiency ratings, engineering homologation conflicts, and source citations.

### 📈 3. Sales Analytics
* **Seasonality Heatmaps:** Analyzes monthly deliveries across all years to identify commercial seasonality.
* **Lifecycle Delivery Timelines:** Highlights generational production spans paired with historical sales volumes.

### ⏳ 4. Chronological Evolution Timeline
* Traces BMW's vehicle lineage chronologically from 1929 through 2026.
* Clean vertical timeline nodes detailing production lifespans and era transitions.

### ⚖️ 5. Side-by-Side Model Comparator
* **Multi-Attribute Radar Graph:** Overlays normalized power, torque, speed, and agility indexes across up to 4 models.
* **Specs Differential Table:** Side-by-side spec comparison table with automated color-coding and badges for pinnacles (e.g., highest power 🏆, fastest acceleration ⚡, lightest weight 🪶).
* **Empty State Layout:** Gracefully renders placeholder controls and hides tables/graphs when no items are selected.

---

## 🛠️ Technology Stack

* **Frontend Framework:** React 18+
* **Language:** TypeScript (Strict Type Safety)
* **Build System:** Vite
* **Styling & Layout:** Tailwind CSS
* **Charts & Data Viz:** Recharts (SVG/Canvas Rendering)
* **Icons:** Lucide React
* **Data Parsing:** PapaParse (Fast in-browser CSV parser)

---

## 💾 Data & Media Architecture

### Datasets (`public/dataset/`)
The application is driven by three relational CSV datasets connected using `generation_id` as the primary key:
1. **`bmw_history.csv`:** Generation identities, vehicle classifications, production years, and lifecycle statuses (Active/Discontinued).
2. **`bmw_specs.csv`:** Engine displacement, power outputs, dimensions, drivetrain layouts, weights, and battery/EV ranges.
3. **`bmw_sales.csv`:** Global monthly and annual deliveries by generation.

### Local Media Catalog (`public/images/bmw/`)
To bypass rate limiting and 404 links common with external Wikimedia Commons hotlinking, the application serves 101 high-resolution vehicle images locally:
* **Asset Location:** `/public/images/bmw/<generation_id>.jpg`
* **Fallback Behavior:** If a local image is missing, the frontend catches the load failure and gracefully falls back to a premium, high-resolution Unsplash placeholder car image.

---

## 💻 Getting Started

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```

3. Build the application for production deployment:
   ```bash
   npm run build
   ```

The compiled static assets will be outputted to the `dist/` directory, ready to be served on Netlify, Vercel, or any static web server.
