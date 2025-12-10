import React from 'react';

const Header: React.FC = () => {
  const snowflakeBg = {
    backgroundImage: `url("data:image/svg+xml,%3csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cg id='snowflake'%3e%3cpath d='M0 -10 L0 10 M-8.66 -5 L8.66 5 M-8.66 5 L8.66 -5' stroke='white' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M-5 -2 L-5 2 M5 -2 L5 2 M-2 -7 L2 -7 M-2 7 L2 7' stroke='white' stroke-width='1' stroke-linecap='round'/%3e%3c/g%3e%3c/defs%3e%3cuse href='%23snowflake' transform='translate(30 40) scale(1.2)' opacity='0.3'/%3e%3cuse href='%23snowflake' transform='translate(150 70) scale(0.8)' opacity='0.2'/%3e%3cuse href='%23snowflake' transform='translate(80 160) scale(1.5)' opacity='0.4'/%3e%3cuse href='%23snowflake' transform='translate(180 180) scale(0.6)' opacity='0.15'/%3e%3c/svg%3e")`,
    textShadow: '0 1px 3px rgba(0,0,0,0.4)', // For readability
  };

  return (
    <header
      className="bg-ogabassey p-4 text-white shadow-lg sticky top-0 z-10 flex items-center justify-between"
      style={{
        backgroundImage: snowflakeBg.backgroundImage,
        borderBottom: '4px solid #a4171d' // Darker red border
      }}
    >
      {/* Left Icon */}
      <div className="w-16">
        <button aria-label="Go back" className="p-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
        </button>
      </div>

      {/* Title */}
      <div className="text-center">
        <h1 className="font-christmas text-2xl md:text-3xl tracking-wider" style={{ textShadow: snowflakeBg.textShadow }}>
          Santa's Workshop
        </h1>
        <p className="text-xs text-red-100" style={{ textShadow: snowflakeBg.textShadow }}>
          by Ogabassey
        </p>
      </div>
      
      {/* Right Icons */}
      <div className="w-16 flex items-center justify-end gap-2">
        {/* Call Icon */}
        <button aria-label="Call Santa" className="p-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 2.056l-1.293.97c-.135.101-.164.279-.087.431l4.28 7.433c.077.152.256.18.431.087l.97-1.293a1.875 1.875 0 0 1 2.056-.694l4.423 1.105c.834.209 1.42.959 1.42 1.819V19.5a3 3 0 0 1-3 3h-2.25C6.55 22.5 1.5 17.45 1.5 10.5V4.5Z" clipRule="evenodd" />
            </svg>
        </button>
        {/* Cart Icon */}
        <button aria-label="View Cart" className="p-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.763.746-1.858 1.705L3.11 18.238A3 3 0 0 0 6.077 21h11.846a3 3 0 0 0 2.967-2.762l-.545-9.783A1.875 1.875 0 0 0 18.487 6.75H16.5V6a4.5 4.5 0 0 0-9 0Zm1.5 0V6a3 3 0 0 1 6 0v.75H9Z" clipRule="evenodd" />
            </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;