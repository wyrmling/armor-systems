import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface ChartOptions {
  yLabel?: string;
  xLabel?: string;
  color?: string;
  fill?: boolean;
  showPoints?: boolean;
  showOptimal?: boolean;
  optimalPoint?: { x: number; y: number };
}

export interface ChartSeries {
  label: string;
  xs: number[];
  ys: number[];
  color?: string;
}

export interface HistogramBucket {
  label: string;
  count: number;
}
