import React, { createContext, useState } from 'react'

export const AppContext = createContext(
)

export const AppContextProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <AppContext.Provider
      value={{
        appLoading: loading,
        setAppLoading: setLoading
      }}>
      {children}
    </AppContext.Provider>
  )
}
