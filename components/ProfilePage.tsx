
import React, { useEffect, useState } from 'react';
import { User, QuizAttempt } from '../types';
import { authService } from '../services/authService';
import PerformanceGraph from './PerformanceGraph';
import { User as UserIcon, Mail, Calendar, ArrowLeft, History, Trophy } from 'lucide-react';

interface ProfilePageProps {
  user: User;
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onBack }) => {
  const [history, setHistory] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    setHistory(authService.getQuizAttempts());
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-black uppercase tracking-widest">Return to Library</span>
      </button>

      <div className="grid md:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="md:col-span-1">
          <div className="glass-card p-8 rounded-[2.5rem] text-center border-t-2 border-indigo-500/30">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
            <h2 className="oracle-title text-2xl text-white mb-1">{user.name}</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Master Scholar</p>
            
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>{history.length} Trials Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats and History */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <PerformanceGraph attempts={history} />
          </section>

          <section className="glass-card p-8 rounded-[2.5rem]">
            <div className="flex items-center gap-3 mb-6">
              <History className="text-indigo-400 w-5 h-5" />
              <h3 className="text-white font-bold uppercase tracking-widest text-sm">Chronicles of Wisdom</h3>
            </div>

            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-slate-500 text-sm italic py-10 text-center">No trials have been attempted yet.</p>
              ) : (
                history.slice().reverse().map(attempt => (
                  <div key={attempt.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                    <div>
                      <h4 className="text-slate-200 font-bold text-sm">{attempt.quizTitle || 'General Knowledge Trial'}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-slate-500 font-black uppercase">
                          {new Date(attempt.timestamp).toLocaleDateString()}
                        </span>
                        <span className={`text-[10px] font-black uppercase ${attempt.percentage >= 80 ? 'text-emerald-400' : attempt.percentage >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {attempt.percentage}% Mastery
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-indigo-400">{attempt.score}/{attempt.total}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
