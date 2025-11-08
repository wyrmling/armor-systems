'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface HistogramCanvasProps {
  data: Array<{ label: string; count: number }>;
  title?: string;
}

export function HistogramCanvas({ data, title }: HistogramCanvasProps) {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        label: 'Frequency',
        data: data.map(d => d.count),
        backgroundColor: 'rgba(166, 227, 161, 0.5)',
        borderColor: 'rgba(166, 227, 161, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count',
        },
      },
    },
  };

  return (
    <div className="bg-background border border-border rounded-lg p-4 mt-4">
      <Bar options={options} data={chartData} />
    </div>
  );
}
