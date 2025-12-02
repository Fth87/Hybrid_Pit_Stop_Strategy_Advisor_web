// --- FIRST-ORDER LOGIC MODULE ---

export const validateRegulation = (
  historyTires: string[], 
  currentTire: string, 
  weatherCondition: string
): { valid: boolean; msg: string; iconType: "check" | "warn" | "rain" } => {
  
  const allTires = [...historyTires, currentTire];
  
  // 1. Cek Wet Condition (Article 30 FIA)
  // Jika ban basah (Inter/Wet) pernah digunakan ATAU cuaca hujan, 
  // aturan 2 compound berbeda gugur.
  const hasUsedWet = allTires.some(t => ['INTER', 'WET'].includes(t.toUpperCase()));
  const isRaining = weatherCondition === 'WET' || weatherCondition === 'RAIN';

  if (hasUsedWet || isRaining) {
    return {
      valid: true,
      msg: "WET RACE/TIRE: OPEN COMP",
      iconType: "rain"
    };
  }

  // 2. Cek Dry Condition
  // Harus menggunakan setidaknya 2 compound berbeda (Hard, Medium, Soft)
  const dryCompounds = allTires.filter(t => !['INTER', 'WET'].includes(t.toUpperCase()));
  const uniqueCompounds = new Set(dryCompounds);

  if (uniqueCompounds.size >= 2) {
    return {
      valid: true,
      msg: "REGULATION SATISFIED",
      iconType: "check"
    };
  } else {
    return {
      valid: false,
      msg: "MUST USE 2 DIFFERENT COMPOUNDS",
      iconType: "warn"
    };
  }
};