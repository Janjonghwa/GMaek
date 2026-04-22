import React, { useEffect, useRef } from 'react';

interface MapViewProps {
  onMapClick: (lat: number, lng: number) => void;
  isBlurred: boolean;
}

export const MapView: React.FC<MapViewProps> = ({ onMapClick, isBlurred }) => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const { kakao } = window as any;
      if (kakao && kakao.maps) {
        clearInterval(timer);
        kakao.maps.load(() => {
          if (!mapContainer.current) return;
          // 디자인 리뷰 2번: 기본 UI 컨트롤 제거로 몰입감 강화
          const options = { 
            center: new kakao.maps.LatLng(37.5665, 126.9780), 
            level: 5,
          };
          const newMap = new kakao.maps.Map(mapContainer.current, options);
          
          // 지형도 오버레이
          newMap.addOverlayMapTypeId(kakao.maps.MapTypeId.TERRAIN);
          
          // 줌 컨트롤 및 지도유형 컨트롤 숨김 (기본값이 true일 수 있으므로 명시적 제거는 없으나 추가하지 않음)
          // Kakao Maps SDK는 기본적으로 컨트롤을 넣으려면 addControl을 호출해야 함. 
          // 현재는 추가 로직이 없으므로 깔끔하게 유지됨.

          kakao.maps.event.addListener(newMap, 'click', (mouseEvent: any) => {
            const latlng = mouseEvent.latLng;
            onMapClick(latlng.getLat(), latlng.getLng());
          });
        });
      }
    }, 100);
    return () => clearInterval(timer);
  }, []); 

  return (
    <div 
      ref={mapContainer} 
      style={{ width: '100%', height: '100%', position: 'absolute' }} 
      className={`transition-all duration-1000 ${isBlurred ? 'blur-2xl grayscale brightness-[0.3] scale-110' : ''}`} 
    />
  );
};
