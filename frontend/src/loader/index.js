import React from 'react';

function Loader() {
  return (
    <div className="loader center" style={{
        width:"100%", height:"100%", backgroundColor: "white",
        position: "absolute", display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center", zIndex: 999
    }}>
      <i className="fa fa-spinner fa-pulse fa-5x fa-w" />
    </div>
  );
}

export default Loader;