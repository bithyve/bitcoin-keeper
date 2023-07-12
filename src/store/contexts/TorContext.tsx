import React, { createContext, useEffect, useState } from 'react';
import RestClient, { TorStatus } from 'src/core/services/rest/RestClient';

export const TorContext = createContext(null);

export function TorContextProvider({ children }) {
  const [torStatus, setTorStatus] = useState(RestClient.getTorStatus());
  const [orbotTorStatus, setOrbotTorStatus] = useState(TorStatus.OFF);
  const [inAppTor, setInAppTor] = useState(TorStatus.OFF);

  const onChangeTorStatus = (status: TorStatus) => {
    setTorStatus(status);
  };

  useEffect(() => {
    RestClient.subToTorStatus(onChangeTorStatus);
    return () => {
      RestClient.unsubscribe(onChangeTorStatus);
    };
  }, []);

  return (
    <TorContext.Provider
      value={{ torStatus, setTorStatus, orbotTorStatus, setOrbotTorStatus, inAppTor, setInAppTor }}
    >
      {children}
    </TorContext.Provider>
  );
}
