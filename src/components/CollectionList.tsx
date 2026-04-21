import React, { useEffect, useState } from 'react';
import { HistoryItem } from '@/lib/fengshui/types';
import { getCollection } from '@/lib/fengshui/storage';
import { MapPin, ArrowRight } from 'lucide-react';

interface CollectionListProps {
  onSelect: (item: HistoryItem) => void;
  forceShow?: boolean;
}

export const CollectionList: React.FC<CollectionListProps> = ({ onSelect, forceShow = false }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const data = getCollection();
    setHistory(data.history);
  }, []);

  if (history.length === 0 && !forceShow) return null;
  if (history.length === 0 && forceShow) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
        <MapPin className="w-12 h-12 mb-4" />
        <p className="font-bold">기록된 명당이 없습니다</p>
      </div>
    );
  }

  return (
    <div className={forceShow ? "w-full space-y-4" : "absolute top-4 right-4 w-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl z-20 hidden md:block"}>
      {!forceShow && (
        <h3 className="text-fengshui-gold font-[900] text-sm tracking-widest uppercase mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> My Collection
        </h3>
      )}
      <div className="space-y-2">
        {history.map((item, idx) => (
          <button
            key={item.id || idx}
            onClick={() => onSelect(item)}
            className="w-full text-left p-4 rounded-[24px] bg-white/5 hover:bg-white/10 transition-all group border border-transparent hover:border-white/10 flex justify-between items-center active:scale-95"
          >
            <div className="overflow-hidden">
              <div className="text-white font-bold text-sm truncate pr-2">
                {item.result.historicalMatch || '명당 분석 기록'}
              </div>
              <div className="text-white/40 text-xs font-medium mt-1">
                {item.result.score}점 • {new Date(item.timestamp).toLocaleDateString()}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-fengshui-gold transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
