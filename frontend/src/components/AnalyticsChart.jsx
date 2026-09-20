import { useState, useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components according to guidelines
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsChart({ analytics = [], selectedMetric = 'NDVI', onSelectMetric }) {
  const [dateRange, setDateRange] = useState('all'); // '30d', '90d', 'all'
  const chartRef = useRef(null);

  // Available metrics in the dataset
  const availableMetrics = useMemo(() => {
    const set = new Set();
    analytics.forEach((item) => set.add(item.metric));
    if (!set.size) return ['NDVI', 'Soil Moisture', 'Biomass Index'];
    return Array.from(set);
  }, [analytics]);

  // Current metric to display
  const activeMetric = availableMetrics.includes(selectedMetric)
    ? selectedMetric
    : availableMetrics[0] || 'NDVI';

  // Filter and sort items by date
  const filteredData = useMemo(() => {
    let items = analytics.filter((a) => a.metric === activeMetric);
    items = items.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (dateRange === '30d') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      items = items.filter((a) => new Date(a.date) >= cutoff);
    } else if (dateRange === '90d') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      items = items.filter((a) => new Date(a.date) >= cutoff);
    }
    return items;
  }, [analytics, activeMetric, dateRange]);

  // Summary statistics
  const stats = useMemo(() => {
    if (!filteredData.length) return { min: '0.00', max: '0.00', avg: '0.00', latest: '0.00' };
    const values = filteredData.map((d) => Number(d.value));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const latest = values[values.length - 1];

    return {
      min: min.toFixed(2),
      max: max.toFixed(2),
      avg: avg.toFixed(2),
      latest: Number(latest).toFixed(2),
    };
  }, [filteredData]);

  // Chart.js Dataset configuration
  const chartData = useMemo(() => {
    const labels = filteredData.map((d) => d.date);
    const dataPoints = filteredData.map((d) => Number(d.value));

    return {
      labels,
      datasets: [
        {
          label: activeMetric,
          data: dataPoints,
          borderColor: '#3B82F6',
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return 'rgba(59, 130, 246, 0.15)';
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.01)');
            return gradient;
          },
          borderWidth: 2.2,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#1E2028',
          pointBorderColor: '#3B82F6',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#3B82F6',
          pointHoverBorderColor: '#F3F4F6',
          pointHoverBorderWidth: 2,
        },
      ],
    };
  }, [filteredData, activeMetric]);

  // Chart.js Options configuration
  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          backgroundColor: '#1E2028',
          titleColor: '#F3F4F6',
          bodyColor: '#F3F4F6',
          borderColor: '#2D3139',
          borderWidth: 1,
          padding: 10,
          boxPadding: 4,
          cornerRadius: 8,
          usePointStyle: true,
          callbacks: {
            label: (item) => ` ${activeMetric}: ${item.raw}`,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#9CA3AF',
            font: {
              size: 10,
              family: 'monospace',
              weight: '500',
            },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6,
          },
          border: {
            color: '#2D3139',
          },
        },
        y: {
          grid: {
            color: '#22252C',
            lineWidth: 1,
          },
          ticks: {
            color: '#9CA3AF',
            font: {
              size: 10,
              weight: '500',
            },
            padding: 6,
          },
          border: {
            display: false,
          },
        },
      },
    };
  }, [activeMetric]);

  return (
    <div id="analytics-chart-card" className="space-y-4 p-4 rounded-xl border border-[#2D3139]/70 bg-transparent liquid-crystal-card">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2D3139]">
        <h2 className="text-sm font-semibold text-[#F3F4F6]">Analytics</h2>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1 border border-[#2D3139]/70 rounded-lg p-0.5 bg-transparent">
          {['30d', '90d', 'all'].map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDateRange(range)}
              className={`text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                dateRange === range
                  ? 'bg-black/80 backdrop-blur-xl text-blue-400 font-semibold border border-blue-500/40 shadow-xs'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              {range === '30d' ? '30 days' : range === '90d' ? '90 days' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex items-center gap-2 py-3 border-b border-[#2D3139] overflow-x-auto">
        {availableMetrics.map((m) => {
          const isActive = m === activeMetric;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onSelectMetric?.(m)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-black/80 backdrop-blur-xl text-blue-400 font-semibold border border-blue-500/40 shadow-xs'
                  : 'border border-[#2D3139]/70 bg-transparent text-[#9CA3AF] hover:text-[#F3F4F6] liquid-crystal-hover'
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-4 gap-2 py-3.5 border-b border-[#2D3139] text-center">
        <div>
          <div className="text-[11px] text-[#9CA3AF] font-medium">Latest</div>
          <div className="text-sm font-semibold text-[#F3F4F6] mt-0.5">{stats.latest}</div>
        </div>
        <div>
          <div className="text-[11px] text-[#9CA3AF] font-medium">Average</div>
          <div className="text-sm font-semibold text-[#F3F4F6] mt-0.5">{stats.avg}</div>
        </div>
        <div>
          <div className="text-[11px] text-[#9CA3AF] font-medium">Minimum</div>
          <div className="text-sm font-semibold text-[#F3F4F6] mt-0.5">{stats.min}</div>
        </div>
        <div>
          <div className="text-[11px] text-[#9CA3AF] font-medium">Maximum</div>
          <div className="text-sm font-semibold text-[#F3F4F6] mt-0.5">{stats.max}</div>
        </div>
      </div>

      {/* Chart.js Canvas */}
      <div className="relative pt-4" style={{ height: '240px' }}>
        {filteredData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-[#9CA3AF]">
            No records for this metric.
          </div>
        ) : (
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
