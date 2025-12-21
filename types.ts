
export interface FacialNorms {
  facialSymmetry: number;
  skinHealth: number;
  averageness: number;
  sexualDimorphism: number;
  neoteny: number;
  goldenRatio: number;
}

export interface AnalysisJustification {
  facialSymmetry: string;
  skinHealth: string;
  averageness: string;
  sexualDimorphism: string;
  neoteny: string;
  goldenRatio: string;
}

export interface FaceAnalysis {
  id: string;
  name?: string;
  scores: FacialNorms;
  justifications: AnalysisJustification;
  overallScore: number;
  rank?: number;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  imageData: string;
  faces: FaceAnalysis[];
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
