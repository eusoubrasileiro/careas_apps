/**
 * Types for Memorial Converter
 */

export type InputFormat = 'scm' | 'gtmpro';
export type OutputFormat = 'sigareas' | 'gtmpro' | 'ddegree';

export interface MemorialFormData {
  input_text: string;
  input_format: InputFormat;
  output_format: OutputFormat;
  rumos_v_tol: string;
  rumos_v: boolean;
}

export interface ConvertResponse {
  status: boolean;
  data: string;
}

export interface PlotlyData {
  data: Plotly.Data[];
  layout: Partial<Plotly.Layout>;
}

export const SAMPLE_MEMORIAL = `-19°44'18''174 -44°17'41''703||
-19;44;;18''174 -44°17'45''410
xxxx -19°44'16''507 -44°17'45''410
-19°44'16''507   -44°17'52''079
-19°44'18''280 -44°17'52''079
-19°44'18|280 -44°17'53''625
-19°44'20''015 -44°17'53''625
-19°44,20'zz015 -44°17'54@@984
-19°44'22''531 -44°17'54''984
-19°44'22''531  zz-44°18'09''003
-19°44xx30''662 -44°18'09''003
-19°44'30''662 -44°18'19''307
-19°44,,37''111 -44°18'19''307
z-19°44'37''111 -44°17'41''703
-19°44'18''174 -44°17'41''703`;
