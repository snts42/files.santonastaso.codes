import React from 'react';

const Input = ({ label, type = 'text', value, onChange, min, max, className = '', ...props }) => {
  return (
    <label className="block">
      <span className="block mb-1 text-sm font-display font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className={`
          w-full h-10 px-3 py-2 rounded-md border border-cyan-400 bg-white/80 dark:bg-[#1f2630]/80 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-sm hover:shadow-md hover:border-cyan-500 hover:scale-[1.02] transition-all duration-150
          ${className}
        `}
        {...props}
      />
    </label>
  );
};

export default Input;


