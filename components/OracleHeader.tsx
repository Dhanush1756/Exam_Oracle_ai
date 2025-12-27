
import React from 'react';

const OracleHeader: React.FC = () => {
  return (
    <header className="text-center py-12 px-4">
      <div className="inline-block relative">
        <h1 className="oracle-title text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-400 to-indigo-300 mb-4 animate-pulse">
          EXAM ORACLE
        </h1>
        <div className="absolute -inset-1 bg-purple-500/20 blur-xl -z-10 rounded-full"></div>
      </div>
      <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed mt-4 italic font-light">
        "Bring me your scrolls, your scribbles, and your heavy tomes. I shall illuminate the path to mastery, revealing only what truly matters."
      </p>
    </header>
  );
};

export default OracleHeader;
