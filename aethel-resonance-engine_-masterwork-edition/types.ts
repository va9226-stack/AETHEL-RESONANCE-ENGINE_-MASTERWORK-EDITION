
export interface WitInput {
  data: string;
  context?: string;
}

export type Modality = 'perfect' | 'stable' | 'volatile' | 'void';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AuthVoid {
  integrity: number;
  modality: Modality;
  resonanceScore: number;
  insight: string;
  logicCheck: string;
  thinkingProcess?: string;
  visualPrompt: string;
  imageUrl?: string;
  audioData?: string; // Base64 encoded PCM
  sources?: GroundingSource[];
}

export interface ResonanceResult {
  x: WitInput;
  y: WitInput;
  authVoid: AuthVoid;
  timestamp: number;
}
