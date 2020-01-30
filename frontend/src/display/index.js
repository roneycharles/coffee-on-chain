import React from 'react';
import './custom.css';

export default function Display(props) {

  return (
    <div className="displayStyle" style={{
      top: `${props.top || 18}%`,
      left: `${props.left || 30}%`,
      width: `${props.width || 18}%`,
      height: `${props.height || 14}%`,
    }}>
      <div style={{
        zIndex: 0,
        position: 'relative',
        left: '0%',
        height: '100%',
        width: '100%',
        backgroundColor: '#2e7d32',
      }} >
        {
          props.component
        }
      </div>

    </div >

  );
}


