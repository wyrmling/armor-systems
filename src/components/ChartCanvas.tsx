'use client';

// TODO: react-chartjs-2 or chart.js?
import { Line, Bar } from 'react-chartjs-2';
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
import { ChartSeries, HistogramBucket, ChartOptions } from '@/utils/charts';

// Custom plugin to draw the optimal line and point
const optimalLinePlugin = {
  id: 'optimalLine',
  afterDraw: (chart: ChartJS, args: any, options: { showOptimal?: boolean; optimalPoint?: { x: number; y: number } }) => {
    if (!options.showOptimal || !options.optimalPoint) {
      return;
    }

    const { ctx, chartArea: { top, bottom }, scales: { x, y } } = chart;
    const { x: optimalX, y: optimalY } = options.optimalPoint;

    if (x && y && optimalX !== undefined && optimalY !== undefined) {
      const xCoord = x.getPixelForValue(optimalX);
      const yCoord = y.getPixelForValue(optimalY);

      // Draw vertical line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xCoord, top);
      ctx.lineTo(xCoord, bottom);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f38ba8';
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.restore();

      // Draw point
      ctx.save();
      ctx.beginPath();
      ctx.arc(xCoord, yCoord, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#f38ba8';
      ctx.fill();
      ctx.restore();

      // Draw label
      ctx.save();
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#f38ba8';
      ctx.fillText(`Optimal: ${optimalX}`, xCoord + 8, yCoord - 8);
      ctx.restore();
    }
  }
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  optimalLinePlugin
);

interface ChartCanvasProps {
  type: 'line' | 'histogram' | 'multiline';
  height?: number;
  className?: string;
  title?: string;
  xs?: number[];
  ys?: number[];
  data?: HistogramBucket[];
  series?: ChartSeries[];
  options?: ChartOptions;
}

export function ChartCanvas({
  type,
  height = 200,
  className = '',
  title,
  xs = [],
  ys = [],
  data = [],
  series = [],
  options = {},
}: ChartCanvasProps) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type === 'multiline',
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
      optimalLine: { // Pass options to our plugin
        showOptimal: options.showOptimal,
        optimalPoint: options.optimalPoint,
      }
    },
    scales: {
      y: {
        title: {
          display: !!options.yLabel,
          text: options.yLabel,
        },
      },
      x: {
        title: {
          display: !!options.xLabel,
          text: options.xLabel,
        },
      },
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        const lineData = {
          labels: xs,
          datasets: [
            {
              label: options.yLabel || '',
              data: ys,
              borderColor: options.color || 'rgb(75, 192, 192)',
              backgroundColor: options.fill ? `${options.color}33` : 'rgba(75, 192, 192, 0.2)',
              fill: options.fill,
              pointRadius: options.showPoints ? 2 : 0,
            },
          ],
        };
        return <Line options={chartOptions as any} data={lineData} />;

      case 'histogram':
        const barData = {
          labels: data.map(d => d.label),
          datasets: [
            {
              label: options.yLabel || 'Count',
              data: data.map(d => d.count),
              backgroundColor: options.color || 'rgba(255, 99, 132, 0.5)',
            },
          ],
        };
        return <Bar options={chartOptions as any} data={barData} />;

      case 'multiline':
        const multiLineData = {
          labels: series[0]?.xs || [],
          datasets: series.map(s => ({
            label: s.label,
            data: s.ys,
            borderColor: s.color || 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            pointRadius: options.showPoints ? 2 : 0,
          })),
        };
        return <Line options={chartOptions as any} data={multiLineData} />;

      default:
        return null;
    }
  };

  return (
    <div className={`bg-background border border-border rounded-lg p-4 mt-4 ${className}`} style={{ height: `${height}px` }}>
      {renderChart()}
    </div>
  );
}
