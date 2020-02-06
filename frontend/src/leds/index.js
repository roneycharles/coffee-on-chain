import React from 'react';
import './star.css';

export default function Leds(props) {
    const led = -1;
  return (
    <div className="ledStyle" style={{
      top: `${props.top || 18}%`,
      left: `${props.left || 30}%`,
      width: `${props.width || 18}%`,
      height: `${props.height || 14}%`,
    }} >
      <div style={{
        zIndex: -2,
        position: 'relative',
        left: '0%',
        height: '100%',
        width: '100%',
        backgroundColor: `${props.active ? '#2e7d32' : 'rgba(238, 238, 238, 0.9)'}`,
        pointerEvents: `${props.active ? 'none' : 'auto'}`
      }} >
      </div>

    </div >

  );
}


