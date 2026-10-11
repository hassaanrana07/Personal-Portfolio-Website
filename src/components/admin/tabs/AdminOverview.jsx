import React, { useState, useEffect, useCallback } from 'react';
import { 
  FolderKanban, 
  Cpu, 
  Briefcase, 
  Wrench, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  ArrowRight, 
  Database, 
  Sparkles, 
  Clock, 
  User, 
  RefreshCw,
  Loader2
} from 'lucide-react';
import adminApi from '../../../services/adminApi';

export default function AdminOverview({ admin, onNavigate, showToast }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    profile: null,
    projects: [],
    skills: [],
    experience: { work: [], education: [] },
    services: [],
    messages: []
  });
  const [health, setHealth] = useState(null);

  const fetchOverviewData = useCallback(async () => {
    setLoading(true);
    try {
      const [portfolioRes, messagesRes, healthRes] = await Promise.allSettled([
        adminApi.getPortfolioAll(),
        adminApi.getMessages(),
        adminApi.getHealth()
      ]);

      const portfolioData = portfolioRes.status === 'fulfilled' && portfolioRes.value?.data ? portfolioRes.value.data : {};
      const messagesData = messagesRes.status === 'fulfilled' && messagesRes.value?.data ? messagesRes.value.data : [];
      const healthData = healthRes.status === 'fulfilled' ? healthRes.value : null;

      setData({
        profile: portfolioData.profile || null,
        projects: portfolioData.projects || [],
        skills: portfolioData.skills || [],
        experience: portfolioData.experience || { work: [], education: [] },
        services: portfolioData.services || [],
        messages: messagesData
      });

      if (healthData) setHealth(healthData);
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to load overview analytics.' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  const totalProjects = data.projects.length;
  const featuredProjects = data.projects.filter(p => p.is_featured || p.isFeatured).length;
  const totalSkills = data.skills.length;
  const totalWork = Array.isArray(data.experience?.work) ? data.experience.work.length : 0;
  const totalEdu = Array.isArray(data.experience?.education) ? data.experience.education.length : 0;
  const totalServices = data.services.length;
  const totalMessages = data.messages.length;
  const unreadMessages = data.messages.filter(m => !m.is_read).length;

  if (loading) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF9A3D]" />
        <span className="text-xs font-mono text-[#9A9088]">Aggregating Portfolio Analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Welcome */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#1E1610] via-[#141210] to-[#121110] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF9A3D] bg-[#FF9A3D]/10 px-2.5 py-1 rounded-full border border-[#FF9A3D]/20">
              Control Center
            </span>
            {health && (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                MySQL 8 Operational
              </span>
            )}
          </div>
          <h2 className="font-sora text-2xl sm:text-3xl font-extrabold text-[#F5F1EC]">
            Welcome, {admin?.name || 'Hassaan Ali Akbar'}
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#9A9088] max-w-xl leading-relaxed">
            Manage your dynamic portfolio, update project case studies, adjust 3D Solar System skills, and respond to incoming contact submissions in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <button
            onClick={fetchOverviewData}
            className="p-2.5 rounded-xl bg-white/05 hover:bg-white/10 border border-white/10 text-[#9A9088] hover:text-[#F5F1EC] transition-colors cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('projects')}
            className="px-4 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#FF9A3D] text-[#0D0B0A] font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FF5722]/20 transition-all cursor-pointer"
          >
            <FolderKanban className="w-4 h-4" />
            <span>Manage Projects</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Projects */}
        <div 
          onClick={() => onNavigate('projects')}
          className="p-5 rounded-2xl bg-[#141210] border border-white/10 hover:border-[#FF9A3D]/40 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-[#FF9A3D]/10 text-[#FF9A3D] flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-[#9A9088] group-hover:text-[#FF9A3D] flex items-center gap-1 transition-colors">
              Manage <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
          <div>
            <div className="font-sora text-2xl font-bold text-[#F5F1EC]">{totalProjects}</div>
            <div className="text-xs font-mono text-[#9A9088] mt-0.5">Projects ({featuredProjects} featured)</div>
          </div>
        </div>

        {/* Skills */}
        <div 
          onClick={() => onNavigate('skills')}
          className="p-5 rounded-2xl bg-[#141210] border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-[#9A9088] group-hover:text-amber-400 flex items-center gap-1 transition-colors">
              Manage <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
          <div>
            <div className="font-sora text-2xl font-bold text-[#F5F1EC]">{totalSkills}</div>
            <div className="text-xs font-mono text-[#9A9088] mt-0.5">3D Orbit Skills</div>
          </div>
        </div>

        {/* Experience */}
        <div 
          onClick={() => onNavigate('experience')}
          className="p-5 rounded-2xl bg-[#141210] border border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-[#9A9088] group-hover:text-cyan-400 flex items-center gap-1 transition-colors">
              Manage <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
          <div>
            <div className="font-sora text-2xl font-bold text-[#F5F1EC]">{totalWork + totalEdu}</div>
            <div className="text-xs font-mono text-[#9A9088] mt-0.5">{totalWork} Work &bull; {totalEdu} Edu</div>
          </div>
        </div>

        {/* Services */}
        <div 
          onClick={() => onNavigate('services')}
          className="p-5 rounded-2xl bg-[#141210] border border-white/10 hover:border-purple-400/40 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-[#9A9088] group-hover:text-purple-400 flex items-center gap-1 transition-colors">
              Manage <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
          <div>
            <div className="font-sora text-2xl font-bold text-[#F5F1EC]">{totalServices}</div>
            <div className="text-xs font-mono text-[#9A9088] mt-0.5">Services Offered</div>
          </div>
        </div>

        {/* Messages */}
        <div 
          onClick={() => onNavigate('messages')}
          className="p-5 rounded-2xl bg-[#141210] border border-white/10 hover:border-emerald-400/40 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-[#9A9088] group-hover:text-emerald-400 flex items-center gap-1 transition-colors">
              Inbox <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
          <div>
            <div className="font-sora text-2xl font-bold text-[#F5F1EC]">{totalMessages}</div>
            <div className="text-xs font-mono text-[#9A9088] mt-0.5">Total Inquiries</div>
          </div>
        </div>

        {/* Unread Inquiries */}
        <div 
          onClick={() => onNavigate('messages')}
          className="p-5 rounded-2xl bg-[#141210] border border-white/10 hover:border-rose-400/40 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-[#9A9088] group-hover:text-rose-400 flex items-center gap-1 transition-colors">
              View <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
          <div>
            <div className="font-sora text-2xl font-bold text-rose-400">{unreadMessages}</div>
            <div className="text-xs font-mono text-[#9A9088] mt-0.5">Unread Messages</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Messages + Profile Quick View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Messages Area (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#141210] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#FF9A3D]" />
              <h3 className="font-sora text-base font-bold text-[#F5F1EC]">Recent Inquiries</h3>
            </div>
            <button
              onClick={() => onNavigate('messages')}
              className="text-xs font-mono text-[#FF9A3D] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({totalMessages})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {data.messages.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-[#9A9088] border border-dashed border-white/10 rounded-xl">
              No contact messages received yet. Submissions from the public Contact form will appear here.
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.messages.slice(0, 4).map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => onNavigate('messages')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    msg.is_read
                      ? 'bg-white/03 border-white/05 hover:bg-white/07 text-[#9A9088]'
                      : 'bg-[#FF9A3D]/05 border-[#FF9A3D]/30 hover:bg-[#FF9A3D]/10 text-[#F5F1EC]'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-sora text-xs font-bold text-[#F5F1EC] truncate">
                        {msg.name}
                      </span>
                      <span className="text-[11px] font-mono text-[#9A9088] truncate">
                        &lt;{msg.email}&gt;
                      </span>
                      {!msg.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#FF9A3D] shrink-0" title="Unread" />
                      )}
                    </div>
                    <div className="text-xs font-sans text-[#b8b8b5] truncate">
                      <span className="font-semibold text-[#F5F1EC]">{msg.subject}</span> &mdash; {msg.message}
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-[#9A9088] shrink-0 sm:text-right">
                    {new Date(msg.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile / System Info (1 col) */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="p-6 rounded-2xl bg-[#141210] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#FF9A3D]" />
                <h3 className="font-sora text-base font-bold text-[#F5F1EC]">Profile Status</h3>
              </div>
              <button
                onClick={() => onNavigate('profile')}
                className="text-xs font-mono text-[#FF9A3D] hover:underline cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#9A9088]">Full Name</div>
                <div className="font-mono text-sm font-bold text-[#F5F1EC]">
                  {data.profile?.full_name || data.profile?.fullName || 'Hassaan Ali Akbar'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#9A9088]">Job Title</div>
                <div className="font-mono text-xs text-[#F5F1EC]">
                  {data.profile?.title || 'Full-Stack Developer'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#9A9088]">Availability Badge</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {data.profile?.status_badge || data.profile?.statusBadge || 'Full-Time'}
                  </span>
                  <span className="text-[11px] font-mono text-[#9A9088]">
                    {data.profile?.status_text || data.profile?.statusText || 'Open for Opportunities'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Database System Card */}
          <div className="p-5 rounded-2xl bg-[#141210] border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#9A9088] uppercase tracking-wider">
              <Database className="w-3.5 h-3.5 text-[#FF9A3D]" />
              <span>System Health</span>
            </div>
            <div className="space-y-2 text-xs font-mono text-[#9A9088]">
              <div className="flex items-center justify-between">
                <span>Database</span>
                <span className="text-emerald-400 font-bold">MySQL 8.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span>API Port</span>
                <span className="text-[#F5F1EC]">5000 (Express)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Vite Port</span>
                <span className="text-[#F5F1EC]">3000 (React)</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
