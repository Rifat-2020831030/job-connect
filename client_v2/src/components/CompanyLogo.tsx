import React from 'react';
import Image from 'next/image';

export interface CompanyLogoProps {
  logo?: string | null;
  companyName?: string;
  className?: string;
  fallbackClassName?: string;
  fallbackStyle?: React.CSSProperties;
  imageClassName?: string;
}

export default function CompanyLogo({
  logo,
  companyName = 'Company',
  className = '',
  fallbackClassName = 'bg-primary/10 text-primary font-bold',
  fallbackStyle = {},
  imageClassName = 'object-contain p-2 text-[10px] leading-tight text-center text-gray-400 break-words'
}: CompanyLogoProps) {
  const initial = companyName ? companyName.charAt(0).toUpperCase() : 'C';

  if (logo) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
        <Image 
          src={logo} 
          alt={`${companyName} logo`} 
          fill 
          unoptimized 
          className={imageClassName} 
        />
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center justify-center overflow-hidden ${className} ${fallbackClassName}`} 
      style={fallbackStyle}
    >
      <span>{initial}</span>
    </div>
  );
}
