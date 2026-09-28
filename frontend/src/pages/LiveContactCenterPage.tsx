import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Phone, Mail, Share2, Filter,
  ArrowRight, Search, Clock, Zap, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { wsClient } from '../services/websocket';
import { Badge } from '../components/Badge';

export const LiveContactCenterPage: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [sentimentFilter, setSentimentFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await api.getConversations({
        channel: channelFilter,
        sentiment: sentimentFilter,
        priority: priorityFilter,
        status: statusFilter,
      });
      setConversations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [channelFilter, sentimentFilter, priorityFilter, statusFilter]);

  // Subscribe to WebSocket live updates
  useEffect(() => {
    const unsub = wsClient.subscribe((event) => {
      if (event.event === 'NEW_MESSAGE' || event.event_source === 'SIMULATION_ENGINE') {
        fetchConversations();
      }
    });
    return unsub;
  }, []);

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case 'VOICE': return <Phone className="w-3.5 h-3.5 text-emerald-400" />;
      case 'CHAT': return <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />;
      case 'EMAIL': return <Mail className="w-3.5 h-3.5 text-amber-400" />;
      case 'SOCIAL': return <Share2 className="w-3.5 h-3.5 text-sky-400" />;
      default: return <MessageSquare className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getSentimentBadge = (s: string) => {
    switch (s) {
      case 'Satisfied': return <Badge variant="success">Satisfied</Badge>;
      case 'Frustrated': return <Badge variant="warning">Frustrated</Badge>;
      case 'Angry': return <Badge variant="danger">Angry</Badge>;
      case 'Confused': return <Badge variant="info">Confused</Badge>;
      default: return <Badge variant="default">Neutral</Badge>;
    }
  };

  const filtered = conversations.filter((c) =>
    search ? (c.customer_name?.toLowerCase().includes(search.toLowerCase()) || c.subject?.toLowerCase().includes(search.toLowerCase())) : true
  );

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Live Contact Center Monitor</h2>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              STREAMING ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time omnichannel conversation supervision with automated intent recognition and AI coaching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">Active Handlers: </span>
            <span className="font-semibold text-white font-mono">10 Human • 5 Autonomous AI</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by customer or subject..."
            className="bg-transparent border-0 text-white placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5 text-indigo-400" /> Channels:
          </span>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Channels</option>
            <option value="CHAT">Chat</option>
            <option value="VOICE">Voice</option>
            <option value="EMAIL">Email</option>
            <option value="SOCIAL">Social</option>
          </select>

          <span className="text-slate-400 ml-2 font-medium">Sentiment:</span>
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Sentiments</option>
            <option value="Frustrated">Frustrated</option>
            <option value="Angry">Angry</option>
            <option value="Satisfied">Satisfied</option>
            <option value="Neutral">Neutral</option>
          </select>

          <span className="text-slate-400 ml-2 font-medium">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Conversations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer & Channel</th>
                <th className="py-3 px-4">Subject & Intent</th>
                <th className="py-3 px-4">Sentiment & Mood</th>
                <th className="py-3 px-4">Assigned Handler</th>
                <th className="py-3 px-4">Priority & SLA</th>
                <th className="py-3 px-4">AI Recommended Action</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/workspace?id=${c.id}`)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        {getChannelIcon(c.channel)}
                      </div>
                      <div>
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          {c.customer_name}
                          <span className="text-[10px] px-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                            {c.customer_tier}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {Math.floor(c.duration_seconds / 60)}m {c.duration_seconds % 60}s
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-medium text-white truncate max-w-xs">{c.subject}</p>
                    <span className="text-[10px] font-mono text-indigo-400">
                      Intent: {c.intent}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      {getSentimentBadge(c.sentiment)}
                      <p className="text-[10px] text-slate-400">Mood: {c.mood}</p>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                        {c.agent_name ? c.agent_name.charAt(0) : 'A'}
                      </div>
                      <span className="text-slate-300 font-medium">{c.agent_name}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        c.priority === 'URGENT' || c.priority === 'HIGH'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {c.priority}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">Conf: {Math.round(c.ai_confidence * 100)}%</p>
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-1.5">
                      <Zap className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{c.recommended_action}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/workspace?id=${c.id}`);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-sm shadow-indigo-600/30 transition-all"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
