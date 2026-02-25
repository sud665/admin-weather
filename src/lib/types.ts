export interface ParameterValue {
  id: string;
  label: string;
  value: number;
  description: string | null;
  order: number;
}

export interface SubParameter {
  id: string;
  name: string;
  description: string | null;
  order: number;
  values: ParameterValue[];
}

export interface VariableSet {
  id: string;
  name: string;
  description: string | null;
  order: number;
  subParameters: SubParameter[];
}

export interface VisualizationResult {
  id: string;
  combinationKey: string;
  year: number;
  sccValue: number | null;
  temperature: number | null;
  damageCost: number | null;
  gdpLoss: number | null;
}

export interface ChartSetting {
  id: string;
  chartKey: string;
  title: string;
  xLabel: string | null;
  yLabel: string | null;
  unit: string | null;
  description: string | null;
}
