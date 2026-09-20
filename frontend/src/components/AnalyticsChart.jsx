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
          borderColor: '#D65D80',
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return 'rgba(214, 93, 128, 0.15)';
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(214, 93, 128, 0.28)');
            gradient.addColorStop(1, 'rgba(214, 93, 128, 0.01)');
            return gradient;
          },
          borderWidth: 2.2,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#D65D80',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#D65D80',
          pointHoverBorderColor: '#FFFFFF',
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
          backgroundColor: '#FFFFFF',
          titleColor: '#231C20',
          bodyColor: '#231C20',
          borderColor: '#F0E2EA',
          borderWidth: 1,
          padding: 10,
          boxPadding: 4,
          cornerRadius: 6,
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
            color: '#756770',
            font: {
              size: 10,
              family: 'monospace',
            },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6,
          },
          border: {
            color: '#F0E2EA',
          },
        },
        y: {
          grid: {
            color: '#FAF0F4',
            lineWidth: 1,
          },
          ticks: {
            color: '#756770',
            font: {
              size: 10,
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
    <div id="analytics-chart-card" className="bg-white rounded-lg border border-[#DEC8D4] p-5 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EBD7E2]">
        <h2 className="text-sm font-semibold text-[#231C20]">Analytics</h2>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1 border border-[#DEC8D4] rounded p-0.5 bg-[#FAF5F7]">
          {['30d', '90d', 'all'].map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDateRange(range)}
              className={`text-xs px-2.5 py-1 rounded transition-colors cursor-pointer ${
                dateRange === range
                  ? 'bg-white text-[#D65D80] font-medium shadow-xs border border-[#DEC8D4]'
                  : 'text-[#756770] hover:text-[#231C20]'
              }`}
            >
              {range === '30d' ? '30 days' : range === '90d' ? '90 days' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex items-center gap-2 py-3 border-b border-[#EBD7E2] overflow-x-auto">
        {availableMetrics.map((m) => {
          const isActive = m === activeMetric;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onSelectMetric?.(m)}
              className={`text-xs px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#FDF2F6] text-[#D65D80] font-medium border border-[#D65D80]/40 shadow-xs'
                  : 'bg-white text-[#756770] hover:bg-[#FAF5F7] border border-[#DEC8D4]'
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>

      {/* Summary Metrics Row (Clean text, no badges or pills) */}
      <div className="grid grid-cols-4 gap-2 py-3.5 border-b border-[#EBD7E2] text-center">
        <div>
          <div className="text-[11px] text-[#756770]">Latest</div>
          <div className="text-sm font-medium text-[#231C20] mt-0.5">{stats.latest}</div>
        </div>
        <div>
          <div className="text-[11px] text-[#756770]">Average</div>
          <div className="text-sm font-medium text-[#231C20] mt-0.5">{stats.avg}</div>
        </div>
        <div>
          <div className="text-[11px] text-[#756770]">Minimum</div>
          <div className="text-sm font-medium text-[#231C20] mt-0.5">{stats.min}</div>
        </div>
        <div>
          <div className="text-[11px] text-[#756770]">Maximum</div>
          <div className="text-sm font-medium text-[#231C20] mt-0.5">{stats.max}</div>
        </div>
      </div>

      {/* Chart.js Canvas */}
      <div className="relative pt-4" style={{ height: '240px' }}>
        {filteredData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-[#756770]">
            No records for this metric.
          </div>
        ) : (
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
