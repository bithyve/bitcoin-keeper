import React, { createContext, useEffect, useMemo, useState } from 'react';
import RestClient, { TorStatus } from 'src/core/services/rest/RestClient';
import useOrbot from 'src/hooks/useOrbot';
import { useDispatch } from 'react-redux';
import { setTorEnabled } from '../reducers/settings';

export const TorContext = createContext(null);

export function TorContextProvider({ children }: any) {
  const { globalTorStatus, openOrbotApp } = useOrbot(true);
  const [torStatus, setTorStatus] = useState<TorStatus>(globalTorStatus);
  const [orbotTorStatus, setOrbotTorStatus] = useState(TorStatus.OFF);
  const [inAppTor, setInAppTor] = useState<TorStatus>(RestClient.getTorStatus());

  const dispatch = useDispatch();

  const onChangeTorStatus = (status: TorStatus) => {
    setInAppTor(status);
    dispatch(setTorEnabled(status === TorStatus.CONNECTED));
  };

  useEffect(() => {
    RestClient.subToTorStatus(onChangeTorStatus);
    return () => {
      RestClient.unsubscribe(onChangeTorStatus);
    };
  }, []);

  useEffect(() => {
    console.log(inAppTor, globalTorStatus);
    if (inAppTor === TorStatus.CONNECTING || orbotTorStatus === TorStatus.CHECKING) {
      setTorStatus(inAppTor === TorStatus.CONNECTING ? inAppTor : orbotTorStatus);
    }
    if (!(inAppTor === TorStatus.CONNECTED) && globalTorStatus === TorStatus.CONNECTED) {
      setOrbotTorStatus(TorStatus.CONNECTED);
      setTorStatus(TorStatus.CONNECTED);
    }
    if (!(inAppTor === TorStatus.CONNECTED) && !(globalTorStatus === TorStatus.CONNECTED)) {
      setOrbotTorStatus(TorStatus.OFF);
      setTorStatus(TorStatus.OFF);
    }
    if (inAppTor === TorStatus.CONNECTED && globalTorStatus === TorStatus.CONNECTED) {
      setOrbotTorStatus(TorStatus.OFF);
      setTorStatus(TorStatus.CONNECTED);
    }
  }, [globalTorStatus, inAppTor]);

  const value = useMemo(
    () => ({
      torStatus,
      orbotTorStatus,
      inAppTor,
      setTorStatus,
      setInAppTor,
      openOrbotApp,
      setOrbotTorStatus,
    }),
    [torStatus, orbotTorStatus, inAppTor, orbotTorStatus]
  );

  return <TorContext.Provider value={value}>{children}</TorContext.Provider>;
}
