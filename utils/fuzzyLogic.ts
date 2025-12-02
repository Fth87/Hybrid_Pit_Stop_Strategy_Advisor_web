// --- FUZZY LOGIC MODULE (Replikasi skfuzzy) ---

// 1. Fungsi Keanggotaan (Membership Functions)
// Segitiga
const trimf = (x: number, params: [number, number, number]): number => {
  const [a, b, c] = params;
  if (x <= a || x >= c) return 0;
  if (x === b) return 1;
  if (x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
};

// Trapesium
const trapmf = (x: number, params: [number, number, number, number]): number => {
  const [a, b, c, d] = params;
  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x < b) return (x - a) / (b - a);
  return (d - x) / (d - c);
};

// 2. Universe & Membership Definitions (Sesuai Notebook Cell 4)
export const calculateFuzzyUrgency = (tireAge: number, compoundVal: number, weatherCloud: number): number => {
  
  // --- FUZZIFICATION ---
  
  // Umur Ban (0-60)
  const u_ban = {
    baru: trimf(tireAge, [0, 0, 10]),
    awal: trimf(tireAge, [5, 15, 25]),
    tengah: trimf(tireAge, [20, 30, 40]),
    akhir: trimf(tireAge, [35, 45, 55]),
    kritis: trapmf(tireAge, [50, 55, 60, 60]),
  };

  // Compound (0-10) - Hard(3), Med(5), Soft(7), Wet(10)
  const u_comp = {
    hard: trapmf(compoundVal, [0, 0, 2, 4]),
    medium: trimf(compoundVal, [2, 5, 8]),
    soft: trimf(compoundVal, [6, 8, 9]),
    wet: trapmf(compoundVal, [8, 9, 10, 10]),
  };

  // Cuaca (0-100) - Cloud cover / Rain prob
  const u_weather = {
    cerah: trapmf(weatherCloud, [0, 0, 20, 40]),
    mendung: trimf(weatherCloud, [30, 50, 70]),
    hujan: trapmf(weatherCloud, [60, 80, 100, 100]),
  };

  // --- RULE EVALUATION (Sesuai Notebook Cell 5) ---
  // Menggunakan metode Mamdani (Min untuk AND, Max untuk Agregasi)
  
  const rules = [];

  // Rule 1: Ban kritis -> urgensi sangat tinggi
  rules.push({ strength: u_ban.kritis, output: 'sangat_tinggi' });
  
  // Rule 2: Ban akhir -> urgensi tinggi
  rules.push({ strength: u_ban.akhir, output: 'tinggi' });
  
  // Rule 3: Ban tengah -> urgensi sedang
  rules.push({ strength: u_ban.tengah, output: 'sedang' });
  
  // Rule 4: Ban awal -> urgensi rendah
  rules.push({ strength: u_ban.awal, output: 'rendah' });
  
  // Rule 5: Ban baru -> urgensi sangat rendah
  rules.push({ strength: u_ban.baru, output: 'sangat_rendah' });
  
  // Rule 6: Hujan & Ban Slick (Hard/Med/Soft) -> Sangat Tinggi
  const isSlick = Math.max(u_comp.hard, u_comp.medium, u_comp.soft);
  const rule6Strength = Math.min(u_weather.hujan, isSlick);
  rules.push({ strength: rule6Strength, output: 'sangat_tinggi' });

  // Rule 7: Cerah & Ban Wet -> Sangat Tinggi
  const rule7Strength = Math.min(u_weather.cerah, u_comp.wet);
  rules.push({ strength: rule7Strength, output: 'sangat_tinggi' });

  // --- AGGREGATION ---
  // Mencari nilai max untuk setiap output linguistic
  const outputs = {
    sangat_rendah: 0,
    rendah: 0,
    sedang: 0,
    tinggi: 0,
    sangat_tinggi: 0,
  };

  rules.forEach(r => {
    // @ts-ignore
    if (r.strength > outputs[r.output]) {
       // @ts-ignore
      outputs[r.output] = r.strength;
    }
  });

  // --- DEFUZZIFICATION (Centroid Method) ---
  // Kita melakukan sampling discrete pada universe output (0-10)
  // Output MF definitions (Sesuai Notebook Cell 4)
  let numerator = 0;
  let denominator = 0;
  
  // Sampling setiap 0.5 point
  for (let x = 0; x <= 10; x += 0.5) {
    // Hitung membership function untuk setiap himpunan output pada titik x
    const mu_sr = trimf(x, [0, 0, 3]);
    const mu_r = trimf(x, [2, 4, 6]);
    const mu_s = trimf(x, [5, 7, 9]);
    const mu_t = trimf(x, [8, 9, 10]);
    const mu_st = trimf(x, [9, 10, 10]);

    // Potong (Clip) membership dengan kekuatan rule (Aggregate)
    const val_sr = Math.min(mu_sr, outputs.sangat_rendah);
    const val_r = Math.min(mu_r, outputs.rendah);
    const val_s = Math.min(mu_s, outputs.sedang);
    const val_t = Math.min(mu_t, outputs.tinggi);
    const val_st = Math.min(mu_st, outputs.sangat_tinggi);

    // Union (Max) dari semua himpunan terpotong
    const max_val = Math.max(val_sr, val_r, val_s, val_t, val_st);

    numerator += x * max_val;
    denominator += max_val;
  }

  if (denominator === 0) return 0;
  return numerator / denominator;
};