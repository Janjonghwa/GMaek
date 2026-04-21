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
          const options = { center: new kakao.maps.LatLng(37.5665, 126.9780), level: 5 };
          const newMap = new kakao.maps.Map(mapContainer.current, options);
          
          // 10x Vision: 지형도(Terrain) 오버레이 추가
          newMap.addOverlayMapTypeId(kakao.maps.MapTypeId.TERRAIN);
          
          kakao.maps.event.addListener(newMap, 'click', (mouseEvent: any) => {
            const latlng = mouseEvent.latLng;
            onMapClick(latlng.getLat(), latlng.getLng());
          });
        });
      }
    }, 100);
    return () => clearInterval(timer);
  // onMapClick이 계속 바뀌면 지도가 다시 렌더링되므로 의존성 배열에서 제거하거나 메모이제이션 필요.
  // 여기서는 초기 로드에만 실행되도록 빈 배열을 넣습니다. (단, onMapClick 최신화 주의)
  }, []); 

  return (
    <div 
      ref={mapContainer} 
      style={{ width: '100%', height: '100%', position: 'absolute' }} 
      className={`transition-all duration-1000 ${isBlurred ? 'blur-2xl grayscale brightness-[0.3] scale-110' : ''}`} 
    />
  );
};
