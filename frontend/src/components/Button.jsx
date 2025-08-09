import React from 'react';

const Button = ({ children, onClick, type = 'button', disabled = false, className = '', variant = 'primary', loading = false }) => {
  const baseClasses = `
    inline-flex items-center justify-center
    px-4 py-2
    text-sm font-display font-medium
    rounded-md
    transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transform hover:scale-105 active:scale-95
    ${className}
  `;

  const variantClasses = {
    primary: `
      bg-primary text-white
      hover:bg-primary/90 hover:shadow-lg
      border border-transparent
      shadow-md
    `,
    secondary: `
      bg-white/80 backdrop-blur-sm dark:bg-gray-800/80
      text-gray-900 dark:text-gray-100
      border border-cyan-400/60 dark:border-cyan-400/60
      hover:bg-white/90 dark:hover:bg-gray-700/90
      hover:border-cyan-400 hover:shadow-md
      shadow-sm
    `,
    outline: `
      bg-transparent
      text-primary
      border border-primary
      hover:bg-primary hover:text-white hover:shadow-md
    `
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;


