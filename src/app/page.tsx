'use client';

import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { MapPin, Sparkles, Loader2, RefreshCw, AlertCircle, History, X } from 'lucide-react';
import { MapView } from '@/components/MapView';
import { ResultCard } from '@/components/ResultCard';
import { CollectionList } from '@/components/CollectionList';
import { FengShuiResult } from '@/lib/fengshui/types';
import { addHistory } from '@/lib/fengshui/storage';

export default function Home() {
  const [step, setStep] = useState<'map' | 'survey' | 'loading' | 'result' | 'error'>('map');
  const [clickedCoord, setClickedCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [analysisData, setAnalysisData] = useState<FengShuiResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setStep(prev => {
      if (prev === 'loading' || prev === 'result') return prev;
      setClickedCoord({ lat, lng });
      return 'survey';
    });
  }, []);

  const startAnalysis = async () => {
    if (!clickedCoord) return;
    setStep('loading');

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await axios.get(
        `/api/analyze?lat=${clickedCoord.lat}&lng=${clickedCoord.lng}`, 
        { signal: abortControllerRef.current.signal }
      );
      
      const resultData = response.data;
      setAnalysisData(resultData);
      
      addHistory({
        id: new Date().getTime().toString(),
        timestamp: Date.now(),
        coord: clickedCoord,
        result: resultData
      });

      setTimeout(() => setStep('result'), 1500);
      
    } catch (error: any) {
      if (axios.isCancel(error)) return;
      
      // 디자인 리뷰 결정 3A: 감성 에러 메시지
      setErrorMessage(error.response?.data?.error || "지맥이 잠시 꼬여 분석을 완료하지 못했습니다.");
      setStep('error');
    }
  };

  const handleDownload = async () => {
    if (!analysisData) return;
    setIsSaving(true);
    try {
      const url = `/api/share?score=${analysisData.score}&match=${encodeURIComponent(analysisData.historicalMatch || '명당')}&lat=${clickedCoord?.lat.toFixed(4)}&lng=${clickedCoord?.lng.toFixed(4)}&sig=${analysisData.signature || ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `지맥-부적-${new Date().getTime()}.png`;
      link.click();
    } catch (e: any) {
      console.error('Download failed:', e);
      alert(`이미지 생성 중 오류가 발생했습니다: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const resetMap = () => {
    setStep('map');
    setAnalysisData(null);
    setClickedCoord(null);
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#0c0c1e] text-white selection:bg-fengshui-gold/30">
      <MapView onMapClick={handleMapClick} isBlurred={step !== 'map'} />

      {step === 'map' && (
        <>
          {/* Floating Onboarding Widget (Pass 1.1) */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-48px)] max-w-sm">
            <div className="bg-[#16213e]/90 backdrop-blur-2xl p-6 rounded-[32px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-8 duration-1000">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-full bg-fengshui-gold flex items-center justify-center shadow-[0_0_20px_rgba(251,197,49,0.5)]">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-white font-[1000] text-lg leading-tight">이곳의 기운은 어떨까요?</h3>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-0.5">Explore the Energy</p>
                </div>
              </div>
              <p className="text-white/60 text-[13px] font-medium leading-relaxed">
                지도에서 명당으로 의심되는 곳을 클릭해 보세요. <br/>
                8방위 정밀 분석으로 지맥의 흐름을 읽어드립니다.
              </p>
            </div>
          </div>

          {/* History Toggle Button for Mobile */}
          <button 
            onClick={() => setShowHistory(true)}
            className="absolute top-10 right-6 z-20 md:hidden bg-white/10 backdrop-blur-xl p-4 rounded-full border border-white/10 active:scale-95 transition-all"
          >
            <History className="w-6 h-6 text-fengshui-gold" />
          </button>

          {/* Desktop Collection Sidebar */}
          <CollectionList onSelect={(item) => {
            setAnalysisData(item.result);
            setStep('result');
          }} />
        </>
      )}

      {/* Mobile History Overlay */}
      {showHistory && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="absolute inset-x-0 bottom-0 h-[80vh] bg-[#1a1a2e] rounded-t-[48px] p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-[1000] text-fengshui-gold flex items-center gap-3">
                <History className="w-6 h-6" /> 명당 기록
              </h2>
              <button onClick={() => setShowHistory(false)} className="p-3 rounded-full bg-white/5">
                <X className="w-6 h-6" />
              </button>
            </div>
            <CollectionList onSelect={(item) => {
              setAnalysisData(item.result);
              setShowHistory(false);
              setStep('result');
            }} forceShow />
          </div>
        </div>
      )}

      {/* 설문 Bottom Sheet */}
      <div className={`absolute bottom-0 left-0 w-full bg-[#16213e]/95 backdrop-blur-3xl rounded-t-[48px] z-20 transition-all duration-700 p-12 border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.5)] ${step === 'survey' ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="w-20 h-1.5 bg-white/10 rounded-full mx-auto mb-10" />
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-fengshui-gold/10 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-fengshui-gold fill-fengshui-gold" />
          </div>
          <h2 className="text-3xl font-[1000] tracking-tighter text-white">지맥 동기화</h2>
        </div>
        <p className="text-white/40 text-lg mb-1 font-bold leading-tight">현관문을 열었을 때 거울이 바로 보이나요?</p>
        <p className="text-fengshui-gold/60 text-sm mb-10 font-medium italic">* 가벼운 재미 요소입니다. 선택 즉시 지맥 분석이 시작됩니다.</p>
        <div className="grid grid-cols-2 gap-5">
          <button onClick={startAnalysis} className="group relative overflow-hidden py-6 rounded-[28px] bg-white/5 border border-white/10 font-[1000] text-xl transition-all active:scale-95 hover:bg-white/10">
            네, 보여요
          </button>
          <button onClick={startAnalysis} className="group relative overflow-hidden py-6 rounded-[28px] bg-white/5 border border-white/10 font-[1000] text-xl transition-all active:scale-95 hover:bg-white/10">
            아니요
          </button>
        </div>
      </div>

      {/* 로딩 화면 - 8방위 정밀 스캔 시각화 (Pass 3) */}
      {step === 'loading' && (
        <div className="absolute inset-0 bg-[#0c0c1e] z-[60] flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-500">
          <div className="relative mb-16 w-32 h-32 flex items-center justify-center">
            {/* 8방위 샘플링 애니메이션 */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <div 
                key={angle}
                className="absolute w-1 h-12 bg-fengshui-gold/40 rounded-full origin-bottom"
                style={{ 
                  transform: `rotate(${angle}deg) translateY(-24px)`,
                  animation: `scanning 2s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`
                }}
              />
            ))}
            <div className="absolute w-4 h-4 bg-fengshui-gold rounded-full shadow-[0_0_30px_rgba(251,197,49,1)]" />
          </div>
          <h3 className="text-3xl font-[1000] tracking-[0.2em] text-fengshui-gold mb-4 uppercase">Scanning...</h3>
          <p className="text-white/40 text-lg font-bold tracking-widest uppercase">8-Point Terrain Analysis</p>
        </div>
      )}

      {/* 에러 화면 (Pass 2.1 - 감성 에러) */}
      {step === 'error' && (
        <div className="absolute inset-0 bg-[#0c0c1e] z-[80] flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-10 border border-red-500/20">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-[1000] text-white mb-4 tracking-tighter">지맥이 잠시 꼬였습니다</h2>
          <p className="text-white/50 text-lg font-bold break-keep max-w-xs leading-snug mb-12">
            이곳의 기운이 너무 강렬하여 지형을 읽는 데 방해가 생겼습니다. 잠시 후 다시 시도하거나 다른 터를 찍어주세요.
          </p>
          <button 
            onClick={resetMap}
            className="w-full max-w-xs py-6 bg-white/5 border border-white/10 rounded-[32px] font-[1000] text-xl active:scale-95 transition-all"
          >
            지도로 돌아가기
          </button>
        </div>
      )}

      {/* 결과 카드 */}
      {step === 'result' && analysisData && (
        <div className="relative w-full h-full">
          <ResultCard 
            data={analysisData} 
            onReset={resetMap} 
            onDownload={handleDownload} 
            isDownloading={isSaving} 
          />
          {analysisData.isPartial && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[80] bg-red-500/20 backdrop-blur-md px-4 py-2 rounded-full border border-red-500/30 flex items-center gap-2 animate-pulse">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-[11px] font-bold text-red-200">일부 데이터(POI) 분석이 누락되었습니다.</span>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes scanning {
          0%, 100% { transform: rotate(var(--angle)) translateY(-24px) scaleY(1); opacity: 0.2; }
          50% { transform: rotate(var(--angle)) translateY(-24px) scaleY(1.8); opacity: 1; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </main>
  );
}
