export interface Stereo70 {
  x: number; // Easting
  y: number; // Northing
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  stereo70?: Stereo70;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface LocationAnalysis {
  description: string;
  sources: GroundingChunk[];
}

export interface AppError {
  message: string;
  code?: string;
}

export enum LocationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}