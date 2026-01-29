
import React from 'react';
import { ResonanceResult } from '../types';

interface Props {
  history: ResonanceResult[];
  onSelect: (item: ResonanceResult) => void;
}

const HistoryLog: React.FC<Props> = ({ history, onSelect }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-12 w-full max-w-4xl border-t border-slate-800 pt-8">
      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Historical Resonance Logs</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((item) => (
          <button
            key={item.timestamp}
            onClick={() => onSelect(item)}
            className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-sky-500/50 transition-colors text-left"
          >
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${
                  item.authVoid.modality === 'perfect' ? 'bg-sky-500' : 
                  item.authVoid.modality === 'stable' ? 'bg-emerald-500' :
                  item.authVoid.modality === 'volatile' ? 'bg-amber-500' : 'bg-slate-500'
                }`} />
                <span className="text-slate-200 font-medium truncate text-sm">
                  {item.x.data.substring(0, 15)}... ∩ {item.y.data.substring(0, 15)}...
                </span>
              </div>
              <span className="text-slate-500 text-xs mono">
                {new Date(item.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-sky-400 font-bold mono">{item.authVoid.resonanceScore}%</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryLog;
