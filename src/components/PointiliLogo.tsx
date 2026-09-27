import React from 'react';

interface PointiliLogoProps {
  variant?: 'mark' | 'icon' | 'full' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'dark' | 'light' | 'lime';
}

export const PointiliLogo: React.FC<PointiliLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  theme = 'lime',
}) => {
  // Dimension maps
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  // The distinctive Calligraphic P & Two Dots SVG from the user's brand image
  const renderMark = (color: string = '#000000', highlightColor: string = '#76FF03') => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
      {/* Upper left top dot (larger) */}
      <circle cx="30" cy="14" r="5.8" fill={color} />
      {/* Upper left side dot (smaller) */}
      <circle cx="21" cy="27" r="5.2" fill={color} />
      
      {/* Calligraphic "P" stroke */}
      <path
        d="M 33 26
           C 40 21, 60 17, 78 26
           C 91 33, 93 45, 87 56
           C 78 70, 58 77, 43 78
           C 36 78, 30 76, 26 73
           L 32 79
           C 30 84, 28 89, 29 90
           C 30 92, 33 90, 37 81
           C 42 70, 50 54, 57 41
           C 60 36, 56 34, 50 37
           C 45 40, 39 49, 36 57
           L 29 73
           C 26 76, 24 74, 25 70
           C 27 63, 39 37, 44 28
           C 41 27, 36 29, 33 26 Z"
        fill={color}
      />
      {/* Dynamic P contour matching the brand art precisely */}
      <path
        d="M 33 26 
           C 45 20, 72 20, 82 30 
           C 90 38, 88 51, 80 61 
           C 69 73, 51 77, 38 74 
           L 28 92 
           C 26 95, 23 94, 24 90 
           L 38 29 
           C 38 26, 35 27, 33 26 Z"
        fill={color}
      />
      {/* Primary smooth outer calligraphy body */}
      <path
        d="M 32 29 
           C 45 21, 74 21, 84 32
           C 92 42, 88 55, 78 65
           C 65 77, 46 78, 36 75
           L 26 92
           C 24 95, 20 92, 22 88
           L 39 30
           C 39 28, 35 28, 32 29 Z"
        fill={color}
      />
      {/* Detailed P path matching Image 2 */}
      <path
        d="M 33 27 
           C 48 18, 77 21, 86 33 
           C 93 42, 90 55, 80 65 
           C 67 76, 47 79, 36 76 
           L 26 91 
           C 24 94, 21 91, 23 87 
           L 40 28 
           C 40 26, 36 26, 33 27 Z"
        fill={color}
      />
      {/* Glossy inner highlights on the loop and stem */}
      <path
        d="M 46 32 C 49 28, 51 28, 53 32 L 44 48 C 42 51, 40 50, 42 45 Z"
        fill={highlightColor}
        opacity="0.9"
      />
      <path
        d="M 77 31 C 82 36, 85 41, 83 45 C 80 43, 76 37, 72 34 Z"
        fill={highlightColor}
        opacity="0.9"
      />
      <path
        d="M 60 70 C 66 68, 72 63, 76 57 C 74 61, 68 66, 62 68 Z"
        fill={highlightColor}
        opacity="0.9"
      />
    </svg>
  );

  // Mark only
  if (variant === 'mark') {
    return (
      <div className={`relative ${iconSizes[size]} ${className}`}>
        {renderMark(theme === 'dark' ? '#FFFFFF' : theme === 'lime' ? '#000000' : '#76FF03', '#76FF03')}
      </div>
    );
  }

  // App icon style (like Image 4: white rounded-square container with lime P and green dots)
  if (variant === 'icon') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-2xl p-2 shadow-lg transition-transform ${
          theme === 'lime'
            ? 'bg-[#76FF03] text-black shadow-[#76FF03]/20'
            : theme === 'light'
            ? 'bg-white text-[#76FF03] shadow-black/10'
            : 'bg-zinc-900 border border-zinc-800 text-[#76FF03] shadow-black/40'
        } ${iconSizes[size]} ${className}`}
      >
        <div className="w-full h-full flex items-center justify-center">
          {renderMark(
            theme === 'lime' ? '#000000' : '#76FF03',
            theme === 'lime' ? '#FFFFFF' : '#76FF03'
          )}
        </div>
      </div>
    );
  }

  // Badge variant
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 ${className}`}>
        <div className="w-5 h-5">
          {renderMark('#76FF03', '#FFFFFF')}
        </div>
        <span className="font-semibold text-xs tracking-tight text-white font-['Plus_Jakarta_Sans']">
          Pointili
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#76FF03] animate-pulse" />
      </div>
    );
  }

  // Full Horizontal Brand Lockup (App Icon + Cursive Wordmark "Pointili" as in Image 4)
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Rounded square container with lime 'P' mark */}
      <div
        className={`relative flex items-center justify-center rounded-2xl p-1.5 shrink-0 ${
          theme === 'lime'
            ? 'bg-white text-[#76FF03] shadow-sm'
            : theme === 'dark'
            ? 'bg-[#76FF03] text-black shadow-md shadow-[#76FF03]/25'
            : 'bg-black text-[#76FF03] border border-zinc-800'
        } ${iconSizes[size]}`}
      >
        {renderMark(
          theme === 'lime' ? '#76FF03' : theme === 'dark' ? '#000000' : '#76FF03',
          theme === 'lime' ? '#000000' : '#FFFFFF'
        )}
      </div>

      {/* Stylized Wordmark "Pointili" matching the playful cursive script in Image 4 */}
      <div className="flex flex-col">
        <span
          className={`font-['Pacifico',cursive] tracking-normal leading-none select-none ${
            size === 'sm'
              ? 'text-xl'
              : size === 'md'
              ? 'text-2xl'
              : size === 'lg'
              ? 'text-3xl'
              : 'text-4xl'
          } ${
            theme === 'lime'
              ? 'text-white drop-shadow-sm'
              : theme === 'light'
              ? 'text-zinc-900'
              : 'text-white'
          }`}
        >
          Pointili
        </span>
      </div>
    </div>
  );
};
