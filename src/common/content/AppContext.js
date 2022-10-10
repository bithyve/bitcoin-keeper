import React, { createContext, useState } from 'react'

export const AppContext = createContext(
)

export const AppContextProvider = ({ children }) => {
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
        loadingContent: loadingContent,
        setLoadingContent: setLoadingContent,
      }}>
      {children}
    </AppContext.Provider>
  )
}
