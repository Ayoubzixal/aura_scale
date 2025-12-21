
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { FacialNorms } from '../types';

interface RadarScoreChartProps {
  scores: FacialNorms;
}

const RadarScoreChart: React.FC<RadarScoreChartProps> = ({ scores }) => {
  const data = [
    { subject: 'Symmetry', A: scores.facialSymmetry },
    { subject: 'Skin', A: scores.skinHealth },
    { subject: 'Average', A: scores.averageness },
    { subject: 'Femininity', A: scores.sexualDimorphism },
    { subject: 'Neoteny', A: scores.neoteny },
    { subject: 'Golden', A: scores.goldenRatio },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#333" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
          <Radar
            name="Analysis"
            dataKey="A"
            stroke="#ffffff"
            fill="#ffffff"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarScoreChart;
