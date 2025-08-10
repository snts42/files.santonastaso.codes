import React from 'react';
import DarkModeToggle from './DarkModeToggle';

const classes = {
  wrapper: 'flex items-center gap-4 mb-8 md:mb-12 md:block md:flex md:pt-0',
  imageWrapper: 'flex-shrink-0 md:relative md:w-full md:max-w-150 md:h-28 md:overflow-visible md:mt-0 md:flex md:items-center md:justify-center animate-fade-in-up',
  logoContainer: 'flex items-center justify-center md:static md:w-full md:h-full',
  logo: 'w-14 h-14 md:w-24 md:h-24 rounded-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black border-2 border-cyan-400/60 hover:border-cyan-400 shadow-lg hover:shadow-cyan-400/30 transition-all duration-300 hover:scale-102 cursor-pointer group',
  contentWrapper: 'flex-1 md:flex-none md:pt-6 md:flex-1 md:pl-20 animate-fade-in-up',
  name: 'text-2xl md:text-4xl font-display font-bold leading-tight tracking-tight bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 dark:from-gray-300 dark:via-white dark:to-gray-300 bg-clip-text text-transparent hover:from-cyan-600 hover:via-cyan-500 hover:to-cyan-600 dark:hover:from-cyan-400 dark:hover:via-cyan-300 dark:hover:to-cyan-400 transition-all duration-500',
  description: 'text-sm md:text-base text-gray-600 dark:text-gray-400 font-display font-light',
  list: 'mt-3 md:mt-6 uppercase tracking-wider',
  item: 'inline list-none pr-3 md:pr-4',
  link: 'inline-block py-1 md:py-2 font-display font-semibold text-xs text-gray-600 dark:text-gray-400 transition-all duration-300 hover:!text-cyan-400 dark:hover:!text-cyan-400 hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-400 transform hover:scale-105',
};

const Header = ({ metadata = {} }) => {
  const github = metadata.github;
  const linkedin = metadata.linkedin;
  const resume = metadata.resume;
  const portfolioUrl = "https://santonastaso.codes"; // Your portfolio URL

  return (
    <div className={classes.wrapper}>
      <div className={classes.imageWrapper}>
        <div className={classes.logoContainer}>
          <a 
            href={portfolioUrl} 
            className={classes.logo}
          >
            {/* Clean minimalist glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/15 to-cyan-500/15 dark:from-cyan-400/25 dark:to-cyan-500/25 rounded-full group-hover:from-cyan-400/30 group-hover:to-cyan-500/30 dark:group-hover:from-cyan-400/40 dark:group-hover:to-cyan-500/40 transition-all duration-300"></div>
          </a>
        </div>
      </div>
      <div className={classes.contentWrapper}>
        <h1 className={classes.name}>
          <a href={portfolioUrl}>{metadata.name}</a>
        </h1>
        <p className={classes.description}>{metadata.description}</p>
        <div className="flex items-center justify-between">
          <ul className={classes.list}>
            {github && (
              <li className={classes.item}>
                <a className={classes.link} href={github}>
                  GitHub
                </a>
              </li>
            )}
            {linkedin && (
              <li className={classes.item}>
                <a className={classes.link} href={linkedin}>
                  LinkedIn
                </a>
              </li>
            )}
            {resume && (
              <li className={classes.item}>
                <a className={classes.link} href={resume} target="_blank" rel="noopener noreferrer">
                  Resume
                </a>
              </li>
            )}
            <li className={`${classes.item} hidden md:inline`}>
              <a className={classes.link} href="https://your-domain.com" target="_blank" rel="noopener noreferrer">
                Portfolio
              </a>
            </li>

          </ul>
          
          {/* Mobile dark mode toggle */}
          <div className="md:hidden">
            <DarkModeToggle mobile={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;




