import React, { createContext, useState } from 'react';

interface IAppContext {
  appLoading: boolean;
  setAppLoading: any;
  loadingContent: any;
  setLoadingContent: any;
}
export const AppContext = createContext<IAppContext>(null);

export function AppContextProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [loadingContent, setLoadingContent] = useState({
    title: '',
    subtitle: '',
    message: '',
  });

  return (
    <AppContext.Provider
      value={{
        appLoading: loading,
        setAppLoading: setLoading,
        loadingContent,
        setLoadingContent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
