import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  User, 
  FolderKanban, 
  Cpu, 
  Briefcase, 
  Wrench, 
  Mail, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import AdminOverview from './tabs/AdminOverview';
import AdminProfile from './tabs/AdminProfile';
import AdminProjects from './tabs/AdminProjects';
import AdminSkills from './tabs/AdminSkills';
import AdminExperience from './tabs/AdminExperience';
import AdminServices from './tabs/AdminServices';
import AdminMessages from './tabs/AdminMessages';
import AdminToast from './common/AdminToast';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'skills', label: 'Skills & 3D Orbits', icon: Cpu },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'services', label: 'Services', icon: Wrench },
  { id: 'messages', label: 'Messages Inbox', icon: Mail }
];

export default function AdminDashboard({ admin, onLogout, onUpdateAccount, onBackToPublic }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (toastObj, maybeMsg) => {
    if (typeof toastObj === 'string') {
      setToast({ type: toastObj, message: maybeMsg || '' });
    } else if (toastObj && typeof toastObj === 'object') {
      setToast(toastObj);
    }
  };

  const closeToast = () => {
    setToast(null);
  };

  const handleNavSelect = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  // Handle Mobile Menu Escape key and background scroll lock
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <div className="h-screen w-full bg-[#0A0908] text-[#F5F1EC] flex overflow-hidden font-sans selection:bg-[#FF5722]/30 selection:text-[#F5F1EC] relative">
      
      {/* Background Ambience Elements */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[#FF5722]/05 blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-[#FF9A3D]/05 blur-[140px] rounded-full pointer-events-none" />

      {/* Toast Notification Container */}
      <AdminToast toast={toast} onClose={closeToast} />

      {/* Desktop Sidebar (100% Fixed and Stationary) */}
      <aside 
        className={`hidden lg:flex flex-col justify-between bg-[#100E0D] border-r border-white/10 shrink-0 z-20 h-full transition-all duration-300 select-none ${
          sidebarCollapsed ? 'w-20 p-3 items-center' : 'w-64 p-5'
        }`}
      >
        <div className="space-y-6 w-full">
          {/* Brand / Logo + Collapse Toggle Button */}
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5722] to-[#FF9A3D] p-0.5 shadow-lg shadow-[#FF5722]/20 shrink-0">
                <div className="w-full h-full bg-[#0D0B0A] rounded-[10px] flex items-center justify-center text-[#FF9A3D]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              {!sidebarCollapsed && (
                <div className="truncate">
                  <h1 className="font-sora font-extrabold text-sm text-[#F5F1EC] tracking-tight truncate">
                    Portfolio CMS
                  </h1>
                  <div className="text-[11px] font-mono text-[#9A9088]">
                    Admin Workspace
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-[#9A9088] hover:text-[#FF9A3D] hover:bg-white/05 transition-colors cursor-pointer shrink-0"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-230px)] pr-1 custom-scrollbar">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavSelect(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    sidebarCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
                  } rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FF5722] text-[#0D0B0A] font-bold shadow-lg shadow-[#FF5722]/20'
                      : 'text-[#9A9088] hover:text-[#F5F1EC] hover:bg-white/05'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Identity & Bottom Actions */}
        <div className="space-y-3 pt-4 border-t border-white/10 w-full shrink-0">
          {/* Admin Tag */}
          {!sidebarCollapsed ? (
            <div className="p-3 rounded-xl bg-white/03 border border-white/05 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#9A9088]">
                Signed in as
              </div>
              <div className="font-mono text-xs font-bold text-[#F5F1EC] truncate">
                {admin?.name || 'Hassaan Ali Akbar'}
              </div>
              <div className="text-[10px] font-mono text-[#9A9088] truncate">
                {admin?.email || 'admin@hassaan.dev'}
              </div>
            </div>
          ) : (
            <div 
              className="w-10 h-10 mx-auto rounded-xl bg-white/05 border border-white/05 flex items-center justify-center text-[#FF9A3D] text-xs font-mono font-bold cursor-default"
              title={`${admin?.name || 'Hassaan Ali Akbar'} (${admin?.email || 'admin@hassaan.dev'})`}
            >
              {(admin?.name || 'H').charAt(0)}
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={onBackToPublic}
              title={sidebarCollapsed ? 'Return to Public Portfolio' : undefined}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-mono text-[#9A9088] hover:text-[#F5F1EC] bg-white/05 hover:bg-white/10 border border-white/08 transition-colors cursor-pointer ${
                sidebarCollapsed ? 'p-2.5' : ''
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              {!sidebarCollapsed && <span>Public Portfolio</span>}
            </button>

            <button
              onClick={onLogout}
              title={sidebarCollapsed ? 'Sign Out' : undefined}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-mono font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer ${
                sidebarCollapsed ? 'p-2.5' : ''
              }`}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              {!sidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#100E0D]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FF5722]/20 border border-[#FF5722]/30 flex items-center justify-center text-[#FF9A3D]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-sora font-bold text-xs text-[#F5F1EC]">
            Portfolio CMS
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-white/05 text-[#F5F1EC] border border-white/10 cursor-pointer"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-md pt-16 p-4 overflow-y-auto"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="bg-[#141210] border border-white/15 rounded-2xl p-5 space-y-4 max-w-sm mx-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-sora text-xs font-bold text-[#F5F1EC] uppercase tracking-wider">
                Admin Navigation
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-[#9A9088] hover:text-[#F5F1EC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#FF5722] text-[#0D0B0A] font-bold shadow-lg shadow-[#FF5722]/20'
                        : 'text-[#9A9088] hover:text-[#F5F1EC] hover:bg-white/05'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-white/10 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBackToPublic();
                }}
                className="w-full py-2.5 rounded-xl bg-white/05 border border-white/10 text-xs font-mono text-[#9A9088] flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Return to Portfolio</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-400 flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area (Independent Scroll Container) */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden pt-16 lg:pt-0 scroll-smooth">
        <div className="p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
          {activeTab === 'overview' && (
            <AdminOverview
              admin={admin}
              onNavigate={handleNavSelect}
              showToast={showToast}
            />
          )}

          {activeTab === 'profile' && (
            <AdminProfile 
              admin={admin}
              onUpdateAccount={onUpdateAccount}
              showToast={showToast} 
            />
          )}

          {activeTab === 'projects' && (
            <AdminProjects showToast={showToast} />
          )}

          {activeTab === 'skills' && (
            <AdminSkills showToast={showToast} />
          )}

          {activeTab === 'experience' && (
            <AdminExperience showToast={showToast} />
          )}

          {activeTab === 'services' && (
            <AdminServices showToast={showToast} />
          )}

          {activeTab === 'messages' && (
            <AdminMessages showToast={showToast} />
          )}
        </div>
      </main>

    </div>
  );
}
