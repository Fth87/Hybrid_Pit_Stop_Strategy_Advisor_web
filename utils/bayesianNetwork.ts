// --- BAYESIAN NETWORK MODULE ---

// CPT sesuai Notebook Cell 8
const CPT: Record<string, number> = {
  "0,0,0": 0.1, "0,0,1": 0.3, "0,0,2": 0.5,
  "0,1,0": 0.4, "0,1,1": 0.6, "0,1,2": 0.8,
  "1,0,0": 0.3, "1,0,1": 0.5, "1,0,2": 0.7,
  "1,1,0": 0.7, "1,1,1": 0.8, "1,1,2": 0.9,
};

export const calculateSCRisk = (
  trackType: string, // 'Permanent' | 'Street'
  weather: string,   // 'Dry' | 'Wet'
  scHistory: string  // 'Low' | 'Medium' | 'High'
): number => {
  // Mapping input string ke integer (0/1/2) sesuai logic notebook
  const trek = trackType === 'Street' ? 1 : 0;
  const cuaca = weather === 'WET' || weather === 'RAIN' ? 1 : 0;
  
  let histori = 1; // Default Medium
  if (scHistory === 'Low') histori = 0;
  else if (scHistory === 'High') histori = 2;

  const key = `${trek},${cuaca},${histori}`;
  return CPT[key] || 0.5; // Default fallback
};