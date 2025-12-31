import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'danger' }> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const base = "px-6 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-[#2D5A27] text-white hover:bg-[#23451e] shadow-lg shadow-green-900/10",
    secondary: "bg-[#A7C957] text-[#2D5A27] hover:bg-[#96b44e]",
    outline: "border-2 border-gray-200 text-gray-700 hover:bg-gray-50",
    danger: "bg-red-500 text-white hover:bg-red-600"
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input 
    className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A27] focus:border-transparent transition-all ${className}`} 
    {...props} 
  />
);

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'blue' | 'yellow' | 'red' }> = ({ children, color = 'blue' }) => {
  const colors = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700"
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors[color]}`}>
      {children}
    </span>
  );
};

// --- Skeleton Components ---

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent ${className}`}></div>
);

export const ExamCardSkeleton: React.FC = () => (
  <Card className="p-6 border-none shadow-lg">
    <div className="flex justify-between items-start mb-4">
      <Skeleton className="w-20 h-6 rounded-full" />
      <Skeleton className="w-16 h-3 rounded-full" />
    </div>
    <Skeleton className="w-3/4 h-6 mb-3 rounded-md" />
    <div className="space-y-2 mb-6">
      <Skeleton className="w-full h-3 rounded-sm" />
      <Skeleton className="w-5/6 h-3 rounded-sm" />
    </div>
    <div className="flex items-center gap-4 mb-6">
      <Skeleton className="w-16 h-4 rounded-md" />
      <Skeleton className="w-16 h-4 rounded-md" />
    </div>
    <Skeleton className="w-full h-12 rounded-xl" />
  </Card>
);
