
import React, { useState } from 'react';
import { Sparkles, Brain, Lightbulb, CheckCircle, ListChecks, Clock, Target, ChevronRight } from 'lucide-react';
import { StudyGuideResponse } from '../types';

interface StudyGuideProps {
  guide: StudyGuideResponse;
}

const StudyGuide: React.FC<StudyGuideProps> = ({ guide }) => {
  const [completedConcepts, setCompletedConcepts] = useState<Set<string>>(new Set());

  const toggleConcept = (name: string) => {
    const next = new Set(completedConcepts);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setCompletedConcepts(next);
  };

  const progress = Math.round((completedConcepts.size / guide.highPriorityConcepts.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Progress Header */}
      <div className="sticky top-4 z-30 glass-card px-6 py-4 rounded-2xl border-b-2 border-indigo-500/30 flex items-center justify-between gap-6 shadow-2xl">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-indigo-300 uppercase tracking-widest">Mastery Level</span>
            <span className="text-sm font-bold text-white">{progress}% Complete</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 shadow-[0_0_10px_rgba(52,211,153,0.3)]" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
           <Clock className="w-4 h-4 text-indigo-400" />
           <span className="text-sm font-medium">{guide.estimatedStudyTime || '2-3 hours'}</span>
        </div>
      </div>

      {/* Oracle Intro */}
      <section className="glass-card p-10 rounded-3xl relative overflow-hidden border-t-2 border-amber-500/30 shadow-2xl group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Sparkles className="w-48 h-48 text-amber-500" />
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Sparkles className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h2 className="oracle-title text-3xl text-amber-100 uppercase tracking-widest leading-none">{guide.guideTitle}</h2>
            <p className="text-amber-500/60 text-xs font-bold uppercase mt-1">High-Priority Prophecy</p>
          </div>
        </div>
        <p className="text-slate-300 italic text-xl leading-relaxed border-l-4 border-amber-500/30 pl-8 py-2">
          "{guide.oracleMessage}"
        </p>
      </section>

      {/* High Priority Concepts */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="text-purple-400" />
            Core Overlaps
          </h3>
          <span className="text-slate-500 text-xs font-medium uppercase tracking-widest">
            {guide.highPriorityConcepts.length} Concepts Identified
          </span>
        </div>
        
        <div className="grid gap-6">
          {guide.highPriorityConcepts.map((concept, idx) => (
            <div 
              key={idx} 
              onClick={() => toggleConcept(concept.name)}
              className={`glass-card p-8 rounded-3xl transition-all duration-300 border cursor-pointer group hover:shadow-indigo-500/5 ${
                completedConcepts.has(concept.name) 
                  ? 'border-emerald-500/30 bg-emerald-500/5' 
                  : 'border-slate-700 hover:border-purple-500/40 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    completedConcepts.has(concept.name) ? 'bg-emerald-500 border-emerald-500 text-slate-900' : 'border-slate-600 group-hover:border-purple-500'
                  }`}>
                    {completedConcepts.has(concept.name) && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <h4 className={`text-2xl font-bold transition-colors ${
                    completedConcepts.has(concept.name) ? 'text-slate-400 line-through' : 'text-purple-300'
                  }`}>
                    {concept.name}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black rounded-full border border-amber-500/20">
                    <Target className="w-3 h-3" />
                    FOCUS SCORE: {concept.overlapIndex || (concept.sourcesFoundIn.length * 3 + 4)}
                  </div>
                  {concept.sourcesFoundIn.map((src, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-500/10 text-indigo-300 text-[10px] font-bold rounded-full border border-indigo-500/20 uppercase tracking-tighter">
                      {src}
                    </span>
                  ))}
                </div>
              </div>
              
              <p className="text-slate-300 mb-8 leading-relaxed text-lg">
                {concept.description}
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800 group-hover:border-slate-700 transition-colors">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black text-purple-500 mb-3 block">Strategy</span>
                  <p className="text-sm text-slate-400 italic leading-relaxed">{concept.priorityReasoning}</p>
                </div>
                <div className="bg-amber-500/5 p-5 rounded-2xl border border-amber-500/10 group-hover:border-amber-500/20 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-amber-500">The Secret</span>
                  </div>
                  <p className="text-sm text-amber-50/80 font-medium leading-relaxed">{concept.tips}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Study Plan */}
      <section className="glass-card p-10 rounded-[3rem] border border-emerald-500/20 bg-emerald-500/5 shadow-inner">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-emerald-500/10 rounded-2xl">
            <ListChecks className="text-emerald-400 w-8 h-8" />
          </div>
          <h3 className="text-3xl font-bold text-white">Your Quest Log</h3>
        </div>
        <div className="space-y-6">
          {guide.suggestedStudyPlan.map((step, idx) => (
            <div key={idx} className="flex items-start gap-6 group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0 flex items-center justify-center text-emerald-400 font-black text-sm shadow-sm transition-transform group-hover:scale-110">
                {idx + 1}
              </div>
              <div className="pt-2 border-b border-white/5 pb-4 flex-1">
                <p className="text-slate-200 text-lg group-hover:text-white transition-colors">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="text-center py-20">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group px-8 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-slate-400 hover:text-white hover:border-indigo-500 transition-all text-sm uppercase tracking-widest font-bold flex items-center gap-3 mx-auto shadow-xl"
        >
          <Target className="w-5 h-5 group-hover:animate-ping" />
          Return to the Altar
        </button>
      </div>
    </div>
  );
};

export default StudyGuide;
