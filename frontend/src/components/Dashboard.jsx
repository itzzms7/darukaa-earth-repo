import { useState, useEffect, useRef } from 'react';
import { Plus, MoreVertical, ExternalLink, MapPin, Folder, Layers, Trash2, Info, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MapView from './MapView.jsx';
import ProjectModal from './ProjectModal.jsx';
import SiteModal from './SiteModal.jsx';
import ProjectDetailsModal from './ProjectDetailsModal.jsx';
import { api } from '../api/client.js';

export default function Dashboard({ onOpenSite }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [sites, setSites] = useState([]);
  const [expandedSiteId, setExpandedSiteId] = useState(null);
  const [sitesViewMode, setSitesViewMode] = useState('list'); // 'list' | 'map'
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingSites, setLoadingSites] = useState(false);

  // 3-dots project menu
  const [activeMenuProjectId, setActiveMenuProjectId] = useState(null);
  const [detailsProject, setDetailsProject] = useState(null);
  const [projectSitesCount, setProjectSitesCount] = useState(0);
  const [projectAnalyticsCount, setProjectAnalyticsCount] = useState(0);

  // Modals
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Close 3-dots menu on outside click
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuProjectId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load Projects
  const fetchProjects = async () => {
    setLoadingProjects(true);
    const data = await api.getProjects();
    setProjects(data);
    if (data.length > 0 && !selectedProjectId) {
      setSelectedProjectId(data[0].id);
    }
    setLoadingProjects(false);
  };

  // Load Sites when selected project changes
  const fetchSites = async (projId) => {
    if (!projId) {
      setSites([]);
      return;
    }
    setLoadingSites(true);
    const data = await api.getSites(projId);
    setSites(data);
    setExpandedSiteId(null);
    setLoadingSites(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchSites(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleCreateProject = async (name) => {
    const newProj = await api.createProject(name);
    await fetchProjects();
    setSelectedProjectId(newProj.id);
  };

  const handleCreateSite = async (name, geometry) => {
    if (!selectedProjectId) return;
    await api.createSite(selectedProjectId, name, geometry);
    await fetchSites(selectedProjectId);
  };

  const handleDeleteProject = async (e, projId) => {
    e.stopPropagation();
    setActiveMenuProjectId(null);
    await api.deleteProject(projId);
    const remaining = projects.filter((p) => Number(p.id) !== Number(projId));
    setProjects(remaining);
    if (Number(selectedProjectId) === Number(projId)) {
      if (remaining.length > 0) {
        setSelectedProjectId(remaining[0].id);
      } else {
        setSelectedProjectId(null);
        setSites([]);
      }
    }
  };

  const handleOpenDetails = async (e, proj) => {
    e.stopPropagation();
    setActiveMenuProjectId(null);
    setDetailsProject(proj);
    const projSites = await api.getSites(proj.id);
    setProjectSitesCount(projSites.length);
    let totalAnalytics = 0;
    for (const s of projSites) {
      const a = await api.getAnalytics(s.id);
      totalAnalytics += a.length;
    }
    setProjectAnalyticsCount(totalAnalytics);
    setIsDetailsModalOpen(true);
  };

  const selectedProject = projects.find((p) => Number(p.id) === Number(selectedProjectId));

  const toggleSiteAccordion = (siteId) => {
    setExpandedSiteId((prev) => (prev === siteId ? null : siteId));
  };

  return (
    <div id="dashboard-container" className="space-y-6">
      {/* Simple grounded 1-word page title with zero description text */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-[#231C20]">Dashboard</h1>
      </div>

      {/* Main Two-Column View: Left Projects List, Right Sites List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Projects List (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-lg border border-[#DEC8D4] p-5 space-y-4 shadow-xs">
          {/* Header with right-top option above list to add new project */}
          <div className="flex items-center justify-between pb-3 border-b border-[#EBD7E2]">
            <h2 className="text-sm font-semibold text-[#231C20]">Projects</h2>
            <button
              id="add-project-btn"
              type="button"
              onClick={() => setIsProjectModalOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-[#D65D80] hover:bg-[#C44E72] rounded transition-colors flex items-center gap-1.5 shadow-xs active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add project
            </button>
          </div>

          {/* Project List Items with Skeleton Loading */}
          <div className="space-y-2">
            {loadingProjects ? (
              <div className="space-y-2 py-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="p-3.5 rounded-lg border border-[#DEC8D4] bg-[#FCF9FA] animate-pulse flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#F0E2EA]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-[#F0E2EA] rounded w-3/4" />
                      <div className="h-3 bg-[#F5EBF0] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#756770]">
                No projects.
              </div>
            ) : (
              projects.map((proj) => {
                const isSelected = Number(proj.id) === Number(selectedProjectId);
                const isMenuOpen = activeMenuProjectId === proj.id;

                return (
                  <div
                    key={proj.id}
                    id={`project-item-${proj.id}`}
                    onClick={() => setSelectedProjectId(proj.id)}
                    className={`relative w-full text-left p-3.5 rounded-lg border transition-all duration-150 flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-[#FDF2F6] border-[#D65D80] shadow-sm'
                        : 'bg-white border-[#DEC8D4] hover:bg-[#FAF5F7] hover:border-[#D65D80] hover:shadow-md hover:-translate-y-[0.5px]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-white text-[#D65D80] border border-[#E6D0DC]'
                            : 'bg-[#FAF5F7] text-[#756770] group-hover:text-[#231C20]'
                        }`}
                      >
                        <Folder className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`text-sm font-medium truncate ${
                            isSelected ? 'text-[#231C20] font-semibold' : 'text-[#231C20]'
                          }`}
                        >
                          {proj.name}
                        </div>
                        <div className="text-[11px] text-[#756770] mt-0.5">
                          ID: {proj.id}
                        </div>
                      </div>
                    </div>

                    {/* 3 dots menu instead of '>' */}
                    <div className="relative" ref={isMenuOpen ? menuRef : null}>
                      <button
                        type="button"
                        id={`project-menu-btn-${proj.id}`}
                        title="Project options"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuProjectId(isMenuOpen ? null : proj.id);
                        }}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                          isMenuOpen || isSelected
                            ? 'text-[#231C20] hover:bg-white'
                            : 'text-[#A698A0] hover:text-[#231C20] hover:bg-[#FAF0F4]'
                        }`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown with Details and Delete */}
                      {isMenuOpen && (
                        <div
                          className="absolute right-0 top-8 z-30 w-32 bg-white rounded-md border border-[#F0E2EA] shadow-md py-1 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => handleOpenDetails(e, proj)}
                            className="w-full text-left px-3 py-1.5 text-[#231C20] hover:bg-[#FAF5F7] flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Info className="w-3.5 h-3.5 text-[#756770]" />
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteProject(e, proj.id)}
                            className="w-full text-left px-3 py-1.5 text-[#E03137] hover:bg-[#FDF2F4] flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#E03137]" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Sites List for Selected Project (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-lg border border-[#DEC8D4] p-5 space-y-4 shadow-xs">
          {/* Header with Site Count and List/Map Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-[#EBD7E2]">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#231C20]">
                {selectedProject ? selectedProject.name : 'Sites'}
              </h2>
              {selectedProject && (
                <span className="text-xs text-[#756770] font-medium bg-[#FAF5F7] px-2 py-0.5 rounded border border-[#DEC8D4]">
                  {sites.length} {sites.length === 1 ? 'site' : 'sites'}
                </span>
              )}
            </div>

            {/* View Mode Toggle: List vs Map Overview */}
            {selectedProject && sites.length > 0 && (
              <div className="flex items-center border border-[#DEC8D4] rounded p-0.5 bg-[#FAF5F7]">
                <button
                  type="button"
                  onClick={() => setSitesViewMode('list')}
                  className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1 cursor-pointer ${
                    sitesViewMode === 'list'
                      ? 'bg-white text-[#D65D80] font-medium shadow-xs border border-[#DEC8D4]'
                      : 'text-[#756770] hover:text-[#231C20]'
                  }`}
                  title="List view"
                >
                  <Layers className="w-3 h-3" />
                  <span>List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSitesViewMode('map')}
                  className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1 cursor-pointer ${
                    sitesViewMode === 'map'
                      ? 'bg-white text-[#D65D80] font-medium shadow-xs border border-[#DEC8D4]'
                      : 'text-[#756770] hover:text-[#231C20]'
                  }`}
                  title="Map overview"
                >
                  <Globe className="w-3 h-3" />
                  <span>Map</span>
                </button>
              </div>
            )}
          </div>

          {/* Add New Site Option: Just above list in same section, styled with hover lift */}
          {selectedProject && (
            <button
              id="add-site-row-btn"
              type="button"
              onClick={() => setIsSiteModalOpen(true)}
              className="w-full text-left p-3.5 rounded-lg border border-dashed border-[#D2BAC8] hover:border-[#D65D80] hover:bg-[#FDF5F8] text-[#756770] hover:text-[#D65D80] transition-all duration-150 flex items-center justify-between group cursor-pointer hover:shadow-md hover:-translate-y-[0.5px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded border border-dashed border-[#D65D80]/40 flex items-center justify-center bg-white group-hover:bg-[#FDF2F6]">
                  <Plus className="w-4 h-4 text-[#D65D80]" />
                </div>
                <div className="text-sm font-medium">Add site</div>
              </div>
              <span className="text-xs text-[#D65D80] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                + New
              </span>
            </button>
          )}

          {/* Sites Display: Either Multi-site Map View or Accordion List */}
          {loadingSites ? (
            <div className="space-y-2 py-2">
              {[1, 2].map((n) => (
                <div key={n} className="p-3.5 rounded-lg border border-[#DEC8D4] bg-[#FCF9FA] animate-pulse flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#F0E2EA]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 bg-[#F0E2EA] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !selectedProject ? (
            <div className="py-8 text-center text-xs text-[#756770]">
              Select a project.
            </div>
          ) : sites.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#756770]">
              No sites.
            </div>
          ) : sitesViewMode === 'map' ? (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-[#756770]">
                <span>Project sites geospatial overview</span>
                <span className="text-[#D65D80] font-medium text-[11px]">Click any site polygon to open analytics</span>
              </div>
              <MapView
                sites={sites}
                height={380}
                interactive={true}
                showControls={true}
                onSelectSite={(site) => onOpenSite(selectedProject, site)}
              />
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {sites.map((site) => {
                const isExpanded = expandedSiteId === site.id;

                return (
                  <div
                    key={site.id}
                    id={`site-card-${site.id}`}
                    className="rounded-lg border border-[#DEC8D4] overflow-hidden bg-white transition-all duration-150 shadow-xs hover:shadow-md hover:border-[#D65D80] hover:-translate-y-[0.5px]"
                  >
                    {/* Site Item Row Header */}
                    <div
                      className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#FAF5F7] transition-colors select-none"
                      onClick={() => toggleSiteAccordion(site.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded bg-[#FAF5F7] text-[#D65D80] flex items-center justify-center shrink-0 border border-[#DEC8D4]">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-[#231C20] truncate">
                          {site.name}
                        </span>
                      </div>

                      {/* Open site action: text 'Open site' with open symbol to its right, no '>' symbol */}
                      <button
                        type="button"
                        id={`open-site-action-${site.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenSite(selectedProject, site);
                        }}
                        className="flex items-center gap-1 text-xs text-[#D65D80] hover:underline font-medium cursor-pointer"
                      >
                        <span>Open site</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Smooth Accordion Map Dropdown with AnimatePresence */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key={`accordion-${site.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden border-t border-[#EBD7E2] bg-[#FCF9FA]"
                        >
                          <div className="p-3.5 space-y-3">
                            <div className="flex items-center justify-between text-xs text-[#756770]">
                              <span className="flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-[#D65D80]" />
                                Map preview
                              </span>
                            </div>

                            <div
                              className="cursor-pointer"
                              onClick={() => onOpenSite(selectedProject, site)}
                            >
                              <MapView
                                geometry={site.geometry}
                                height={220}
                                interactive={false}
                                showControls={false}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onCreate={handleCreateProject}
      />

      <SiteModal
        isOpen={isSiteModalOpen}
        onClose={() => setIsSiteModalOpen(false)}
        onCreate={handleCreateSite}
      />

      <ProjectDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        project={detailsProject}
        sitesCount={projectSitesCount}
        analyticsCount={projectAnalyticsCount}
      />
    </div>
  );
}
