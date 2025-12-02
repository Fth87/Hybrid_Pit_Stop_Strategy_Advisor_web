'use client';

import { useState, useEffect, useCallback } from 'react';
import { Circuit, WeatherData, WeatherIconType } from '@/types';

const initialWeatherData: WeatherData = {
  status: '--',
  desc: 'Syncing...',
  rainProb: '--%',
  isRaining: false,
  cloudCover: 10,
  iconType: 'sun',
};

export function useWeather(circuit: Circuit | null) {
  const [weather, setWeather] = useState<WeatherData>(initialWeatherData);

  const fetchWeatherData = useCallback(async () => {
    if (!circuit) return;

    setWeather((prev) => ({ ...prev, desc: 'FETCHING API...' }));

    try {
      const { lat, lon } = circuit;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&minutely_15=precipitation&current=cloud_cover,precipitation,precipitation_probability&timezone=auto`;
      const response = await fetch(url);
      const data = await response.json();

      const cloud = data.current.cloud_cover;
      const precipProb = data.current.precipitation_probability || 0;
      const precipNow = data.current.precipitation;

      const precipForecast = data.minutely_15 ? data.minutely_15.precipitation : [0, 0];
      const rainSoon = precipForecast[1] || 0;

      let raining = false;
      let status = 'DRY';
      let desc = 'SUNNY';
      let iconType: WeatherIconType = 'sun';
      let rainProb = `${precipProb}%`;

      if (precipNow > 0.1) {
        raining = true;
        status = 'WET';
        desc = `RAIN: ${precipNow}mm`;
        iconType = 'heavy';
        rainProb = '100%';
      } else if (rainSoon > 0.1) {
        raining = true;
        status = 'RAIN SOON';
        desc = 'PRECIPITATION < 15M';
        iconType = 'rain';
        rainProb = `${Math.max(precipProb, 80)}%`;
      } else if (cloud > 70) {
        status = 'OVERCAST';
        desc = `CLOUD COVER: ${cloud}%`;
        iconType = 'cloud';
      } else {
        status = 'DRY';
        desc = cloud < 30 ? 'SUNNY' : 'PARTLY CLOUDY';
        iconType = 'sun';
      }

      setWeather({
        status,
        desc,
        rainProb,
        isRaining: raining,
        cloudCover: cloud,
        iconType,
      });
    } catch (error) {
      console.error(error);
      setWeather({
        status: 'ERROR',
        desc: 'API ERROR (DEFAULT)',
        rainProb: '--%',
        isRaining: false,
        cloudCover: 10,
        iconType: 'sun',
      });
    }
  }, [circuit]);

  useEffect(() => {
    if (circuit) fetchWeatherData();
  }, [circuit, fetchWeatherData]);

  return { weather, fetchWeatherData, setCurrentTime: (time: string) => {} };
}
