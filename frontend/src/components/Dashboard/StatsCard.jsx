import React from 'react';
import ProgressBar from '../Charts/ProgressBar';
import './Dashboard.css';

const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'primary',
  showProgress = false,
  progressCurrent,
  progressMax,
  progressColorScheme = 'default'
}) => {
  const getColorClass = () => {
    switch (color) {
      case 'success': return 'stats-card-success';
      case 'warning': return 'stats-card-warning';
      case 'danger': return 'stats-card-danger';
      case 'info': return 'stats-card-info';
      default: return 'stats-card-primary';
    }
  };

  return (
    <div className={`stats-card ${getColorClass()}`}>
      <div className="stats-card-header">
        {icon && <div className="stats-card-icon">{icon}</div>}
        <div className="stats-card-content">
          <h3 className="stats-card-title">{title}</h3>
          <div className="stats-card-value">{value}</div>
          {subtitle && <p className="stats-card-subtitle">{subtitle}</p>}
        </div>
      </div>
      
      {showProgress && progressCurrent !== undefined && progressMax !== undefined && (
        <div className="stats-card-progress">
          <ProgressBar
            current={progressCurrent}
            max={progressMax}
            size="small"
            colorScheme={progressColorScheme}
            showPercentage={false}
          />
        </div>
      )}
    </div>
  );
};

export default StatsCard;