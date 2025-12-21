
import React, { useState, useEffect, useCallback } from 'react';
import { analyzeFaces } from './services/geminiService';
import { AnalysisResult, AnalysisStatus, FaceAnalysis } from './types';
import { fileToBase64, generateHash, saveToHistory, getCachedResult, getHistory } from './utils/helpers';
import FaceDetailCard from './components/FaceDetailCard';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setStatus(AnalysisStatus.LOADING);
      setError(null);
      const base64 = await fileToBase64(file);
      const hash = await generateHash(base64);

      // Stability Check: If we already analyzed this image, use cached result
      const cached = getCachedResult(hash);
      if (cached) {
        setResult(cached);
        setStatus(AnalysisStatus.SUCCESS);
        return;
      }

      const faces = await analyzeFaces(base64);
      
      const newResult: AnalysisResult = {
        id: hash,
        timestamp: Date.now(),
        imageData: base64,
        faces: faces.sort((a, b) => b.overallScore - a.overallScore),
      };

      setResult(newResult);
      saveToHistory(newResult);
      setHistory(getHistory());
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during analysis.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const clearResults = () => {
    setResult(null);
    setStatus(AnalysisStatus.IDLE);
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center glass border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-black"></div>
          </div>
          <span className="text-xl font-bold tracking-tighter">AURASCALE</span>
        </div>
        <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest text-white/50">
          <a href="#" className="hover:text-white transition-colors">Norms</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Scientific Basis</a>
        </div>
      </nav>

      <main className="container mx-auto px-6 pt-32">
        {status === AnalysisStatus.IDLE && (
          <div className="max-w-4xl mx-auto text-center space-y-12 py-12">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-serif leading-none tracking-tight">
                Beauty is <br />
                <span className="gradient-text italic">Quantifiable.</span>
              </h1>
              <p className="text-lg text-white/40 max-w-xl mx-auto leading-relaxed">
                Using evolutionary biological frameworks and geometric precision, 
                our AI decodes facial aesthetics through symmetry, skin health, and koinophilia.
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <label className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-semibold cursor-pointer hover:bg-white/90 transition-all active:scale-95 shadow-xl shadow-white/5">
                <span>Start Analysis</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">Supports JPEG, PNG, WEBP (Female Faces Only)</p>
            </div>

            {/* Norm Cards Preview */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-12">
              {[
                { label: 'Symmetry', desc: 'Left-Right Correlation' },
                { label: 'Neoteny', desc: 'Youthful Markers' },
                { label: 'Skin Health', desc: 'Homogeneity & Clarity' },
                { label: 'Dimorphism', desc: 'Feminine Evolution' },
                { label: 'Golden Ratio', desc: 'Harmonic Proportions' },
                { label: 'Koinophilia', desc: 'Population Averageness' }
              ].map(norm => (
                <div key={norm.label} className="glass p-6 rounded-2xl text-left">
                  <div className="text-white text-sm font-medium mb-1">{norm.label}</div>
                  <div className="text-white/30 text-[10px] uppercase tracking-wider">{norm.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === AnalysisStatus.LOADING && (
          <div className="max-w-xl mx-auto text-center space-y-8 py-24">
            <div className="relative inline-block">
              <div className="w-32 h-32 border-2 border-white/5 rounded-full animate-ping absolute inset-0"></div>
              <div className="w-32 h-32 border border-white/20 rounded-full flex items-center justify-center relative bg-black">
                <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif italic text-white/90">Analyzing Biological Markers</h2>
              <p className="text-sm text-white/40 animate-pulse">Scanning proportions, skin homogeneity, and symmetry paths...</p>
            </div>
          </div>
        )}

        {status === AnalysisStatus.ERROR && (
          <div className="max-w-xl mx-auto glass border-red-900/50 p-8 rounded-3xl text-center space-y-6">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <p className="text-white/80">{error}</p>
            <button onClick={clearResults} className="px-6 py-3 border border-white/10 rounded-full text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all">Try Again</button>
          </div>
        )}

        {status === AnalysisStatus.SUCCESS && result && (
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              <div className="md:w-1/2 sticky top-32">
                 <div className="glass rounded-[2rem] overflow-hidden p-2">
                   <img src={result.imageData} alt="Analysis Source" className="w-full h-auto rounded-[1.8rem]" />
                 </div>
                 <div className="mt-8 flex justify-between items-end">
                    <div>
                      <h2 className="text-3xl font-serif">Deep Analysis</h2>
                      <p className="text-white/40 text-sm mt-1">{result.faces.length} face{result.faces.length !== 1 ? 's' : ''} detected & ranked</p>
                    </div>
                    <button 
                      onClick={clearResults} 
                      className="px-6 py-3 glass rounded-full text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                    >
                      New Scan
                    </button>
                 </div>
              </div>

              <div className="md:w-1/2">
                {result.faces.length === 0 ? (
                  <div className="glass p-12 text-center rounded-3xl text-white/50">
                    No compatible biological markers detected. Ensure the image features clear female facial profiles.
                  </div>
                ) : (
                  result.faces.map((face) => (
                    <FaceDetailCard key={face.id} face={face} />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && status === AnalysisStatus.IDLE && (
          <div className="mt-24 pt-12 border-t border-white/5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/20 mb-8 text-center">Previous Sessions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {history.map((item, idx) => (
                <div 
                  key={idx} 
                  className="glass group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer hover:border-white/20 transition-all"
                  onClick={() => {
                    setResult(item);
                    setStatus(AnalysisStatus.SUCCESS);
                  }}
                >
                  <img src={item.imageData} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                    <div className="text-left">
                      <div className="text-xs text-white/50">{new Date(item.timestamp).toLocaleDateString()}</div>
                      <div className="text-sm font-serif">{item.faces[0]?.overallScore.toFixed(1)} Avg</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-32 border-t border-white/5 py-12 text-center">
        <p className="text-xs text-white/20 uppercase tracking-[0.4em]">AuraScale &copy; 2024 — Evolutionary Aesthetic Engine</p>
      </footer>
    </div>
  );
};

export default App;
