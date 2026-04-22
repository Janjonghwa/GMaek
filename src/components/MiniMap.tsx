import React, { useEffect, useRef } from 'react';

interface MiniMapProps {
  lat: number;
  lng: number;
}

export const MiniMap: React.FC<MiniMapProps> = ({ lat, lng }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { kakao } = window as any;
    if (kakao && kakao.maps && container.current) {
      kakao.maps.load(() => {
        const options = {
          center: new kakao.maps.LatLng(lat, lng),
          level: 3,
          draggable: false,
          zoomable: false,
          scrollwheel: false,
          disableDoubleClick: true,
          disableDoubleClickZoom: true
        };

        const map = new kakao.maps.Map(container.current, options);
        map.addOverlayMapTypeId(kakao.maps.MapTypeId.TERRAIN);

        // 마커 추가
        const markerPosition = new kakao.maps.LatLng(lat, lng);
        const marker = new kakao.maps.Marker({
          position: markerPosition
        });
        marker.setMap(map);
      });
    }
  }, [lat, lng]);

  return (
    <div 
      ref={container} 
      className="w-full h-full bg-[#1a1a2e]"
    />
  );
};
