import React from 'react';

interface SaigonDividerProps {
  text?: string;
  className?: string;
}

export const SaigonDivider: React.FC<SaigonDividerProps> = ({ text, className = '' }) => {
  return (
    <div className={`flex items-center justify-center my-6 ${className}`}>
      {/* Đường kẻ gạch bông bên trái */}
      <div className="flex-grow border-t-2 border-double border-saigon-neutral-text opacity-40"></div>
      
      {/* Biểu tượng hoặc text hoa văn ở giữa */}
      <div className="mx-3 flex items-center gap-1.5 text-saigon-primary select-none font-serif font-black text-sm">
        <span>❖</span>
        {text ? (
          <span className="font-serif italic font-bold text-saigon-neutral-text text-xs px-2 uppercase tracking-widest bg-saigon-neutral-bg">
            {text}
          </span>
        ) : (
          <span>✦</span>
        )}
        <span>❖</span>
      </div>

      {/* Đường kẻ gạch bông bên phải */}
      <div className="flex-grow border-t-2 border-double border-saigon-neutral-text opacity-40"></div>
    </div>
  );
};

export default SaigonDivider;
