import React from 'react';

const classes = {
  wrapper: 'block pt-8 md:pt-12 md:flex',
  title: 'pb-4 md:pb-6 md:w-full md:max-w-150 md:p-0 animate-fade-in-up',
  heading: 'font-display font-light tracking-widest text-sm text-gray-600 dark:text-gray-300 leading-normal uppercase',
  content: 'flex-none text-lg text-gray-600 dark:text-gray-300 font-display font-light md:flex-1 md:pl-20',
};

const Section = ({ title, children, titleDelay = '', contentDelay = '' }) => {
  const titleClasses = `${classes.title} ${titleDelay}`;
  const contentClasses = `${classes.content} ${contentDelay}`;
  
  return (
    <div className={classes.wrapper}>
      <div className={titleClasses}>
        <h2 className={classes.heading}>{title}</h2>
      </div>
      <div className={contentClasses}>{children}</div>
    </div>
  );
};

export default Section;


