import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  referenceTag?: string;
  icon?: React.ReactNode;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeType,
  referenceTag = 'Documentation Reference',
  icon,
}) => {
  const isReference = referenceTag.includes('Documentation Reference');

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 tracking-wider uppercase">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1.5 font-mono">{value}</h3>
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 font-medium">
          {changeType === 'positive' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />}
          {changeType === 'negative' && <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />}
          <span className={changeType === 'positive' ? 'text-emerald-400' : changeType === 'negative' ? 'text-rose-400' : 'text-slate-400'}>
            {change}
          </span>
        </div>

        {referenceTag && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
              isReference
                ? 'bg-amber-950/40 text-amber-300/90 border-amber-800/40'
                : 'bg-indigo-950/40 text-indigo-300/90 border-indigo-800/40'
            }`}
            title={isReference ? "Source: Contact Center AI Innovation Documentation" : "Real-time Telemetry"}
          >
            <Info className="w-2.5 h-2.5" />
            {referenceTag}
          </span>
        )}
      </div>
    </div>
  );
};
