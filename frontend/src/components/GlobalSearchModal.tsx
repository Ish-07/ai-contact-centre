import React, { useState, useEffect } from 'react';
import { Search, X, Users, MessageSquare, BookOpen, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setCustomers([]);
      setDocuments([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [custRes, docRes] = await Promise.all([
          api.getCustomers({ search: query }),
          api.searchKnowledge(query, undefined, 4),
        ]);
        setCustomers(custRes.slice(0, 4));
        setDocuments(docRes.results || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers, documents, policies, cases..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {loading && (
            <p className="text-xs text-slate-400 text-center py-6">Searching across enterprise systems...</p>
          )}

          {!loading && !query && (
            <div className="text-center py-6 text-slate-500 text-xs">
              Type keywords to search across Customer 360 records and the RAG Knowledge Base.
            </div>
          )}

          {!loading && query && customers.length === 0 && documents.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-xs">
              No matching records found for "{query}".
            </div>
          )}

          {/* Customers Section */}
          {customers.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" /> Customers
              </p>
              <div className="space-y-1">
                {customers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      navigate(`/customers?id=${c.customer_id}`);
                      onClose();
                    }}
                    className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-medium text-white">{c.name}</p>
                      <p className="text-[11px] text-slate-400">{c.customer_id} • {c.email} • Tier: {c.tier}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Section */}
          {documents.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Knowledge Base Chunks
              </p>
              <div className="space-y-1">
                {documents.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      navigate('/knowledge');
                      onClose();
                    }}
                    className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white">{d.document_title}</span>
                        <span className="text-[10px] text-indigo-400 font-mono">Page {d.page_number}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{d.content}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
