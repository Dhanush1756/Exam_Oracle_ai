
import React, { useState, useEffect } from 'react';
import OracleHeader from './components/OracleHeader';
import SourceUpload from './components/SourceUpload';
import StudyGuide from './components/StudyGuide';
import { AuthForms } from './components/AuthForms';
import { StudySource, StudyGuideResponse, User } from './types';
import { generateStudyGuide } from './services/geminiService';
import { authService } from './services/authService';
import { Sparkles, Loader2, AlertCircle, LogOut, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sources, setSources] = useState<Record<'syllabus' | 'notes' | 'textbook', StudySource[]>>({
    syllabus: [],
    notes: [],
    textbook: []
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [guide, setGuide] = useState<StudyGuideResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const activeUser = authService.getCurrentUser();
    if (activeUser) setUser(activeUser);
  }, []);

  const handleAddSource = (source: StudySource) => {
    setSources(prev => ({
      ...prev,
      [source.category]: [...prev[source.category], source]
    }));
    setError(null);
  };

  const handleRemoveSource = (category: 'syllabus' | 'notes' | 'textbook', id: string) => {
    setSources(prev => ({
      ...prev,
      [category]: prev[category].filter(s => s.id !== id)
    }));
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setGuide(null);
    setSources({ syllabus: [], notes: [], textbook: [] });
  };

  const categoriesWithSources = Object.values(sources).filter(list => list.length > 0).length;
  const isReady = categoriesWithSources >= 2;

  const handleConsultOracle = async () => {
    const allSources = [...sources.syllabus, ...sources.notes, ...sources.textbook];
    
    setIsAnalyzing(true);
    setError(null);
    setGuide(null);

    try {
      const result = await generateStudyGuide(allSources);
      setGuide(result);
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "The celestial connection was interrupted. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pb-20 selection:bg-purple-500/30">
        <OracleHeader />
        <AuthForms onAuthSuccess={setUser} />
        <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
          <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 selection:bg-purple-500/30">
      <div className="max-w-6xl mx-auto px-4 pt-6 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-3 bg-slate-900/40 px-4 py-2 rounded-full border border-slate-800 backdrop-blur-md">
          <UserIcon className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-200 text-sm font-medium">Greetings, {user.name}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-xs font-black uppercase tracking-[0.2em]"
        >
          <LogOut className="w-4 h-4" />
          Leave Temple
        </button>
      </div>

      <OracleHeader />

      <main className="max-w-6xl mx-auto px-4">
        {!guide && !isAnalyzing && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-16 items-stretch">
              <SourceUpload
                category="syllabus"
                label="Syllabus"
                description="The path mapped out"
                sources={sources.syllabus}
                onAdd={handleAddSource}
                onRemove={(id) => handleRemoveSource('syllabus', id)}
              />
              <SourceUpload
                category="notes"
                label="Lecture Notes"
                description="Your personal scribbles"
                sources={sources.notes}
                onAdd={handleAddSource}
                onRemove={(id) => handleRemoveSource('notes', id)}
              />
              <SourceUpload
                category="textbook"
                label="Textbook/Chapters"
                description="The foundations of truth"
                sources={sources.textbook}
                onAdd={handleAddSource}
                onRemove={(id) => handleRemoveSource('textbook', id)}
              />
            </div>

            <div className="text-center mb-16">
              <button
                onClick={handleConsultOracle}
                disabled={!isReady || isAnalyzing}
                className={`
                  px-14 py-7 rounded-[2.5rem] font-black text-2xl transition-all duration-500 flex items-center gap-4 mx-auto
                  ${isReady && !isAnalyzing
                    ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-[0_20px_50px_rgba(79,70,229,0.4)] hover:shadow-[0_25px_60px_rgba(79,70,229,0.5)] transform hover:-translate-y-2 active:scale-95' 
                    : 'bg-slate-900/50 text-slate-600 cursor-not-allowed border border-slate-800'}
                `}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin w-8 h-8" />
                    Divining...
                  </>
                ) : (
                  <>
                    <Sparkles className={isReady ? "text-amber-300 animate-pulse w-8 h-8" : "w-8 h-8 opacity-20"} />
                    Summon Knowledge
                  </>
                )}
              </button>
              {!isReady && !isAnalyzing && (
                <p className="text-slate-500 text-xs mt-8 font-black uppercase tracking-[0.3em] opacity-60">
                  "Upload from at least two categories to begin the ritual."
                </p>
              )}
            </div>
          </>
        )}

        {isAnalyzing && (
          <div className="max-w-md mx-auto text-center py-24 animate-in zoom-in duration-500">
            <div className="w-36 h-36 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-indigo-500/20 relative shadow-[0_0_100px_rgba(99,102,241,0.1)]">
              <Loader2 className="w-16 h-16 text-indigo-400 animate-spin" />
              <div className="absolute inset-0 border-t-4 border-purple-500 rounded-full animate-ping opacity-10" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 italic oracle-title tracking-widest">Sifting Through the Scrolls...</h2>
            <p className="text-slate-400 leading-relaxed text-lg font-light">
              The Oracle is correlating your documents. Just breathe, your mastery is approaching.
            </p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto p-8 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/20 flex items-center gap-6 mb-12 animate-in slide-in-from-top-4">
            <div className="p-4 bg-rose-500/10 rounded-2xl">
              <AlertCircle className="text-rose-400 w-8 h-8 flex-shrink-0" />
            </div>
            <div>
              <h4 className="text-rose-200 font-black uppercase tracking-widest text-sm mb-1">Ritual Interrupted</h4>
              <p className="text-rose-200/60 text-sm leading-relaxed font-medium">{error}</p>
            </div>
          </div>
        )}

        <div id="results-section">
          {guide && (
            <>
              <StudyGuide 
                guide={guide} 
                sources={[...sources.syllabus, ...sources.notes, ...sources.textbook]} 
              />
              <div className="mt-16 text-center pb-24">
                 <button 
                  onClick={() => {
                    setGuide(null);
                    setSources({ syllabus: [], notes: [], textbook: [] });
                  }}
                  className="px-12 py-5 rounded-[2rem] border-2 border-slate-800 text-slate-500 hover:text-white hover:border-slate-600 transition-all text-xs font-black uppercase tracking-[0.4em] shadow-xl hover:shadow-white/5"
                >
                  Start New Session
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[30rem] h-[30rem] bg-indigo-600/[0.03] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[5%] right-[2%] w-[40rem] h-[40rem] bg-purple-600/[0.03] rounded-full blur-[150px]"></div>
      </div>
    </div>
  );
};

export default App;
