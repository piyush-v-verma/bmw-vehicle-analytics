export interface BmwHistory {
  generation_id: string;
  model_name: string;
  vehicle_type: string;
  production_start: number;
  production_end: number | null;
  status: 'Active' | 'Discontinued';
}

export interface BmwSpecs {
  generation_id: string;
  generation: string;
  series: string;
  variant_id: string;
  engine: string;
  engine_type: string;
  fuel_type: 'Petrol' | 'Diesel' | 'Hybrid' | 'Plug-in Hybrid' | 'Electric' | 'Other';
  displacement_cc: number | null;
  cylinders: number | null;
  horsepower_hp: number;
  torque_nm: number;
  transmission: string;
  drivetrain: 'RWD' | 'FWD' | 'AWD' | 'Other';
  acceleration_0_100_s: number | null;
  top_speed_kmh: number;
  weight_kg: number;
  length_mm: number;
  width_mm: number;
  height_mm: number;
  wheelbase_mm: number;
  fuel_consumption: number | null;
  battery_kwh: number | null;
  electric_range_km: number | null;
}

export interface BmwSales {
  generation_id: string;
  year: number;
  month: number | null;
  units_sold: number;
}

export interface BmwSource {
  generation_id: string;
  field_name?: string;
  year?: number;
  month?: number | null;
  source_name: string;
  source_url: string;
  access_date: string;
  confidence: 'High' | 'Medium' | 'Low';
}

export interface BmwConflict {
  generation_id: string;
  field_name: string;
  value_1: string;
  source_1: string;
  value_2: string;
  source_2: string;
  selected_value: string;
  reason: string;
}

export interface EnrichedGeneration {
  generation_id: string;
  model_name: string;
  vehicle_type: string;
  production_start: number;
  production_end: number | null;
  status: 'Active' | 'Discontinued';
  era: 'Pre-War (1929-1941)' | 'Post-War Classic (1952-1965)' | 'Neue Klasse & 70s (1966-1989)' | 'Modern Era (1990-2015)' | 'NextGen & Electrified (2016-2026)';
  variants: BmwSpecs[];
  primaryVariant: BmwSpecs;
  sales: BmwSales[];
  totalSales: number;
  yearlySales: { year: number; units: number }[];
  sources: {
    history: BmwSource[];
    specs: BmwSource[];
    sales: BmwSource[];
  };
  conflicts: BmwConflict[];
  imageUrl: string;
}

export interface FilterState {
  searchQuery: string;
  era: string;
  series: string;
  status: string;
  fuelType: string;
  drivetrain: string;
  vehicleType: string;
  minHorsepower: number;
  maxHorsepower: number;
  minYear: number;
  maxYear: number;
  sortBy: 'name' | 'year' | 'power' | 'speed' | 'sales' | 'acceleration';
  sortOrder: 'asc' | 'desc';
}
