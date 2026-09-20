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
  const [activeMenuProject, setActiveMenuProject] = useState(null);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
  const [detailsProject, setDetailsProject] = useState(null);
  const [projectSitesCount, setProjectSitesCount] = useState(0);
  const [projectAnalyticsCount, setProjectAnalyticsCount] = useState(0);

  // Modals
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Close 3-dots menu on outside click or scroll
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuProjectId(null);
        setActiveMenuProject(null);
      }
    };
    const handleScroll = () => {
      setActiveMenuProjectId(null);
      setActiveMenuProject(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
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
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-[#F3F4F6]">Dashboard</h1>
        </div>
      </div>

      {/* Main Two-Column View: Left Projects List, Right Sites List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Projects List (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          {/* Header with right-top option above list to add new project */}
          <div className="flex items-center justify-between pb-3 border-b border-[#2D3139]">
            <h2 className="text-sm font-semibold text-[#F3F4F6]">Projects</h2>
            <button
              id="add-project-btn"
              type="button"
              onClick={() => setIsProjectModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer btn-crystal-blue"
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
                  <div key={n} className="p-3.5 rounded-xl border border-[#2D3139]/40 bg-transparent animate-pulse flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.03]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/[0.05] rounded w-3/4" />
                      <div className="h-3 bg-white/[0.03] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#9CA3AF]">
                No projects found. Create one to get started.
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
                    className={`relative w-full text-left rounded-xl transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'flowing-border-container shadow-xl'
                        : 'border border-[#2D3139]/70 bg-transparent liquid-crystal-hover'
                    }`}
                  >
                    <div className={`p-3.5 flex items-center justify-between group ${isSelected ? 'flowing-border-inner' : ''}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-400/40'
                              : 'bg-transparent text-[#9CA3AF] border border-[#2D3139]/60 group-hover:text-[#F3F4F6] group-hover:border-blue-500/40'
                          }`}
                        >
                          <Folder className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div
                            className={`text-sm font-medium truncate ${
                              isSelected ? 'text-[#F3F4F6] font-semibold' : 'text-[#F3F4F6]'
                            }`}
                          >
                            {proj.name}
                          </div>
                          <div className="text-[11px] text-[#9CA3AF] font-mono mt-0.5">
                            ID: {proj.id}
                          </div>
                        </div>
                      </div>

                      {/* 3 dots menu instead of '>' */}
                      <div>
                        <button
                          type="button"
                          id={`project-menu-btn-${proj.id}`}
                          title="Project options"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeMenuProjectId === proj.id) {
                              setActiveMenuProjectId(null);
                              setActiveMenuProject(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const menuWidth = 144; // w-36 width
                              const menuHeight = 76;
                              const top = (rect.bottom + menuHeight > window.innerHeight)
                                ? Math.max(8, rect.top - menuHeight - 2)
                                : rect.bottom + 2;
                              const left = Math.max(8, rect.right - menuWidth);
                              setMenuCoords({ top, left });
                              setActiveMenuProjectId(proj.id);
                              setActiveMenuProject(proj);
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isMenuOpen || isSelected
                              ? 'text-[#F3F4F6] bg-white/[0.08]'
                              : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.05]'
                          }`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Sites List for Selected Project (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          {/* Header with Site Count and List/Map Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-[#2D3139]">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#F3F4F6]">
                {selectedProject ? selectedProject.name : 'Sites'}
              </h2>
              {selectedProject && (
                <span className="text-xs text-blue-400 font-semibold bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  {sites.length} {sites.length === 1 ? 'site' : 'sites'}
                </span>
              )}
            </div>

            {/* View Mode Toggle: List vs Map Overview */}
            {selectedProject && sites.length > 0 && (
              <div className="flex items-center border border-[#2D3139]/70 rounded-lg p-0.5 bg-white/[0.04]">
                <button
                  type="button"
                  onClick={() => setSitesViewMode('list')}
                  className={`px-2.5 py-1 text-xs rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                    sitesViewMode === 'list'
                      ? 'bg-white/[0.08] text-blue-400 font-semibold border border-blue-500/40 shadow-xs'
                      : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                  }`}
                  title="List view"
                >
                  <Layers className="w-3 h-3" />
                  <span>List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSitesViewMode('map')}
                  className={`px-2.5 py-1 text-xs rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                    sitesViewMode === 'map'
                      ? 'bg-white/[0.08] text-blue-400 font-semibold border border-blue-500/40 shadow-xs'
                      : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                  }`}
                  title="Map overview"
                >
                  <Globe className="w-3 h-3" />
                  <span>Map</span>
                </button>
              </div>
            )}
          </div>

          {/* Add New Site Option: Just above list in same section, styled with identical solid border as site list items */}
          {selectedProject && (
            <button
              id="add-site-row-btn"
              type="button"
              onClick={() => setIsSiteModalOpen(true)}
              className="w-full text-left p-3.5 rounded-xl border border-[#2D3139]/70 bg-transparent text-[#9CA3AF] hover:text-[#F3F4F6] transition-all duration-200 flex items-center justify-between group cursor-pointer liquid-crystal-hover"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-transparent text-blue-400 flex items-center justify-center shrink-0 border border-[#2D3139]/60 group-hover:border-blue-500/40 transition-colors">
                  <Plus className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-sm font-medium text-[#F3F4F6] group-hover:text-blue-400 transition-colors">Add site</div>
              </div>
              <span className="text-xs text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                + New
              </span>
            </button>
          )}

          {/* Sites Display: Either Multi-site Map View or Accordion List */}
          {loadingSites ? (
            <div className="space-y-2 py-2">
              {[1, 2].map((n) => (
                <div key={n} className="p-3.5 rounded-xl border border-[#2D3139]/40 bg-transparent animate-pulse flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 bg-white/[0.05] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !selectedProject ? (
            <div className="py-8 text-center text-xs text-[#9CA3AF]">
              Select a project to explore registered sites.
            </div>
          ) : sites.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#9CA3AF]">
              No sites in this project yet.
            </div>
          ) : sitesViewMode === 'map' ? (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                <span>Project sites geospatial overview</span>
                <span className="text-blue-400 font-semibold text-[11px]">Click any site polygon to open analytics</span>
              </div>
              <div className="rounded-xl overflow-hidden blurred-card-bg">
                <MapView
                  sites={sites}
                  height={380}
                  interactive={true}
                  showControls={true}
                  onSelectSite={(site) => onOpenSite(selectedProject, site)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {sites.map((site) => {
                const isExpanded = expandedSiteId === site.id;

                return (
                  <div
                    key={site.id}
                    id={`site-card-${site.id}`}
                    className={`rounded-xl overflow-hidden transition-all duration-200 ${
                      isExpanded
                        ? 'flowing-border-container shadow-xl'
                        : 'border border-[#2D3139]/70 bg-transparent liquid-crystal-hover'
                    }`}
                  >
                    <div className={isExpanded ? 'flowing-border-inner' : ''}>
                      {/* Site Item Row Header */}
                      <div
                        className="p-3.5 flex items-center justify-between cursor-pointer transition-colors select-none"
                        onClick={() => toggleSiteAccordion(site.id)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                            isExpanded
                              ? 'bg-blue-500/15 text-blue-300 border-blue-400/40'
                              : 'bg-transparent text-blue-400 border-[#2D3139]/60'
                          }`}>
                            <MapPin className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-semibold text-[#F3F4F6] truncate">
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
                          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
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
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="overflow-hidden border-t border-[#22252C]/60 bg-transparent"
                            style={{ willChange: 'height, opacity', transform: 'translateZ(0)' }}
                          >
                            <div className="p-3.5 space-y-3">
                              <div className="flex items-center justify-between text-xs text-[#9CA3AF] font-medium">
                                <span className="flex items-center gap-1.5">
                                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                                  Interactive Map Preview
                                </span>
                              </div>

                              <div
                                className="cursor-pointer rounded-lg overflow-hidden border border-[#2D3139]/70"
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

      {/* Floating 3-dots project options dropdown - above all content */}
      {activeMenuProjectId && activeMenuProject && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${menuCoords.top}px`,
            left: `${menuCoords.left}px`,
            zIndex: 9999,
          }}
          className="w-36 bg-[#0B0E17]/95 backdrop-blur-2xl rounded-xl border border-[#2D3139]/90 shadow-2xl py-1 text-xs animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => {
              const p = activeMenuProject;
              setActiveMenuProjectId(null);
              setActiveMenuProject(null);
              handleOpenDetails(e, p);
            }}
            className="w-full text-left px-3 py-2 text-[#F3F4F6] hover:bg-white/[0.08] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-blue-400" />
            Details
          </button>
          <button
            type="button"
            onClick={(e) => {
              const pid = activeMenuProject.id;
              setActiveMenuProjectId(null);
              setActiveMenuProject(null);
              handleDeleteProject(e, pid);
            }}
            className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/15 flex items-center gap-2 transition-colors cursor-pointer border-t border-[#22252C]"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
