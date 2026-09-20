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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-[2px]">
      <div
        id="data-record-dialog"
        className="w-full max-w-md bg-white rounded-lg border border-[#F0E2EA] p-6 shadow-md"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#F0E2EA]">
          <h2 className="text-base font-semibold text-[#231C20]">
            {record ? 'Edit record' : 'Add record'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#756770] hover:text-[#231C20] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-4 space-y-4">
          <div>
            <label htmlFor="metric-select" className="block text-xs font-medium text-[#231C20] mb-1">
              Metric
            </label>
            <select
              id="metric-select"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF6F8] rounded border border-[#E6D8DF] focus:border-[#D65D80] outline-none"
            >
              {COMMON_METRICS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              <option value="custom">Other / Custom</option>
            </select>
            {metric === 'custom' && (
              <input
                type="text"
                placeholder="Enter metric name"
                value={customMetric}
                onChange={(e) => setCustomMetric(e.target.value)}
                className="mt-2 w-full px-3 py-2 text-sm bg-[#FAF6F8] rounded border border-[#E6D8DF] focus:border-[#D65D80] outline-none"
              />
            )}
          </div>

          <div>
            <label htmlFor="record-date-input" className="block text-xs font-medium text-[#231C20] mb-1">
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
              className={`w-full px-3 py-2 text-sm bg-[#FAF6F8] rounded border outline-none transition-colors ${
                dateError
                  ? 'border-[#E03137] focus:border-[#E03137]'
                  : 'border-[#E6D8DF] focus:border-[#D65D80]'
              }`}
            />
            {dateError && (
              <p className="text-xs text-[#E03137] mt-1 font-medium">{dateError}</p>
            )}
          </div>

          <div>
            <label htmlFor="record-value-input" className="block text-xs font-medium text-[#231C20] mb-1">
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
              className={`w-full px-3 py-2 text-sm bg-[#FAF6F8] rounded border outline-none transition-colors ${
                valueError
                  ? 'border-[#E03137] focus:border-[#E03137]'
                  : 'border-[#E6D8DF] focus:border-[#D65D80]'
              }`}
            />
            {valueError && (
              <p className="text-xs text-[#E03137] mt-1 font-medium">{valueError}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F0E2EA]">
            <button
              id="cancel-record-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#756770] hover:text-[#231C20] rounded border border-[#E6D8DF] bg-white hover:bg-[#FAF6F8] transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-record-btn"
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-[#D65D80] hover:bg-[#C44E72] rounded transition-colors active:scale-[0.98]"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
