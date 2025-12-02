// --- TYPES ---
export type TrackType = 'Street' | 'Permanent';
export type SCRisk = 'High' | 'Medium' | 'Low';
export type Compound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTER' | 'WET';
export type WeatherIconType = 'sun' | 'cloud' | 'rain' | 'heavy';

export interface Circuit {
  country: string;
  venue: string;
  lat: number;
  lon: number;
  type: TrackType;
  sc_risk: SCRisk;
}

export interface StrategyLogItem {
  time: string;
  compound: Compound;
  laps: number;
  decision: string;
  styleClass: string;
}

export interface WeatherData {
  status: string;
  desc: string;
  rainProb: string;
  isRaining: boolean;
  cloudCover: number;
  iconType: WeatherIconType;
}

export interface StrategyDecisionData {
  decision: string;
  reason: string;
  styleClass: string;
  urgencyScore: number;
  scProb: number;
  regStatus: string;
  regIconType: 'check' | 'warn' | 'rain';
}
