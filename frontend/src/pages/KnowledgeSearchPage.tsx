import React, { useState } from 'react';
import {
  Search, BookOpen, Sparkles, CheckCircle2, AlertTriangle,
  ArrowRight, Layers, FileText, HelpCircle, Compass
} from 'lucide-react';
import { api } from '../services/api';
import { Badge } from '../components/Badge';

export const KnowledgeSearchPage: React.FC = () => {
  const [query, setQuery] = useState('How long does a refund take?');
  const [activeCategory, setActiveCategory] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [groundedAnswer, setGroundedAnswer] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const sampleQueries = [
    "How long does a refund take?",
    "Is my product covered by warranty if dropped in water?",
    "Can I cancel my order before warehouse dispatch?",
    "What should I do if the device won't turn on?",
    "Do premium customers receive expedited support?"
  ];

  const handleExecuteSearch = async (queryText?: string) => {
    const q = queryText || query;
    if (!q.trim()) return;

    setSearching(true);
    try {
      const [searchRes, queryRes] = await Promise.all([
        api.searchKnowledge(q, activeCategory, 4),
        api.queryKnowledge(q),
      ]);
      setSearchResults(searchRes.results || []);
      setGroundedAnswer(queryRes);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
              RAG Retrieval Pipeline
            </span>
            <span className="text-xs text-slate-400 font-mono">Dense Vector Cosine Similarity</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Knowledge Query & Grounded Semantic Retrieval</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test and inspect vector search embeddings against pre-indexed company policies with strict zero-hallucination verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success">pgvector Cosine Search Active</Badge>
        </div>
      </div>

      {/* Query Search Sandbox */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2.5 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs">
            <Search className="w-4 h-4 text-indigo-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask any policy or technical question..."
              className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-xs"
            />
          </div>
          <button
            onClick={() => handleExecuteSearch()}
            disabled={searching}
            className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm shadow-indigo-600/30 transition-all shrink-0"
          >
            {searching ? 'Querying RAG...' : 'Execute Query'}
          </button>
        </div>

        {/* Quick Sample Queries */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" /> Sample Queries:
          </span>
          {sampleQueries.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(sq);
                handleExecuteSearch(sq);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-[11px] transition-colors"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column Results: Left = Grounded AI Answer, Right = Retrieved Vector Chunks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Synthesized Grounded Response */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Grounded AI Response
            </h3>
            {groundedAnswer && (
              <Badge variant={groundedAnswer.grounded ? 'success' : 'danger'}>
                {groundedAnswer.grounded ? '100% Policy Grounded' : 'Insufficient Evidence'}
              </Badge>
            )}
          </div>

          {searching ? (
            <p className="text-xs text-slate-500 text-center py-12">Synthesizing grounded answer from retrieved chunks...</p>
          ) : groundedAnswer ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed text-slate-200">
                {groundedAnswer.answer}
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Retrieval Confidence</span>
                  <span className="text-emerald-400 font-bold text-sm mt-0.5 block">
                    {Math.round(groundedAnswer.confidence * 100)}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Recommended Action</span>
                  <span className="text-indigo-300 font-medium text-xs mt-0.5 block truncate">
                    {groundedAnswer.recommended_action || 'Insert in response'}
                  </span>
                </div>
              </div>

              {groundedAnswer.insufficient_information && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Insufficient policy grounding detected. Zero hallucination safeguard triggered: Escalate to human supervisor.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-12">
              Run a query above to see the step-by-step RAG grounded generation.
            </p>
          )}
        </div>

        {/* Right Column: Retrieved Knowledge Chunks & Similarity Rankings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" /> Retrieved Vector Chunks (pgvector)
            </h3>
            <span className="text-xs font-mono text-slate-400">Top-4 Ranked</span>
          </div>

          <div className="space-y-3">
            {searchResults.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-12">No vector chunks retrieved yet.</p>
            ) : (
              searchResults.map((ch, idx) => (
                <div key={ch.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      {ch.document_title} (Page {ch.page_number})
                    </span>
                    <span className="font-mono text-[11px] font-bold text-emerald-400">
                      {Math.round(ch.similarity_score * 100)}% Cosine Match
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    "{ch.content}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
