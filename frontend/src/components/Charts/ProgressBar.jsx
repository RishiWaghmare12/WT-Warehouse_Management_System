import './Charts.css';
import { calculateUtilization } from '../../utils/calculations';
import { getStockStatusColor, getCapacityStatusColor } from '../../utils/statusHelpers';

const ProgressBar = ({ 
  current, 
  max, 
  label, 
  showPercentage = true, 
  size = 'medium',
  colorScheme = 'default' 
}) => {
  const percentage = calculateUtilization(current, max);
  
  const getColor = () => {
    if (colorScheme === 'stock') {
      return getStockStatusColor(percentage);
    }
    
    if (colorScheme === 'capacity') {
      return getCapacityStatusColor(percentage);
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