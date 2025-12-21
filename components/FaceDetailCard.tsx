
import React from 'react';
import { FaceAnalysis } from '../types';
import RadarScoreChart from './RadarScoreChart';

interface FaceDetailCardProps {
  face: FaceAnalysis;
}

const FaceDetailCard: React.FC<FaceDetailCardProps> = ({ face }) => {
  const metrics = [
    { key: 'facialSymmetry', label: 'Facial Symmetry', score: face.scores.facialSymmetry, justification: face.justifications.facialSymmetry },
    { key: 'skinHealth', label: 'Skin Health', score: face.scores.skinHealth, justification: face.justifications.skinHealth },
    { key: 'averageness', label: 'Averageness', score: face.scores.averageness, justification: face.justifications.averageness },
    { key: 'sexualDimorphism', label: 'Femininity', score: face.scores.sexualDimorphism, justification: face.justifications.sexualDimorphism },
    { key: 'neoteny', label: 'Neoteny', score: face.scores.neoteny, justification: face.justifications.neoteny },
    { key: 'goldenRatio', label: 'Golden Ratio', score: face.scores.goldenRatio, justification: face.justifications.goldenRatio },
  ];

  return (
    <div className="glass rounded-2xl overflow-hidden p-6 mb-8 border-l-4 border-l-white/20">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              {face.name || `Subject ${face.rank}`}
            </h3>
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono text-white/70">
              Rank #{face.rank}
            </span>
          </div>
          
          <div className="relative mb-6">
            <div className="text-6xl font-serif font-bold gradient-text">{face.overallScore.toFixed(1)}</div>
            <div className="text-xs uppercase tracking-widest text-white/40 mt-1">Aesthetic Quotient</div>
          </div>

          <RadarScoreChart scores={face.scores} />
        </div>

        <div className="md:w-2/3">
          <h4 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-6">Normative Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics.map((m) => (
              <div key={m.key} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/80 font-medium">{m.label}</span>
                  <span className="text-white font-mono">{m.score}/10</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white/40 rounded-full transition-all duration-1000" 
                    style={{ width: `${m.score * 10}%` }}
                  />
                </div>
                <p className="text-xs text-white/50 leading-relaxed italic">
                  {m.justification}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceDetailCard;
