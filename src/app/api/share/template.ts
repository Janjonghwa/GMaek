import React from 'react';

interface ShareImageTemplateProps {
  score: string;
  match: string;
  lat: string;
  lng: string;
}

export const ShareImageTemplate = ({ score, match, lat, lng }: ShareImageTemplateProps) => {
  const numericScore = parseInt(score, 10);
  const emoji = numericScore >= 90 ? '🌻' : numericScore >= 80 ? '🌿' : '🌱';

  return React.createElement(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0c0c1e',
        color: 'white',
        position: 'relative',
        padding: '80px',
      },
    },
    React.createElement('div', {
      style: { position: 'absolute', top: '40px', left: '40px', right: '40px', bottom: '40px', border: '4px solid #fbc531', opacity: 0.8 },
    }),
    React.createElement('div', {
      style: { position: 'absolute', top: '60px', left: '60px', right: '60px', bottom: '60px', border: '1px solid rgba(251,197,49,0.3)' },
    }),
    React.createElement('div', {
      style: { position: 'absolute', top: '25%', left: '10%', width: '80%', height: '50%', backgroundImage: 'radial-gradient(circle, rgba(251,197,49,0.1) 0%, rgba(12,12,30,0) 70%)' },
    }),
    React.createElement(
      'div',
      { style: { position: 'absolute', top: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center' } },
      React.createElement('span', { style: { fontSize: 28, color: '#fbc531', fontWeight: 700, letterSpacing: '0.2em' } }, 'GEOMANCY COORDINATES'),
      React.createElement('span', { style: { fontSize: 36, marginTop: 15, color: 'white', opacity: 0.7 } }, `${lat}N / ${lng}E`)
    ),
    React.createElement('div', { style: { fontSize: 180, marginBottom: 40 } }, emoji),
    React.createElement('h1', { style: { fontSize: 110, color: '#fbc531', margin: '30px 0', letterSpacing: '-0.05em', textAlign: 'center', fontWeight: 900 } }, match),
    React.createElement(
      'div',
      { style: { display: 'flex', alignItems: 'center', flexDirection: 'column', marginTop: 60 } },
      React.createElement('span', { style: { fontSize: 260, fontWeight: 900, lineHeight: 1 } }, score),
      React.createElement('div', { style: { height: 14, width: 180, backgroundColor: '#fbc531', marginTop: 40 } }),
      React.createElement('span', { style: { fontSize: 32, marginTop: 50, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.6em', fontWeight: 700 } }, 'INTEGRATED ENERGY')
    ),
    React.createElement(
      'div',
      { style: { position: 'absolute', bottom: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center' } },
      React.createElement(
        'div',
        { style: { padding: '25px 80px', border: '2px solid rgba(251,197,49,0.5)', borderRadius: '100px', display: 'flex' } },
        React.createElement('span', { style: { fontSize: 40, color: '#fbc531', fontWeight: 800 } }, '지맥(G-Maek) 정밀 풍수')
      ),
      React.createElement('span', { style: { fontSize: 24, marginTop: 30, color: 'rgba(255,255,255,0.2)', fontWeight: 700 } }, 'VERIFIED GIS ALGORITHM v2.0')
    )
  );
};
