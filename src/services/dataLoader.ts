import Papa from 'papaparse';
import {
  BmwHistory,
  BmwSpecs,
  BmwSales,
  BmwSource,
  BmwConflict
} from '../types/bmw';

async function fetchCsv<T>(filename: string): Promise<T[]> {
  try {
    const res = await fetch(`/dataset/${filename}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${filename}: HTTP ${res.status}`);
    }
    const text = await res.text();
    return new Promise((resolve, reject) => {
      Papa.parse<T>(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (err: Error) => reject(err)
      });
    });
  } catch (e) {
    console.error(`Error loading ${filename}:`, e);
    return [];
  }
}

export async function loadBmwHistoryData(): Promise<{
  history: BmwHistory[];
  sources: BmwSource[];
}> {
  const [rawHistory, rawHistorySources] = await Promise.all([
    fetchCsv<Record<string, any>>('bmw_history.csv'),
    fetchCsv<Record<string, any>>('bmw_history_sources.csv')
  ]);

  const history = rawHistory.map((r) => ({
    generation_id: String(r.generation_id || '').trim(),
    model_name: String(r.model_name || '').trim(),
    vehicle_type: String(r.vehicle_type || '').trim(),
    production_start: Number(r.production_start) || 1929,
    production_end: r.production_end ? Number(r.production_end) : null,
    status: (r.status === 'Active' ? 'Active' : 'Discontinued') as 'Active' | 'Discontinued'
  })).filter(h => !!h.generation_id);

  const sources = rawHistorySources.map(r => ({
    generation_id: String(r.generation_id || '').trim(),
    field_name: r.field_name,
    source_name: r.source_name,
    source_url: r.source_url,
    access_date: r.access_date,
    confidence: (r.confidence || 'High') as 'High' | 'Medium' | 'Low'
  }));

  return { history, sources };
}

export async function loadBmwSpecsData(): Promise<{
  specs: BmwSpecs[];
  sources: BmwSource[];
  conflicts: BmwConflict[];
}> {
  const [rawSpecs, rawSpecsSources, rawConflicts] = await Promise.all([
    fetchCsv<Record<string, any>>('bmw_specs.csv'),
    fetchCsv<Record<string, any>>('bmw_specs_sources.csv'),
    fetchCsv<Record<string, any>>('bmw_specs_conflicts.csv')
  ]);

  const specs = rawSpecs.map((r) => ({
    generation_id: String(r.generation_id || '').trim(),
    generation: String(r.generation || '').trim(),
    series: String(r.series || '').trim(),
    variant_id: String(r.variant_id || '').trim(),
    engine: String(r.engine || '').trim(),
    engine_type: String(r.engine_type || '').trim(),
    fuel_type: (r.fuel_type || 'Petrol') as BmwSpecs['fuel_type'],
    displacement_cc: r.displacement_cc ? Number(r.displacement_cc) : null,
    cylinders: r.cylinders ? Number(r.cylinders) : null,
    horsepower_hp: Number(r.horsepower_hp) || 0,
    torque_nm: Number(r.torque_nm) || 0,
    transmission: String(r.transmission || '').trim(),
    drivetrain: (r.drivetrain || 'RWD') as BmwSpecs['drivetrain'],
    acceleration_0_100_s: r.acceleration_0_100_s ? Number(r.acceleration_0_100_s) : null,
    top_speed_kmh: Number(r.top_speed_kmh) || 0,
    weight_kg: Number(r.weight_kg) || 0,
    length_mm: Number(r.length_mm) || 0,
    width_mm: Number(r.width_mm) || 0,
    height_mm: Number(r.height_mm) || 0,
    wheelbase_mm: Number(r.wheelbase_mm) || 0,
    fuel_consumption: r.fuel_consumption ? Number(r.fuel_consumption) : null,
    battery_kwh: r.battery_kwh ? Number(r.battery_kwh) : null,
    electric_range_km: r.electric_range_km ? Number(r.electric_range_km) : null
  })).filter(s => !!s.generation_id);

  const sources = rawSpecsSources.map(r => ({
    generation_id: String(r.generation_id || '').trim(),
    field_name: r.field_name,
    source_name: r.source_name,
    source_url: r.source_url,
    access_date: r.access_date,
    confidence: (r.confidence || 'High') as 'High' | 'Medium' | 'Low'
  }));

  const conflicts = rawConflicts.map(r => ({
    generation_id: String(r.generation_id || '').trim(),
    field_name: r.field_name,
    value_1: String(r.value_1 || ''),
    source_1: String(r.source_1 || ''),
    value_2: String(r.value_2 || ''),
    source_2: String(r.source_2 || ''),
    selected_value: String(r.selected_value || ''),
    reason: String(r.reason || '')
  }));

  return { specs, sources, conflicts };
}

export async function loadBmwSalesData(): Promise<{
  sales: BmwSales[];
  sources: BmwSource[];
}> {
  const [rawSales, rawSalesSources] = await Promise.all([
    fetchCsv<Record<string, any>>('bmw_sales.csv'),
    fetchCsv<Record<string, any>>('bmw_sales_sources.csv')
  ]);

  const sales = rawSales.map((r) => ({
    generation_id: String(r.generation_id || '').trim(),
    year: Number(r.year) || 1929,
    month: r.month ? Number(r.month) : null,
    units_sold: Number(r.units_sold) || 0
  })).filter(s => !!s.generation_id);

  const sources = rawSalesSources.map(r => ({
    generation_id: String(r.generation_id || '').trim(),
    year: r.year,
    month: r.month,
    source_name: r.source_name,
    source_url: r.source_url,
    access_date: r.access_date,
    confidence: (r.confidence || 'High') as 'High' | 'Medium' | 'Low'
  }));

  return { sales, sources };
}
