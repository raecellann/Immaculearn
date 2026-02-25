import React from 'react';

// Dashboard-specific styles and animations
export const dashboardStyles = `
/* Dashboard Animations */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out;
}

.animate-slide-in-left {
  animation: slide-in-left 0.6s ease-out;
}

.animate-slide-in-right {
  animation: slide-in-right 0.6s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.5s ease-out;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Stagger animation delays */
.animate-delay-100 {
  animation-delay: 100ms;
}

.animate-delay-200 {
  animation-delay: 200ms;
}

.animate-delay-300 {
  animation-delay: 300ms;
}

.animate-delay-400 {
  animation-delay: 400ms;
}

.animate-delay-500 {
  animation-delay: 500ms;
}

/* Glassmorphism effect */
.glass-effect {
  background: rgba(30, 36, 46, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Loading shimmer effect */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.shimmer {
  background: linear-gradient(90deg, 
    rgba(255,255,255,0) 0%, 
    rgba(255,255,255,0.1) 50%, 
    rgba(255,255,255,0) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
`;

// Component to inject dashboard styles
const DashboardStyles = () => {
  return <style>{dashboardStyles}</style>;
};

export default DashboardStyles;
