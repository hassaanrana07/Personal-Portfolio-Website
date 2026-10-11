import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Search, 
  RefreshCw, 
  Loader2, 
  X, 
  User, 
  Calendar, 
  Send, 
  Tag, 
  ExternalLink,
  Eye,
  EyeOff,
  ShieldAlert
} from 'lucide-react';
import adminApi from '../../../services/adminApi';
import ConfirmModal from '../common/ConfirmModal';

export default function AdminMessages({ showToast }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread | read
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected Message Modal
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getMessages();
      if (res && res.success && Array.isArray(res.data)) {
        setMessages(res.data);
      }
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to retrieve messages from MySQL.' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Modal body scroll lock and Escape key listener
  useEffect(() => {
    if (selectedMessage) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setSelectedMessage(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedMessage]);

  const handleToggleRead = async (msg, e) => {
    if (e) e.stopPropagation();
    try {
      const newReadStatus = !msg.is_read;
      await adminApi.markMessageRead(msg.id, newReadStatus);
      
      setMessages(prev =>
        prev.map(m => (m.id === msg.id ? { ...m, is_read: newReadStatus } : m))
      );

      if (selectedMessage && selectedMessage.id === msg.id) {
        setSelectedMessage(prev => ({ ...prev, is_read: newReadStatus }));
      }

      showToast({
        type: 'success',
        message: newReadStatus ? 'Message marked as read.' : 'Message marked as unread.'
      });
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to update message status.' });
    }
  };

  const handleOpenMessage = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      try {
        await adminApi.markMessageRead(msg.id, true);
        setMessages(prev =>
          prev.map(m => (m.id === msg.id ? { ...m, is_read: true } : m))
        );
        setSelectedMessage(prev => ({ ...prev, is_read: true }));
      } catch {}
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteMessage(deleteId);
      showToast({ type: 'success', message: 'Message deleted from inbox.' });
      if (selectedMessage && selectedMessage.id === deleteId) {
        setSelectedMessage(null);
      }
      setDeleteId(null);
      await fetchMessages();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to delete message.' });
    } finally {
      setDeleting(false);
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  const filteredMessages = messages.filter(msg => {
    if (filter === 'unread' && msg.is_read) return false;
    if (filter === 'read' && !msg.is_read) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (msg.name && msg.name.toLowerCase().includes(term)) ||
        (msg.email && msg.email.toLowerCase().includes(term)) ||
        (msg.subject && msg.subject.toLowerCase().includes(term)) ||
        (msg.message && msg.message.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-sora text-xl font-bold text-[#F5F1EC] flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#FF9A3D]" />
              <span>Contact Messages Inbox</span>
            </h2>
            {unreadCount > 0 && (
              <span className="text-xs font-mono font-bold bg-[#FF5722] text-[#0D0B0A] px-2.5 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="font-sans text-xs text-[#9A9088] mt-1">
            Incoming inquiries submitted through the public portfolio contact form.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchMessages}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white/05 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#9A9088] hover:text-[#F5F1EC] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Inbox</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#FF9A3D] text-[#0D0B0A] font-bold'
                : 'bg-white/05 text-[#9A9088] hover:text-[#F5F1EC]'
            }`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filter === 'unread'
                ? 'bg-rose-500 text-white font-bold'
                : 'bg-white/05 text-[#9A9088] hover:text-[#F5F1EC]'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Unread ({unreadCount})</span>
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filter === 'read'
                ? 'bg-emerald-500 text-[#0D0B0A] font-bold'
                : 'bg-white/05 text-[#9A9088] hover:text-[#F5F1EC]'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Read ({messages.length - unreadCount})</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#141210] border border-white/10 sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#9A9088] ml-1" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by sender, email, subject..."
            className="bg-transparent border-none text-xs font-mono text-[#F5F1EC] placeholder-[#9A9088]/60 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="w-full min-h-[300px] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#FF9A3D]" />
          <span className="text-xs font-mono text-[#9A9088]">Fetching inbox messages...</span>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-[#9A9088] border border-dashed border-white/10 rounded-2xl bg-[#141210]">
          {searchTerm ? 'No messages matching search filter.' : 'Inbox is empty.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => handleOpenMessage(msg)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                msg.is_read
                  ? 'bg-[#141210] border-white/08 hover:border-white/20 text-[#9A9088]'
                  : 'bg-[#1B1612] border-[#FF9A3D]/30 hover:border-[#FF9A3D]/60 text-[#F5F1EC] shadow-md shadow-[#FF5722]/05'
              }`}
            >
              {/* Left Column */}
              <div className="flex items-start gap-3.5 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  msg.is_read
                    ? 'bg-white/05 border-white/10 text-[#9A9088]'
                    : 'bg-[#FF9A3D]/15 border-[#FF9A3D]/40 text-[#FF9A3D]'
                }`}>
                  <Mail className="w-5 h-5" />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-sora text-sm ${msg.is_read ? 'font-semibold text-[#F5F1EC]' : 'font-extrabold text-[#F5F1EC]'}`}>
                      {msg.name}
                    </span>
                    <span className="text-xs font-mono text-[#9A9088]">
                      &lt;{msg.email}&gt;
                    </span>
                    {!msg.is_read && (
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-[#FF5722]/20 text-[#FF9A3D] px-2 py-0.5 rounded border border-[#FF5722]/30">
                        New
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-sans text-[#F5F1EC] font-semibold truncate">
                    {msg.subject}
                  </div>

                  <p className="text-xs font-sans text-[#9A9088] line-clamp-1">
                    {msg.message}
                  </p>
                </div>
              </div>

              {/* Right Column: Time & Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span className="text-[11px] font-mono text-[#9A9088] mr-2">
                  {new Date(msg.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleToggleRead(msg, e)}
                  className="p-2 rounded-xl bg-white/05 hover:bg-white/15 text-[#9A9088] hover:text-[#F5F1EC] transition-colors cursor-pointer"
                  title={msg.is_read ? 'Mark as Unread' : 'Mark as Read'}
                >
                  {msg.is_read ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(msg.id);
                  }}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                  title="Delete Message"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center min-h-screen"
          onClick={() => setSelectedMessage(null)}
        >
          <div 
            className="w-full max-w-2xl bg-[#12100E] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-[#F5F1EC] my-auto max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#9A9088]">From:</span>
                  <span className="font-sora text-base font-bold text-[#F5F1EC]">{selectedMessage.name}</span>
                </div>
                <div className="text-xs font-mono text-[#FF9A3D]">
                  <a href={`mailto:${selectedMessage.email}`} className="hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleRead(selectedMessage)}
                  className="px-3 py-1.5 rounded-xl bg-white/05 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#9A9088] hover:text-[#F5F1EC] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {selectedMessage.is_read ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{selectedMessage.is_read ? 'Mark Unread' : 'Mark Read'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-[#9A9088] hover:text-[#F5F1EC] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Subject & Meta */}
            <div className="space-y-2 p-4 rounded-xl bg-white/03 border border-white/05">
              <div className="text-xs font-mono text-[#9A9088] flex items-center justify-between">
                <span>Subject:</span>
                <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
              </div>
              <div className="font-sora text-sm font-bold text-[#F5F1EC]">
                {selectedMessage.subject}
              </div>
            </div>

            {/* Body */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#9A9088]">Message Content:</label>
              <div className="p-4 rounded-xl bg-[#0A0908] border border-white/10 text-xs font-sans text-[#F5F1EC] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {selectedMessage.message}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeleteId(selectedMessage.id)}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Message</span>
              </button>

              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                className="px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#FF9A3D] text-[#0D0B0A] font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FF5722]/30 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reply via Email</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete Message"
        message="Are you sure you want to delete this message? It will be removed permanently from the database."
        confirmText="Delete Message"
        confirmVariant="danger"
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
