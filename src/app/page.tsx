'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!toastMessage) return;

    const timer = window.setTimeout(() => {
      setToastMessage(null);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!showHistory) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowHistory(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showHistory]);

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
      const apiError = error.response?.data?.error;
      const message = typeof apiError === 'string'
        ? apiError
        : apiError?.message;
      setErrorMessage(message || '지맥이 잠시 꼬여 분석을 완료하지 못했습니다.');
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
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const payload = await response.json();
          const apiMessage = payload?.error?.message || '이미지 생성 중 오류가 발생했습니다.';
          throw new Error(`Server responded with ${response.status}: ${apiMessage}`);
        }

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
      setToastMessage(`이미지 생성 중 오류가 발생했습니다: ${e.message}`);
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
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-48px)] max-w-sm group">
            <div className="absolute -inset-1 bg-gradient-to-r from-fengshui-gold/20 via-purple-500/10 to-fengshui-gold/20 rounded-[34px] blur-lg opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-[#111827]/80 backdrop-blur-3xl p-6 rounded-[32px] border border-white/10 border-t-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-8 duration-1000">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fengshui-gold to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(251,197,49,0.5)]">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80 font-[1000] text-lg leading-tight">이곳의 기운은 어떨까요?</h3>
                  <p className="text-fengshui-gold/60 text-xs font-[800] uppercase tracking-widest mt-0.5">Explore the Energy</p>
                </div>
              </div>
              <p className="text-white/60 text-[13px] font-semibold leading-relaxed">
                지도에서 명당으로 의심되는 곳을 클릭해 보세요. <br/>
                8방위 정밀 분석으로 지맥의 흐름을 읽어드립니다.
              </p>
            </div>
          </div>

          {/* History Toggle Button for Mobile */}
          <button 
            onClick={() => setShowHistory(true)}
            aria-label="명당 기록 열기"
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
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-label="명당 기록 패널">
          <div className="absolute inset-x-0 bottom-0 h-[80vh] bg-[#1a1a2e] rounded-t-[48px] p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-[1000] text-fengshui-gold flex items-center gap-3">
                <History className="w-6 h-6" /> 명당 기록
              </h2>
              <button onClick={() => setShowHistory(false)} aria-label="명당 기록 닫기" className="p-3 rounded-full bg-white/5">
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
      <div className={`absolute bottom-0 left-0 w-full z-20 transition-all duration-700 ${step === 'survey' ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-fengshui-gold/15 blur-[80px] -z-10 rounded-full pointer-events-none transition-opacity duration-1000" />
        <div className="bg-gradient-to-b from-[#111827]/95 to-[#0a0f18]/95 backdrop-blur-3xl rounded-t-[48px] p-10 border-t border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_-20px_60px_rgba(0,0,0,0.8)]">
          <div className="w-20 h-1.5 bg-white/10 rounded-full mx-auto mb-8 shadow-inner" />
          <div className="flex items-center gap-4 mb-3">
            <div className="relative w-12 h-12 rounded-2xl bg-fengshui-gold/10 flex items-center justify-center overflow-hidden border border-fengshui-gold/20">
              <div className="absolute inset-0 bg-gradient-to-br from-fengshui-gold/20 to-transparent" />
              <Sparkles className="w-7 h-7 text-fengshui-gold fill-fengshui-gold relative z-10 drop-shadow-[0_0_10px_rgba(251,197,49,0.8)]" />
            </div>
            <h2 className="text-[28px] font-[1000] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
              지맥 동기화
            </h2>
          </div>
          <p className="text-white/60 text-[17px] mb-2 font-semibold leading-snug tracking-tight">현관문을 열었을 때 거울이 바로 보이나요?</p>
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-fengshui-gold/80 to-amber-500/60 text-[13px] mb-8 font-bold tracking-wide">
            * 가벼운 재미 요소입니다. 선택 즉시 지맥 분석이 시작됩니다.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={startAnalysis} 
              className="group relative overflow-hidden py-5 rounded-[24px] bg-gradient-to-br from-white/10 to-white/5 border border-fengshui-gold/40 font-[1000] text-xl text-fengshui-gold transition-all active:scale-95 hover:shadow-[0_0_30px_rgba(251,197,49,0.2)] hover:border-fengshui-gold/70"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-fengshui-gold/0 via-fengshui-gold/10 to-fengshui-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              <span className="relative z-10 drop-shadow-md">네, 보여요</span>
            </button>
            <button 
              onClick={startAnalysis} 
              className="group relative overflow-hidden py-5 rounded-[24px] bg-white/5 border border-white/10 font-[1000] text-xl text-white/80 transition-all active:scale-95 hover:bg-white/10 hover:text-white"
            >
              <span className="relative z-10">아니요</span>
            </button>
          </div>
        </div>
      </div>

      {/* 로딩 화면 - 8방위 정밀 스캔 시각화 (Pass 3) */}
      {step === 'loading' && (
        <div className="absolute inset-0 bg-[#0c0c1e]/90 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-500">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-fengshui-gold/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative mb-16 w-40 h-40 flex items-center justify-center">
            {/* 아우터 링 (부드러운 빛) */}
            <div className="absolute inset-0 rounded-full border border-fengshui-gold/20 shadow-[0_0_40px_rgba(251,197,49,0.15)] animate-pulse" />
            
            {/* 회전하는 레이더 스캐너 (Conic Gradient) */}
            <div className="absolute inset-2 rounded-full border border-white/5 overflow-hidden">
              <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_70%,rgba(251,197,49,0.6)_100%)] animate-[spin_2s_linear_infinite]" />
            </div>

            {/* 이너 링 (반대 방향 회전하는 모던 궤도) */}
            <div className="absolute inset-6 rounded-full border-t-2 border-r-2 border-fengshui-gold/40 animate-[spin_3s_linear_infinite_reverse]" />

            {/* 글래스모피즘 코어 */}
            <div className="absolute w-16 h-16 bg-white/10 backdrop-blur-md border border-fengshui-gold/40 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(251,197,49,0.4)]">
               <div className="absolute inset-2 bg-fengshui-gold/30 rounded-full animate-ping opacity-60" />
               <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-100 to-fengshui-gold font-[1000] text-3xl tracking-tighter drop-shadow-md">氣</span>
            </div>
          </div>
          <h3 className="text-4xl font-[1000] tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-fengshui-gold to-yellow-600 mb-4 drop-shadow-md">기운 감정 중...</h3>
          <p className="text-white/50 text-lg font-semibold tracking-widest">팔괘(八卦) 지형 정밀 스캔</p>
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
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[80] bg-amber-500/20 backdrop-blur-md px-4 py-2 rounded-full border border-amber-500/30 flex items-center gap-2 animate-pulse">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-bold text-amber-200">일부 데이터(지형/상권) 응답 지연으로 가상 기운이 혼합되었습니다.</span>
            </div>
          )}
        </div>
      )}

      {toastMessage && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[120] bg-black/80 border border-fengshui-gold/40 rounded-2xl px-5 py-3 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.35)]" role="status" aria-live="polite">
          <p className="text-sm font-semibold text-fengshui-gold">{toastMessage}</p>
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
