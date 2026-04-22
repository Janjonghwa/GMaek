import React, { useEffect, useRef, useState } from 'react';
import { FengShuiResult } from '@/lib/fengshui/types';
import { RadarChart } from './RadarChart';
import { MiniMap } from './MiniMap';
import { Sparkles, Download, Loader2, X, ChevronRight } from 'lucide-react';

interface ResultCardProps {
  data: FengShuiResult;
  onReset: () => void;
  onDownload: () => void;
  isDownloading: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data, onReset, onDownload, isDownloading }) => {
  const [selectedInfo, setSelectedInfo] = useState<{ label: string, title: string, desc: string, reason: string } | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const showDetail = (index: number) => {
    const labels = ['배산', '임수', '안정', '현대', '균형'];
    const infoTexts = [
      {
        title: '배산(背山)',
        desc: '뒤를 든든하게 받쳐주는 산의 기운을 뜻합니다. 방어막 역할을 하며 심리적, 물질적 안정을 줍니다. (기준: 북쪽 지형의 고도 상승폭)'
      },
      {
        title: '임수(臨水)',
        desc: '앞으로 탁 트인 물길의 기운을 뜻합니다. 재물이 모이고 순환하는 재물운의 상징입니다. (기준: 남쪽 지형의 개방감 및 인근 수계)'
      },
      {
        title: '안정(安定)',
        desc: '지형이 급격하지 않고 평탄한지를 봅니다. 삶의 굴곡을 줄이고 편안함을 줍니다. (기준: 주변 8방위 고도 편차)'
      },
      {
        title: '현대(現代)',
        desc: '전통 풍수에서는 볼 수 없던 현대적 인프라의 기운입니다. 사람과 돈이 모이는 에너지입니다. (기준: 주변 역세권 및 교통 인프라)'
      },
      {
        title: '균형(均衡)',
        desc: '좌우 지형의 높낮이 조화입니다. 청룡과 백호의 균형으로 대인관계와 건강을 상징합니다. (기준: 동서 방향의 고도 균형)'
      }
    ];

    setSelectedInfo({
      label: labels[index],
      title: infoTexts[index].title,
      desc: infoTexts[index].desc,
      reason: data.reasons[index]
    });
  };

  useEffect(() => {
    if (!selectedInfo || !modalRef.current) return;

    const focusable = modalRef.current.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedInfo(null);
        return;
      }

      if (event.key !== 'Tab' || focusable.length === 0) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedInfo]);

  return (
    <div className="absolute inset-0 bg-[#0c0c1e] z-[70] flex flex-col items-center overflow-y-auto pt-10 pb-20 px-6 animate-in fade-in zoom-in-95 duration-1000">
      
      <div className="w-full max-w-[400px] bg-[#0c0c1e] p-8 rounded-[40px] flex flex-col items-center relative pb-12">
        <div className="absolute inset-0 rounded-[40px] overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,#1a1a2e_0%,transparent_50%)] animate-spin-slow" />
          </div>
        </div>

        <div className="mb-6 text-8xl drop-shadow-[0_0_30px_rgba(251,197,49,0.4)]">
          {data.score >= 90 ? '🌻' : data.score >= 80 ? '🌿' : '🌱'}
        </div>

        {data.lat && data.lng && (
          <div className="mb-6 relative group">
            <div className="absolute -inset-1.5 bg-fengshui-gold/20 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="w-24 h-24 rounded-full border-2 border-fengshui-gold/50 overflow-hidden relative shadow-[0_0_30px_rgba(251,197,49,0.3)] bg-[#0c0c1e] flex items-center justify-center">
              <MiniMap lat={data.lat} lng={data.lng} />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-full pointer-events-none" />
            </div>
          </div>
        )}

        {data.address && (
          <div className="mb-4 text-white/70 text-sm font-bold bg-white/5 px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
            <span className="text-fengshui-gold">📍</span> {data.address}
          </div>
        )}

        <h1 className="text-[32px] font-[1000] text-fengshui-gold mb-2 tracking-[calc(-0.05em)] text-center leading-tight">
          {(data.historicalMatch || '명당').split('(').map((part, index) => (
            <React.Fragment key={index}>
              {index > 0 ? (
                <span className="text-xl text-fengshui-gold/70 mt-2 block font-black">
                  ({part}
                </span>
              ) : (
                part.trim()
              )}
            </React.Fragment>
          ))}
        </h1>
        
        <div className="flex flex-col items-center mb-10 relative">
          <span className="text-white font-[1000] text-8xl tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{data.score}</span>
          <div className="h-1.5 w-16 bg-fengshui-gold rounded-full my-3 shadow-[0_0_15px_rgba(251,197,49,0.8)]" />
          <span className="text-white/30 text-[11px] font-black tracking-[0.4em]">종합 풍수 지수</span>
        </div>

        <RadarChart scores={data.scores} onPointClick={showDetail} />

        {/* 디자인 리뷰 1번: 버튼 가독성 및 클릭 유도 강화 */}
        <div className="w-full grid grid-cols-5 gap-2 mb-10 relative z-10 mt-8">
          {['배산', '임수', '안정', '현대', '균형'].map((label, i) => (
            <button 
              key={i} 
              onClick={() => showDetail(i)} 
              className="flex flex-col items-center bg-white/10 py-5 rounded-[24px] border border-white/20 hover:bg-white/20 hover:border-fengshui-gold/40 transition-all active:scale-90 shadow-lg"
            >
              <span className="text-white/40 text-[10px] font-[900] mb-1">{label}</span>
              <span className="text-fengshui-gold font-[1000] text-lg">{data.scores[i]}</span>
            </button>
          ))}
        </div>

        <div className="w-full bg-white/5 backdrop-blur-md border border-dashed border-fengshui-gold/30 rounded-[36px] p-8 relative z-10 mt-2">
          <div className="absolute -top-3.5 left-10 bg-[#0c0c1e] px-4 py-0.5 rounded-full border border-fengshui-gold/30">
            <span className="text-[11px] font-[1000] text-fengshui-gold tracking-[0.1em]">풍수 총평</span>
          </div>
          <p className="text-white/90 text-lg leading-relaxed break-keep font-bold italic tracking-tight">
            "{data.analysis.total}"
          </p>
        </div>
      </div>

      <div className="w-full max-w-[400px] mt-10 space-y-4 px-2 relative z-10">
        <button 
          onClick={onDownload}
          disabled={isDownloading}
          className="w-full py-6 bg-fengshui-gold text-black rounded-[32px] font-[1000] text-2xl shadow-[0_20px_50px_rgba(251,197,49,0.3)] flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50"
        >
          {isDownloading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Download className="w-7 h-7" />}
          명당 카드 저장하기
        </button>
        
        <button onClick={onReset} className="w-full py-4 text-white/30 text-sm font-black tracking-[0.2em] hover:text-white/60 transition-colors">새로운 터 감정하기</button>
      </div>

      {selectedInfo && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-10 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedInfo(null)} aria-hidden="true" />
          <div ref={modalRef} role="dialog" aria-modal="true" aria-label={`${selectedInfo.label} 분석 상세`} className="bg-[#1a1a2e] w-full max-w-md rounded-[48px] p-8 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] relative animate-in zoom-in-95 slide-in-from-bottom-20 duration-500">
            <button onClick={() => setSelectedInfo(null)} aria-label="상세 모달 닫기" className="absolute top-6 right-6 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <X className="w-6 h-6 text-white/40" />
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-[20px] bg-fengshui-gold/10 flex items-center justify-center shadow-inner">
                <Sparkles className="w-7 h-7 text-fengshui-gold fill-fengshui-gold" />
              </div>
              <h3 className="text-3xl font-[1000] text-fengshui-gold tracking-tight">{selectedInfo.label} 분석</h3>
            </div>
            
            <div className="flex flex-col gap-2 mb-6 bg-white/5 p-4 rounded-2xl border border-white/5">
              <h4 className="text-fengshui-gold/90 font-[900] text-sm">💡 {selectedInfo.title}이란?</h4>
              <p className="text-white/70 text-sm leading-relaxed break-keep">{selectedInfo.desc}</p>
            </div>

            <p className="text-white/95 text-xl leading-snug font-bold break-keep mb-8 tracking-tighter">
              {selectedInfo.reason}
            </p>
            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <p className="text-white/30 text-xs font-bold tracking-widest">국가 공간 정보 기반 검증 완료</p>
              <button onClick={() => setSelectedInfo(null)} aria-label="상세 모달 확인 후 닫기" className="text-fengshui-gold font-bold flex items-center gap-1 group text-sm">
                확인 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
