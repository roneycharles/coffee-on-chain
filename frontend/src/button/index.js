import React from 'react';
import './styles.css';

export default function Button(props) {

  return (
    <div className="buttonStyle" style={{
      top: `${props.top || 18}%`,
      left: `${props.left || 30}%`,
      width: `${props.width || 18}%`,
      height: `${props.height || 14}%`,
    }} onClick={props.onClick} >
      <div style={{
        zIndex: -2,
        position: 'relative',
        left: `${props.left > 30 ? '0%' : '75%'}`,
        height: '100%',
        width: `${props.left > 79 ? '100%' : '25%'}`,
        backgroundColor: `${props.active ? '#2e7d32' : 'rgba(238, 238, 238, 0.9)'}`,
        pointerEvents: `${props.active ? 'none' : 'auto'}`
      }} >
        {
          props.component
        }
      </div>

    </div >

  );
}


