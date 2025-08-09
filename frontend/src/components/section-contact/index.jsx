import React from 'react';
import Section from '../Section';

const SectionContact = ({ email, phone }) => {
  if (!email && !phone) return null;

  return (
    <Section title="Contact" titleDelay="animate-fade-in-up-delay-300" contentDelay="animate-fade-in-up-delay-300">
      <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-lg text-gray-600 font-display font-light">
        {email && (
          <>
            <span className="dark:text-gray-400">Email:</span>
            <a
              href={`mailto:${email}`}
              className="underline text-gray-900 dark:text-gray-100 hover:!text-cyan-400 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 break-all"
            >
              {email}
            </a>
          </>
        )}
        {phone && (
          <>
            <span className="dark:text-gray-400">Phone:</span>
            <a
              href={`tel:${phone}`}
              className="underline text-gray-900 dark:text-gray-100 hover:!text-cyan-400 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              {phone}
            </a>
          </>
        )}

      </div>
    </Section>
  );
};

export default SectionContact;
