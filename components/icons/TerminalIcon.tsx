import React from 'react';

export const TerminalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
    >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 12l4.179 2.25M6.429 9.75 7.5 4.5l-2.143 5.25M17.571 9.75l1.072-5.25L16.5 9.75m-3.429 0L12 4.5l1.071 5.25" />
  </svg>
);
