// Типы для механик брони
export interface MechanicInput {
  key: string;
  label: string;
  type: 'number' | 'checkbox' | 'select';
  value: number | boolean | string;
  options?: { value: string; label: string }[];
}

export interface Mechanic {
  key: string;
  name: string;
  desc: string;
  inputs: MechanicInput[];
  compute: (values: Record<string, any>) => string | { text: string; hist?: Array<{ label: string; count: number }> };
}

export interface AnalysisData {
  armor: number;
  damage: number;
  effectiveness: number;
  efficiency: number;
  survivability: number;
}

export interface OptimalArmorResult {
  optimal: number;
  maxEfficiency: number;
  diminishingPoint: number;
  data: AnalysisData[];
}

export interface VariabilityStats {
  mean: number;
  median: number;
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  q25: number;
  q75: number;
  iqr: number;
  cv: number;
  results: number[];
}

export interface ChartSeries {
  label: string;
  xs: number[];
  ys: number[];
  color?: string;
}