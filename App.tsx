
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
  const [sources, setSources] = useState<Record<string, StudySource | null>>({
    syllabus: null,
    notes: null,
    textbook: null
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [guide, setGuide] = useState<StudyGuideResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const activeUser = authService.getCurrentUser();
    if (activeUser) setUser(activeUser);
  }, []);

  const handleUpload = (source: StudySource) => {
    setSources(prev => ({ ...prev, [source.id]: source }));
    setError(null);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setGuide(null);
    setSources({ syllabus: null, notes: null, textbook: null });
  };

  const activeSourcesCount = Object.values(sources).filter(Boolean).length;
  const isReady = activeSourcesCount >= 2;

  const handleConsultOracle = async () => {
    const uploadedSources = Object.values(sources).filter((s): s is StudySource => s !== null);
    
    setIsAnalyzing(true);
    setError(null);
    setGuide(null);

    try {
      const result = await generateStudyGuide(uploadedSources);
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
        <div className="flex items-center gap-3 bg-slate-900/40 px-4 py-2 rounded-full border border-slate-800">
          <UserIcon className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-200 text-sm font-medium">Greetings, {user.name}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4" />
          Leave Temple
        </button>
      </div>

      <OracleHeader />

      <main className="max-w-6xl mx-auto px-4">
        {!guide && !isAnalyzing && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <SourceUpload
                id="syllabus"
                label="Syllabus"
                description="The path of the course"
                source={sources.syllabus}
                onUpload={handleUpload}
              />
              <SourceUpload
                id="notes"
                label="Lecture Notes"
                description="Your personal scribbles"
                source={sources.notes}
                onUpload={handleUpload}
              />
              <SourceUpload
                id="textbook"
                label="Textbook/Chapter"
                description="The heavy foundation"
                source={sources.textbook}
                onUpload={handleUpload}
              />
            </div>

            <div className="text-center mb-16">
              <button
                onClick={handleConsultOracle}
                disabled={!isReady || isAnalyzing}
                className={`
                  px-12 py-6 rounded-[2rem] font-black text-2xl transition-all duration-500 flex items-center gap-4 mx-auto
                  ${isReady && !isAnalyzing
                    ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:shadow-[0_25px_60px_rgba(79,70,229,0.4)] transform hover:-translate-y-2 active:scale-95' 
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}
                `}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin w-8 h-8" />
                    Divining...
                  </>
                ) : (
                  <>
                    <Sparkles className={isReady ? "text-amber-300 animate-pulse w-8 h-8" : "w-8 h-8"} />
                    Summon Knowledge
                  </>
                )}
              </button>
              {!isReady && !isAnalyzing && (
                <p className="text-slate-500 text-sm mt-6 font-medium italic">
                  "Present at least two scrolls to begin the ritual of focus."
                </p>
              )}
            </div>
          </>
        )}

        {isAnalyzing && (
          <div className="max-w-md mx-auto text-center py-20 animate-pulse">
            <div className="w-32 h-32 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-indigo-500/20 relative shadow-2xl">
              <Loader2 className="w-16 h-16 text-indigo-400 animate-spin" />
              <div className="absolute inset-0 border-t-4 border-purple-500 rounded-full animate-ping opacity-20" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 italic oracle-title">Reading the Overlaps...</h2>
            <p className="text-slate-400 leading-relaxed text-lg">
              The Oracle is identifying the patterns within your scrolls. You're doing great, focus on your breath.
            </p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto p-8 rounded-[2rem] bg-rose-500/5 border border-rose-500/20 flex items-center gap-6 mb-12 animate-in slide-in-from-top-4">
            <div className="p-3 bg-rose-500/10 rounded-2xl">
              <AlertCircle className="text-rose-400 w-8 h-8 flex-shrink-0" />
            </div>
            <div>
              <h4 className="text-rose-200 font-bold mb-1">Ritual Interrupted</h4>
              <p className="text-rose-200/60 text-sm leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <div id="results-section">
          {guide && (
            <>
              <StudyGuide guide={guide} />
              <div className="mt-12 text-center pb-20">
                 <button 
                  onClick={() => {
                    setGuide(null);
                    setSources({ syllabus: null, notes: null, textbook: null });
                  }}
                  className="px-10 py-4 rounded-2xl border-2 border-slate-800 text-slate-500 hover:text-white hover:border-slate-600 transition-all text-xs font-black uppercase tracking-[0.3em] shadow-lg"
                >
                  Start New Session
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-purple-600/5 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
};

export default App;
