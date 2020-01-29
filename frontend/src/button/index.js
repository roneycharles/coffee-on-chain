import React from 'react';
import './styles.css';

export default function Button(props) {

    return (
        <div className="buttonStyle" style={{
            top: `${props.top || 18}%`,
            left: `${props.left || 30}%`,
            width: `${props.width || 18}%`,
            height: `${props.height || 14}%`,
          }}>
          <div style={{
              zIndex: -2,
            position: 'relative',
            left: '75%',
            height: '100%',
            width: '20%',
            backgroundColor: `${props.active?'green':'white'}`
          }}></div>
        </div>
        
    );
}


