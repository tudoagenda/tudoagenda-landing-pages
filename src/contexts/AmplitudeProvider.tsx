import React, { createContext, useContext, useEffect } from 'react';
import * as amplitude from '@amplitude/analytics-browser';

type AmplitudeContextType = typeof amplitude | null;

const AmplitudeContext = createContext<AmplitudeContextType>(null);

export const AmplitudeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    amplitude.init('348d225df619e203f2984a37eb723124', { autocapture: true });
  }, []);

  return (
    <AmplitudeContext.Provider value={amplitude}>
      {children}
    </AmplitudeContext.Provider>
  );
};

export const useAmplitude = (): typeof amplitude => {
  const amplitudeInstance = useContext(AmplitudeContext);
  if (!amplitudeInstance) {
    throw new Error('useAmplitude must be used within an AmplitudeProvider');
  }
  return amplitudeInstance;
};
