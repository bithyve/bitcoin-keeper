import { useEffect, useRef } from 'react';

const DEFAULT_CONFIG = {
  timeout: 0,
  ignoreInitialCall: true,
};
export function useDebouncedEffect(callback, config, deps = []) {
  let currentConfig;
  if (typeof config === 'object') {
    currentConfig = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  } else {
    currentConfig = {
      ...DEFAULT_CONFIG,
      timeout: config,
    };
  }
  const { timeout, ignoreInitialCall } = currentConfig;
  const data = useRef({ firstTime: true, clearFunc: null });

  useEffect(() => {
    const { firstTime, clearFunc } = data.current;

    if (firstTime && ignoreInitialCall) {
      data.current.firstTime = false;
      return;
    }

    const handler = setTimeout(() => {
      if (clearFunc && typeof clearFunc === 'function') {
        clearFunc();
      }
      data.current.clearFunc = callback();
    }, timeout);

    return () => {
      clearTimeout(handler);
    };
  }, [timeout, ...deps]);
}

export default useDebouncedEffect;
