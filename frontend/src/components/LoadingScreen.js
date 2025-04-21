import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <h1>DreamOracle</h1>
        <div className="loading-spinner"></div>
        <p>Entering the dream realm...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
