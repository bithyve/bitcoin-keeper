import React, { createContext, useState } from 'react'

export const AppContext = createContext(
)

export function AppContextProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [loadingContent, setLoadingContent] = useState({
    title: '',
    subtitle: '',
    message: ''
  })

  return (
    <AppContext.Provider
      value={{
        appLoading: loading,
        setAppLoading: setLoading,
        loadingContent,
        setLoadingContent,
      }}>
      {children}
    </AppContext.Provider>
  )
}
