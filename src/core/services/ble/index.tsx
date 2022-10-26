import React, { useState } from 'react';

import { BleManager } from 'react-native-ble-plx';

export const useBleDevices = (deviceName: string = '') => {
  const manager = new BleManager();
  const [devices, setDevices] = useState([]);

  const scanAndConnect = () => {
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
        // scanning will be stopped automatically
        return;
      }
      setDevices([...devices, device]);

      // stopDeviceScan criteria.
      if (device.name === deviceName) {
        // Stop scanning as it's not necessary if you are scanning for one device.
        manager.stopDeviceScan();
      }
    });
  };

  React.useEffect(() => {
    const subscription = manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        scanAndConnect();
        subscription.remove();
      }
    }, true);
    return () => subscription.remove();
  }, [manager]);

  return { devices };
};
