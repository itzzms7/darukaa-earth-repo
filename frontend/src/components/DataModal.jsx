import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const COMMON_METRICS = ['NDVI', 'Soil Moisture', 'Biomass Index', 'Canopy Cover', 'Surface Temp'];

export default function DataModal({ isOpen, onClose, onSave, record = null }) {
  const [metric, setMetric] = useState('NDVI');
  const [customMetric, setCustomMetric] = useState('');
  const [date, setDate] = useState('');
  const [value, setValue] = useState('');
  const [dateError, setDateError] = useState('');
  const [valueError, setValueError] = useState('');

  useEffect(() => {
    if (record) {
      if (COMMON_METRICS.includes(record.metric)) {
        setMetric(record.metric);
        setCustomMetric('');
      } else {
        setMetric('custom');
        setCustomMetric(record.metric);
      }
      setDate(record.date || '');
      setValue(record.value !== undefined ? String(record.value) : '');
    } else {
      setMetric('NDVI');
      setCustomMetric('');
      setDate(new Date().toISOString().split('T')[0]);
      setValue('');
    }
    setDateError('');
    setValueError('');
  }, [record, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    let hasError = false;

    if (!date.trim()) {
      setDateError('Select a date.');
      hasError = true;
    } else {
      setDateError('');
    }

    if (!value.trim() || isNaN(Number(value))) {
      setValueError('Enter a numeric value.');
      hasError = true;
    } else {
      setValueError('');
    }

    if (hasError) return;

    const chosenMetric = metric === 'custom' ? customMetric.trim() || 'Custom Metric' : metric;
    onSave({
      id: record ? record.id : undefined,
      metric: chosenMetric,
      date,
      value: Number(value),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        id="data-record-dialog"
        className="w-full max-w-md text-[#F3F4F6] rounded-2xl p-6 blurred-card-bg"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#2D3139]">
          <h2 className="text-base font-semibold text-[#F3F4F6]">
            {record ? 'Edit record' : 'Add record'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-4 space-y-4">
          <div>
            <label htmlFor="metric-select" className="block text-xs font-medium text-[#9CA3AF] mb-1">
              Metric
            </label>
            <select
              id="metric-select"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white/[0.04] text-[#F3F4F6] rounded-xl border border-[#2D3139]/70 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 outline-none"
            >
              {COMMON_METRICS.map((m) => (
                <option key={m} value={m} className="bg-[#181A20] text-[#F3F4F6]">
                  {m}
                </option>
              ))}
              <option value="custom" className="bg-[#181A20] text-[#F3F4F6]">Other / Custom</option>
            </select>
            {metric === 'custom' && (
              <input
                type="text"
                placeholder="Enter metric name"
                value={customMetric}
                onChange={(e) => setCustomMetric(e.target.value)}
                className="mt-2 w-full px-3.5 py-2 text-sm bg-white/[0.04] text-[#F3F4F6] placeholder-[#6B7280] rounded-xl border border-[#2D3139]/70 focus:border-blue-500 outline-none"
              />
            )}
          </div>

          <div>
            <label htmlFor="record-date-input" className="block text-xs font-medium text-[#9CA3AF] mb-1">
              Date
            </label>
            <input
              id="record-date-input"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (dateError) setDateError('');
              }}
              className={`w-full px-3.5 py-2 text-sm bg-white/[0.04] text-[#F3F4F6] rounded-xl border outline-none transition-all ${
                dateError
                  ? 'border-[#EF4444] focus:border-[#EF4444]'
                  : 'border-[#2D3139]/70 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15'
              }`}
            />
            {dateError && (
              <p className="text-xs text-[#EF4444] mt-1 font-medium">{dateError}</p>
            )}
          </div>

          <div>
            <label htmlFor="record-value-input" className="block text-xs font-medium text-[#9CA3AF] mb-1">
              Value
            </label>
            <input
              id="record-value-input"
              type="number"
              step="any"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (valueError) setValueError('');
              }}
              placeholder="e.g. 0.82"
              className={`w-full px-3.5 py-2 text-sm bg-white/[0.04] text-[#F3F4F6] placeholder-[#6B7280] rounded-xl border outline-none transition-all ${
                valueError
                  ? 'border-[#EF4444] focus:border-[#EF4444]'
                  : 'border-[#2D3139]/70 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15'
              }`}
            />
            {valueError && (
              <p className="text-xs text-[#EF4444] mt-1 font-medium">{valueError}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#2D3139]">
            <button
              id="cancel-record-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#9CA3AF] hover:text-[#F3F4F6] rounded-xl border border-[#2D3139]/70 bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-record-btn"
              type="submit"
              className="px-4.5 py-2 text-xs font-semibold rounded-xl cursor-pointer btn-crystal-blue"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
