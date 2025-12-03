import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Generating icons...' }: LoadingSpinnerProps) {
  return (
    <div className="loading-container">
      <div className="spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <p className="loading-message">{message}</p>
      <p className="loading-hint">This may take 30-60 seconds</p>
    </div>
  );
}
