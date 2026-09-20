import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Download, Edit3, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import MapView from './MapView.jsx';
import AnalyticsChart from './AnalyticsChart.jsx';
import DataModal from './DataModal.jsx';
import EditPolygonModal from './EditPolygonModal.jsx';
import { api } from '../api/client.js';

export default function SiteDetailPage({ project, site, onBack, onUpdateSite, currentUser }) {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('NDVI');
  
  // Modals
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isPolygonModalOpen, setIsPolygonModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const loadAnalytics = async () => {
    setLoading(true);
    const data = await api.getAnalytics(site.id);
    setAnalytics(data);
    setLoading(false);
  };

  useEffect(() => {
    if (site?.id) {
      loadAnalytics();
    }
  }, [site?.id]);

  const handleSaveRecord = async (recordData) => {
    if (recordData.id) {
      await api.updateAnalytics(recordData.id, recordData.metric, recordData.date, recordData.value);
      showToast('Data saved.');
    } else {
      await api.createAnalytics(site.id, recordData.metric, recordData.date, recordData.value);
      showToast('Data added.');
    }
    await loadAnalytics();
    setSelectedMetric(recordData.metric);
  };

  const handleDeleteRecord = async (recordId) => {
    await api.deleteAnalytics(recordId);
    showToast('Record deleted.');
    await loadAnalytics();
  };

  const handleLoadSampleData = async () => {
    await api.loadSampleAnalytics(site.id);
    showToast('Sample data loaded.');
    await loadAnalytics();
  };

  const handleSavePolygon = async (newGeometry) => {
    const updated = await api.updateSiteGeometry(site.id, newGeometry);
    onUpdateSite?.(updated);
    showToast('Polygon updated.');
  };

  return (
    <motion.div
      id="site-detail-page"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Top Header & Navigation */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#EBD7E2]">
        <button
          id="back-to-projects-btn"
          type="button"
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded border border-[#DEC8D4] bg-white text-[#756770] hover:text-[#231C20] hover:bg-[#FAF6F8] transition-colors shadow-xs cursor-pointer"
          title="Back to dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="text-xs text-[#756770]">
            {project?.name || 'Project'}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#231C20] mt-0.5">{site.name}</h1>
        </div>
      </div>

      {/* Main Split Grid: Left Map + Data Table, Right Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Map & Data Operations (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Map Card */}
          <div className="bg-white rounded-lg border border-[#DEC8D4] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EBD7E2]">
              <h2 className="text-sm font-semibold text-[#231C20]">Site map</h2>
              <button
                id="edit-map-trigger"
                type="button"
                onClick={() => setIsPolygonModalOpen(true)}
                className="text-xs px-3 py-1.5 rounded border border-[#DEC8D4] text-[#231C20] hover:text-[#D65D80] hover:border-[#D65D80] hover:bg-[#FDF2F6] transition-colors font-medium flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit map
              </button>
            </div>

            <MapView
              geometry={site.geometry}
              height={360}
              interactive={true}
              showControls={true}
              onEditPolygon={() => setIsPolygonModalOpen(true)}
            />
          </div>

          {/* Below Map: Data Management Section */}
          <div className="bg-white rounded-lg border border-[#DEC8D4] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#EBD7E2]">
              <h2 className="text-sm font-semibold text-[#231C20]">Records</h2>

              {/* Options to Add Data or Load Sample Data */}
              <div className="flex items-center gap-2">
                <button
                  id="load-sample-data-btn"
                  type="button"
                  onClick={handleLoadSampleData}
                  className="text-xs px-3 py-1.5 rounded border border-[#DEC8D4] text-[#756770] hover:text-[#231C20] hover:bg-[#FAF6F8] transition-colors font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Load sample data
                </button>
                <button
                  id="add-data-record-btn"
                  type="button"
                  onClick={() => {
                    setEditingRecord(null);
                    setIsDataModalOpen(true);
                  }}
                  className="text-xs px-3 py-1.5 rounded bg-[#D65D80] hover:bg-[#C44E72] text-white transition-colors font-medium flex items-center gap-1.5 active:scale-[0.98] shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add data
                </button>
              </div>
            </div>

            {/* Records Table */}
            <div className="pt-2 overflow-x-auto">
              {loading ? (
                <div className="py-4 space-y-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-8 bg-[#FAF5F7] rounded animate-pulse w-full" />
                  ))}
                </div>
              ) : analytics.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#756770]">
                  No records.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#EBD7E2] text-[#756770]">
                      <th className="py-2.5 font-medium">Date</th>
                      <th className="py-2.5 font-medium">Metric</th>
                      <th className="py-2.5 font-medium">Value</th>
                      <th className="py-2.5 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBD7E2]">
                    {analytics.map((row) => (
                      <tr key={row.id} className="hover:bg-[#FAF5F7] transition-colors">
                        <td className="py-2.5 text-[#231C20] font-mono">{row.date}</td>
                        <td className="py-2.5 text-[#231C20]">{row.metric}</td>
                        <td className="py-2.5 text-[#231C20] font-medium">{row.value}</td>
                        <td className="py-2.5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRecord(row);
                              setIsDataModalOpen(true);
                            }}
                            className="text-[#756770] hover:text-[#D65D80] transition-colors p-1 cursor-pointer"
                            title="Edit data"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(row.id)}
                            className="text-[#756770] hover:text-[#E03137] transition-colors p-1 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Analytics Chart & Options (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <AnalyticsChart
            analytics={analytics}
            selectedMetric={selectedMetric}
            onSelectMetric={setSelectedMetric}
          />
        </div>
      </div>

      {/* Modals */}
      <DataModal
        isOpen={isDataModalOpen}
        onClose={() => {
          setIsDataModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
        record={editingRecord}
      />

      <EditPolygonModal
        isOpen={isPolygonModalOpen}
        onClose={() => setIsPolygonModalOpen(false)}
        geometry={site.geometry}
        onSave={handleSavePolygon}
      />

      {/* Google Material Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#231C20] text-white text-xs px-4 py-2 rounded shadow-lg transition-all">
          {toastMessage}
        </div>
      )}
    </motion.div>
  );
}
