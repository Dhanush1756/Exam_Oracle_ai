
import React, { useState, useEffect } from 'react';
import { Quiz, QuizQuestion, QuizAttempt } from '../types';
import { authService } from '../services/authService';
import { CheckCircle2, XCircle, Sparkles, ArrowRight, RotateCcw, Award, BarChart3 } from 'lucide-react';
import PerformanceGraph from './PerformanceGraph';

interface QuizComponentProps {
  quiz: Quiz;
  onClose: () => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ quiz, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [history, setHistory] = useState<QuizAttempt[]>([]);

  const currentQuestion = quiz.questions[currentIdx];

  useEffect(() => {
    // Load existing history on mount
    setHistory(authService.getQuizAttempts());
  }, []);

  const handleOptionSelect = (idx: number) => {
    if (showFeedback) return;
    setSelectedOption(idx);
  };

  const handleConfirm = () => {
    if (selectedOption === null) return;
    
    if (selectedOption === currentQuestion.correctOptionIndex) {
      setScore(prev => prev + 1);
    }
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentIdx + 1 < quiz.questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      // Save result before finishing
      const percentage = Math.round((score / quiz.questions.length) * 100);
      authService.saveQuizAttempt({
        quizTitle: quiz.title,
        score: score,
        total: quiz.questions.length,
        percentage: percentage
      });
      // Refresh local history
      setHistory(authService.getQuizAttempts());
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="glass-card p-10 rounded-[3rem] text-center animate-in zoom-in duration-500 overflow-hidden relative">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/20 transform rotate-3">
            <Award className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="oracle-title text-4xl text-white mb-2 tracking-wide">Ritual Accomplished</h2>
          <p className="text-slate-400 mb-10 text-lg">The Oracle records your progress in the eternal archives.</p>
          
          <div className="inline-block p-10 rounded-full border-4 border-indigo-500/30 bg-indigo-500/5 mb-8 relative">
            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-indigo-300 to-purple-400">
              {percentage}%
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
              Mastery Level
            </div>
          </div>

          <p className="text-amber-200/60 font-medium mb-12 italic text-lg max-w-md mx-auto leading-relaxed">
            {percentage >= 80 ? '"The scrolls have revealed their secrets to you. You are truly illuminated."' : percentage >= 50 ? '"The foundation is solid. Continued meditation will bring total clarity."' : '"The path remains veiled. Return to the scrolls and let the light guide you again."'}
          </p>

          <PerformanceGraph attempts={history} />

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <button 
              onClick={onClose}
              className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-widest hover:from-indigo-500 hover:to-purple-500 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3"
            >
              <RotateCcw className="w-5 h-5" /> Back to Sanctuary
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 rounded-[3rem] animate-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
      <div className="flex justify-between items-center mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs font-black text-indigo-300 tracking-[0.1em]">
            TRIAL {currentIdx + 1} / {quiz.questions.length}
          </div>
          <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
            currentQuestion.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            currentQuestion.difficulty === 'moderate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
            'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {currentQuestion.difficulty}
          </div>
        </div>
        <div className="flex items-center gap-2 text-indigo-400 font-black text-sm">
          <BarChart3 className="w-4 h-4" />
          POINTS: {score}
        </div>
      </div>

      <div className="mb-12 relative z-10">
        <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
          {currentQuestion.question}
        </h3>
      </div>

      <div className="grid gap-4 mb-12 relative z-10">
        {currentQuestion.options.map((option, idx) => {
          const isCorrect = idx === currentQuestion.correctOptionIndex;
          const isSelected = selectedOption === idx;
          
          let cardStyle = "bg-slate-900/40 border-slate-800 text-slate-300";
          if (showFeedback) {
            if (isCorrect) cardStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-200 scale-[1.02] z-20 shadow-xl shadow-emerald-500/10";
            else if (isSelected) cardStyle = "bg-rose-500/20 border-rose-500/50 text-rose-200 opacity-80";
            else cardStyle = "bg-slate-950/20 border-slate-900 text-slate-600 grayscale opacity-40";
          } else if (isSelected) {
            cardStyle = "bg-indigo-500/20 border-indigo-500/50 text-white shadow-xl shadow-indigo-500/10";
          }

          return (
            <button
              key={idx}
              disabled={showFeedback}
              onClick={() => handleOptionSelect(idx)}
              className={`w-full p-6 rounded-2xl border text-left transition-all flex items-center gap-6 ${cardStyle} ${!showFeedback && 'hover:bg-slate-800 hover:border-slate-700'}`}
            >
              <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 text-xs font-black transition-all ${
                isSelected ? 'border-current scale-110' : 'border-slate-700'
              }`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="font-semibold text-lg">{option}</span>
              {showFeedback && isCorrect && <CheckCircle2 className="ml-auto text-emerald-400 w-6 h-6 animate-in zoom-in" />}
              {showFeedback && isSelected && !isCorrect && <XCircle className="ml-auto text-rose-400 w-6 h-6 animate-in zoom-in" />}
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <div className="mb-12 p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 animate-in fade-in slide-in-from-top-4 duration-500 relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles className="w-12 h-12 text-amber-500" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">Oracle's Revelation</span>
          </div>
          <p className="text-slate-300 text-base italic leading-relaxed pl-4 border-l-2 border-amber-500/30">
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      <div className="flex justify-end relative z-10">
        {!showFeedback ? (
          <button
            onClick={handleConfirm}
            disabled={selectedOption === null}
            className="px-12 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm flex items-center gap-3 disabled:opacity-30 disabled:grayscale hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/30 transform hover:-translate-y-1 active:scale-95"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-12 py-5 bg-white text-slate-900 rounded-[1.5rem] font-black uppercase tracking-widest text-sm flex items-center gap-3 hover:bg-slate-100 transition-all shadow-2xl shadow-white/10 transform hover:-translate-y-1 active:scale-95"
          >
            {currentIdx + 1 === quiz.questions.length ? 'Final Verdict' : 'Next Trial'}
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;
