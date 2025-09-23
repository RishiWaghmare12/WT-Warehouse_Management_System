import React from 'react';
import './Charts.css';

const ProgressBar = ({ 
  current, 
  max, 
  label, 
  showPercentage = true, 
  size = 'medium',
  colorScheme = 'default' 
}) => {
  const percentage = Math.round((current / max) * 100);
  
  const getColor = () => {
    if (colorScheme === 'stock') {
      if (percentage < 20) return '#dc3545'; // Red - Low stock
      if (percentage < 50) return '#ffc107'; // Yellow - Medium stock
      return '#28a745'; // Green - Good stock
    }
    
    if (colorScheme === 'capacity') {
      if (percentage > 90) return '#dc3545'; // Red - Almost full
      if (percentage > 70) return '#ffc107'; // Yellow - Getting full
      return '#28a745'; // Green - Good capacity
    }
    
    return 'var(--primary)'; // Default blue
  };

  const getHeight = () => {
    switch (size) {
      case 'small': return '4px';
      case 'large': return '12px';
      default: return '8px';
    }
  };

  return (
    <div className="progress-bar-container">
      {label && (
        <div className="progress-bar-header">
          <span className="progress-bar-label">{label}</span>
          {showPercentage && (
            <span className="progress-bar-percentage">{percentage}%</span>
          )}
        </div>
      )}
      <div 
        className="progress-bar-track" 
        style={{ height: getHeight() }}
      >
        <div 
          className="progress-bar-fill"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: getColor(),
            height: '100%'
          }}
        />
      </div>
      {!label && showPercentage && (
        <span className="progress-bar-percentage-inline">{percentage}%</span>
      )}
    </div>
  );
};

export default ProgressBar;