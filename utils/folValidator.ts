// --- FIRST-ORDER LOGIC MODULE ---

export const validateRegulation = (historyTires: string[], currentTire: string, weatherCondition: string): { valid: boolean; msg: string; iconType: 'check' | 'warn' | 'rain' } => {
  const allTires = [...historyTires, currentTire];

  // Cek apakah ada compound yang digunakan lebih dari sekali (duplikat)
  const uniqueCompounds = new Set(allTires);
  const hasDuplicates = allTires.length !== uniqueCompounds.size;

  // Cek Wet Condition
  const hasUsedWet = allTires.some((t) => ['INTER', 'WET'].includes(t.toUpperCase()));
  const isRaining = weatherCondition === 'WET' || weatherCondition === 'RAIN';

  // 1. Wet Race Condition (Article 30 FIA)
  // Jika cuaca hujan: harus pakai wet/inter, minimal 2 compound berbeda, tidak boleh duplikat
  if (isRaining) {
    // Dalam kondisi hujan, WAJIB pakai ban wet/inter
    if (!hasUsedWet) {
      return {
        valid: false,
        msg: 'WET RACE: MUST USE WET/INTER',
        iconType: 'warn',
      };
    }

    // Cek duplikat
    if (hasDuplicates) {
      return {
        valid: false,
        msg: 'DUPLICATE COMPOUND USED',
        iconType: 'warn',
      };
    }

    // Cek minimal 2 compound berbeda
    if (uniqueCompounds.size < 2) {
      return {
        valid: false,
        msg: 'MUST USE 2 DIFFERENT COMPOUNDS',
        iconType: 'warn',
      };
    }

    return {
      valid: true,
      msg: 'WET RACE: REGULATION OK',
      iconType: 'rain',
    };
  }

  // 2. Dry Race Condition
  // Harus menggunakan setidaknya 2 compound berbeda (Hard, Medium, Soft)
  // dan semua compound yang digunakan harus berbeda (tidak boleh ada duplikat)
  const dryCompounds = allTires.filter((t) => !['INTER', 'WET'].includes(t.toUpperCase()));
  const uniqueDryCompounds = new Set(dryCompounds);
  const hasDryDuplicates = dryCompounds.length !== uniqueDryCompounds.size;

  if (hasDryDuplicates) {
    return {
      valid: false,
      msg: 'DUPLICATE COMPOUND USED',
      iconType: 'warn',
    };
  } else if (uniqueDryCompounds.size < 2) {
    return {
      valid: false,
      msg: 'MUST USE 2 DIFFERENT COMPOUNDS',
      iconType: 'warn',
    };
  } else {
    return {
      valid: true,
      msg: 'REGULATION SATISFIED',
      iconType: 'check',
    };
  }
};
