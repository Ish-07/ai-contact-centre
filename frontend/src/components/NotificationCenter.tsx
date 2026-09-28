import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, AlertTriangle, Sparkles, CheckCircle2, X } from 'lucide-react';
import { wsClient } from '../services/websocket';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: 1,
      type: 'warning',
      title: 'Supervisor Approval Required',
      message: 'Autonomous refund of $189.99 for CUST-1009 requires manual sign-off.',
      time: 'Just now',
    },
    {
      id: 2,
      type: 'danger',
      title: 'High-Risk Customer Escalation',
      message: 'Customer Elena Rostova (#CUST-1001) triggered consecutive angry sentiment markers.',
      time: '2m ago',
    },
    {
      id: 3,
      type: 'info',
      title: 'PII Scrubbed',
      message: 'Credit card number automatically masked in Chat session #49281.',
      time: '5m ago',
    },
    {
      id: 4,
      type: 'success',
      title: 'AI Detected Sales Opportunity',
      message: 'VIP Member eligible for 10% annual loyalty plan renewal.',
      time: '12m ago',
    },
    {
      id: 5,
      type: 'success',
      title: 'New Knowledge Document Indexed',
      message: 'Warranty Policy v3.2 indexed with 6 semantic chunks in pgvector store.',
      time: '25m ago',
    }
  ]);

  useEffect(() => {
    const unsub = wsClient.subscribe((event) => {
      if (event.event_source === 'SIMULATION_ENGINE' && event.data?.type === 'AI_ANALYSIS') {
        setNotifications((prev) => [
          {
            id: Date.now(),
            type: 'warning',
            title: 'Live AI Analysis Triggered',
            message: `Detected intent ${event.data.intent} with sentiment ${event.data.sentiment}.`,
            time: 'Just now',
          },
          ...prev,
        ]);
      }
    });
    return unsub;
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
      >
        <Bell className="w-4 h-4" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <h4 className="text-xs font-semibold text-white">Live Intelligence Notifications</h4>
            <button
              onClick={() => setNotifications([])}
              className="text-[10px] text-slate-400 hover:text-indigo-400"
            >
              Clear All
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto p-2 space-y-1.5">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No unread alerts</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs flex gap-2.5 items-start"
                >
                  {n.type === 'danger' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                  {n.type === 'warning' && <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                  {n.type === 'info' && <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />}
                  {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                  <div>
                    <p className="font-semibold text-white text-[11px]">{n.title}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5 leading-snug">{n.message}</p>
                    <span className="text-[9px] text-slate-500 mt-1 block">{n.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
