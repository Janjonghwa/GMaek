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
    <div className={forceShow ? "w-full space-y-6" : "absolute top-4 right-4 w-72 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl z-20 hidden lg:block"}>
      {!forceShow && (
        <h3 className="text-fengshui-gold font-[900] text-xs tracking-[0.2em] uppercase mb-6 flex items-center gap-2 opacity-60">
          <MapPin className="w-3 h-3" /> My Collection
        </h3>
      )}
      <div className="space-y-4">
        {history.map((item, idx) => (
          <button
            key={item.id || idx}
            onClick={() => onSelect(item)}
            className="w-full text-left p-5 rounded-[28px] bg-white/5 hover:bg-white/10 transition-all group border border-transparent hover:border-white/10 flex justify-between items-center active:scale-95 shadow-sm"
          >
            <div className="overflow-hidden">
              <div className="text-white font-bold text-[15px] truncate pr-2 group-hover:text-fengshui-gold transition-colors">
                {item.result.historicalMatch || '명당 분석 기록'}
              </div>
              <div className="text-white/30 text-xs font-medium mt-1.5 flex items-center gap-2">
                <span className="text-fengshui-gold/80">{item.result.score}점</span>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <span>{new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-fengshui-gold transition-all flex-shrink-0 ml-2">
              <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-black transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
