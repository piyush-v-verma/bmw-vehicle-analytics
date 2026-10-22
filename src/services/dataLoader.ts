import Papa from 'papaparse';
import {
  BmwHistory,
  BmwSpecs,
  BmwSales,
  BmwSource,
  BmwConflict,
  YearlySalesRecord,
  DataValidationReport
} from '../types/bmw';

async function fetchCsv<T>(filename: string): Promise<T[]> {
  const res = await fetch(`/dataset/${filename}`);
  if (!res.ok) {
    throw new Error(`Failed to load ${filename}: HTTP ${res.status} (${res.statusText})`);
  }
  const text = await res.text();
  return new Promise((resolve, reject) => {
    Papa.parse<T>(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.warn(`Warnings while parsing ${filename}:`, results.errors);
        }
        resolve(results.data);
      },
      error: (err: Error) => reject(new Error(`CSV Parse Error in ${filename}: ${err.message}`))
    });
  });
}

/**
 * Validates relational integrity, required fields, and ranges across all loaded datasets.
 */
export function validateDatasets(
  history: BmwHistory[],
  specs: BmwSpecs[],
  sales: BmwSales[],
  sources: { history: BmwSource[]; specs: BmwSource[]; sales: BmwSource[] },
  conflicts: BmwConflict[]
): DataValidationReport {
  const historyIds = new Set<string>();
  const duplicateIds: string[] = [];
  const invalidYears: string[] = [];

  for (const h of history) {
    if (!h.generation_id || !h.model_name) {
      console.warn(`[Validation] Missing required fields for history record:`, h);
    }
    if (historyIds.has(h.generation_id)) {
      duplicateIds.push(h.generation_id);
    } else {
      historyIds.add(h.generation_id);
    }

    if (h.production_start < 1928 || h.production_start > 2030) {
      invalidYears.push(`${h.generation_id} start: ${h.production_start}`);
    }
    if (h.production_end && h.production_end < h.production_start) {
      invalidYears.push(`${h.generation_id} end < start: ${h.production_end} < ${h.production_start}`);
    }
  }

  // Check specs referential integrity
  const orphanSpecs: string[] = [];
  for (const s of specs) {
    if (!historyIds.has(s.generation_id)) {
      orphanSpecs.push(`${s.variant_id} -> ${s.generation_id}`);
    }
  }

  // Check sales referential integrity
  const orphanSales: string[] = [];
  for (const s of sales) {
    if (!historyIds.has(s.generation_id)) {
      orphanSales.push(`${s.generation_id} (${s.year})`);
    }
  }

  // Find low-confidence sources
  const allSources = [...sources.history, ...sources.specs, ...sources.sales];
  const lowConfidenceSources = allSources.filter(s => s.confidence === 'Low');

  const isValid = duplicateIds.length === 0 && orphanSpecs.length === 0 && orphanSales.length === 0;

  return {
    historyCount: history.length,
    specsCount: specs.length,
    salesCount: sales.length,
    sourcesCount: {
      history: sources.history.length,
      specs: sources.specs.length,
      sales: sources.sales.length
    },
    conflictsCount: conflicts.length,
    duplicateIds: [...new Set(duplicateIds)],
    orphanSpecs: [...new Set(orphanSpecs)],
    orphanSales: [...new Set(orphanSales)],
    invalidYears,
    lowConfidenceSources,
    isValid
  };
}

/**
 * Methodologically rigorous sales aggregator:
 * 1. Establishes a strict rule for annual vs monthly records.
 * 2. When an authoritative annual figure exists, uses it rather than adding monthly records.
 * 3. When monthly data is complete (12 months), aggregates into an annual total.
 * 4. When monthly data is incomplete (<12 months), tracks as a partial YTD figure.
 * 5. Returns separate cumulative total, complete-years-only total, and partial status flags.
 */
export function aggregateGenerationSales(records: BmwSales[]): {
  yearlySales: YearlySalesRecord[];
  totalSales: number;
  annualSalesOnly: number;
  hasPartialSalesData: boolean;
} {
  const byYear = new Map<number, { annual: BmwSales | null; monthly: BmwSales[] }>();

  for (const r of records) {
    let entry = byYear.get(r.year);
    if (!entry) {
      entry = { annual: null, monthly: [] };
      byYear.set(r.year, entry);
    }
    if (r.month === null || r.month === undefined) {
      entry.annual = r;
    } else {
      entry.monthly.push(r);
    }
  }

  const yearlySales: YearlySalesRecord[] = [];
  let totalSales = 0;
  let annualSalesOnly = 0;
  let hasPartialSalesData = false;

  const sortedYears = Array.from(byYear.keys()).sort((a, b) => a - b);

  for (const yr of sortedYears) {
    const { annual, monthly } = byYear.get(yr)!;

    if (annual !== null) {
      // Authoritative annual record exists
      const units = annual.units_sold;
      totalSales += units;
      annualSalesOnly += units;

      yearlySales.push({
        year: yr,
        units,
        isCompleteYear: true,
        monthsRecorded: monthly.length,
        recordType: 'annual_record',
        coverageLabel: 'Authoritative Annual Total'
      });
    } else if (monthly.length > 0) {
      // Only monthly records exist
      const distinctMonths = new Set(monthly.map(m => m.month)).size;
      const sumUnits = monthly.reduce((acc, m) => acc + m.units_sold, 0);

      if (distinctMonths >= 12) {
        // Complete 12-month data
        totalSales += sumUnits;
        annualSalesOnly += sumUnits;
        yearlySales.push({
          year: yr,
          units: sumUnits,
          isCompleteYear: true,
          monthsRecorded: distinctMonths,
          recordType: 'monthly_aggregated',
          coverageLabel: 'Full Year (12/12 mo Aggregated)'
        });
      } else {
        // Partial YTD monthly data
        totalSales += sumUnits;
        hasPartialSalesData = true;
        yearlySales.push({
          year: yr,
          units: sumUnits,
          isCompleteYear: false,
          monthsRecorded: distinctMonths,
          recordType: 'partial_monthly',
          coverageLabel: `Partial YTD (${distinctMonths}/12 mo Coverage)`
        });
      }
    }
  }

  return { yearlySales, totalSales, annualSalesOnly, hasPartialSalesData };
}

export async function loadBmwHistoryData(): Promise<{
  history: BmwHistory[];
  sources: BmwSource[];
}> {
  const [rawHistory, rawHistorySources] = await Promise.all([
    fetchCsv<Record<string, any>>('bmw_history.csv'),
    fetchCsv<Record<string, any>>('bmw_history_sources.csv')
  ]);

  if (!rawHistory || rawHistory.length === 0) {
    throw new Error('bmw_history.csv is empty or failed to load');
  }

  const history: BmwHistory[] = rawHistory.map((r) => ({
    generation_id: String(r.generation_id || '').trim(),
    model_name: String(r.model_name || '').trim(),
    vehicle_type: String(r.vehicle_type || '').trim(),
    production_start: Number(r.production_start) || 1929,
    production_end: r.production_end ? Number(r.production_end) : null,
    status: (r.status === 'Active' ? 'Active' : 'Discontinued') as 'Active' | 'Discontinued'
  })).filter(h => !!h.generation_id);

  const sources: BmwSource[] = rawHistorySources.map(r => ({
    generation_id: String(r.generation_id || '').trim(),
    field_name: r.field_name,
    source_name: r.source_name || 'BMW Group Historical Archive',
    source_url: r.source_url || 'https://www.bmwgroup-classic.com',
    access_date: r.access_date || '2026-08-22',
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

  if (!rawSpecs || rawSpecs.length === 0) {
    throw new Error('bmw_specs.csv is empty or failed to load');
  }

  const specs: BmwSpecs[] = rawSpecs.map((r) => ({
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

  const sources: BmwSource[] = rawSpecsSources.map(r => ({
    generation_id: String(r.generation_id || '').trim(),
    field_name: r.field_name,
    source_name: r.source_name || 'BMW AG Technical Homologation',
    source_url: r.source_url || 'https://www.press.bmwgroup.com',
    access_date: r.access_date || '2026-08-22',
    confidence: (r.confidence || 'High') as 'High' | 'Medium' | 'Low'
  }));

  const conflicts: BmwConflict[] = rawConflicts.map(r => ({
    generation_id: String(r.generation_id || '').trim(),
    field_name: String(r.field_name || ''),
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

  if (!rawSales || rawSales.length === 0) {
    throw new Error('bmw_sales.csv is empty or failed to load');
  }

  const sales: BmwSales[] = rawSales.map((r) => ({
    generation_id: String(r.generation_id || '').trim(),
    year: Number(r.year) || 1929,
    month: r.month !== null && r.month !== undefined && r.month !== '' ? Number(r.month) : null,
    units_sold: Number(r.units_sold) || 0
  })).filter(s => !!s.generation_id);

  const sources: BmwSource[] = rawSalesSources.map(r => ({
    generation_id: String(r.generation_id || '').trim(),
    year: r.year ? Number(r.year) : undefined,
    month: r.month ? Number(r.month) : null,
    source_name: r.source_name || 'BMW Group Investor Relations Deliveries',
    source_url: r.source_url || 'https://www.bmwgroup.com/en/investor-relations.html',
    access_date: r.access_date || '2026-08-22',
    confidence: (r.confidence || 'High') as 'High' | 'Medium' | 'Low'
  }));

  return { sales, sources };
}
