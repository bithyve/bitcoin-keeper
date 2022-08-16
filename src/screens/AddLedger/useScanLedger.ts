import { Observable, Subscription } from 'rxjs';
import { PermissionsAndroid, Platform } from 'react-native';
import { useEffect, useRef, useState } from 'react';

import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';

const useScanLedger = () => {
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const subscribed = useRef<Subscription>();

  const hasBLEPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const status = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
        );
        console.log(status);
        if (status === 'granted') return true;
        return false;
      } catch (e) {
        console.log(e);
      }
    } else {
      return true;
    }
  };

  const scanLedger = async () => {
    if (await hasBLEPermission()) {
      startScan();
    } else {
      console.log('No BLE permission!');
    }
  };

  useEffect(() => {
    scanLedger();
    return () => {
      console.log('Ledger scanning done!');
      if (subscribed.current) subscribed.current.unsubscribe();
    };
  }, []);

  const reload = async () => {
    if (subscribed.current) subscribed.current.unsubscribe();
    setDevices([]);
    setError(null);
    setScanning(false);
    startScan();
  };

  const onScanningComplete = () => {
    setScanning(false);
  };

  const nextCallback = (event: any) => {
    if (event.type === 'add') {
      const device = event.descriptor;
      if (device.name.includes('Nano X')) {
        console.log('Found Nano X!');
        setScanning(false);
        subscribed.current.unsubscribe();
      }
      setDevices(devices.some((i) => i.id === device.id) ? devices : devices.concat(device));
    }
  };

  const onError = (error) => {
    setError(error);
    onScanningComplete();
  };

  const startScan = async () => {
    setScanning(true);
    subscribed.current = new Observable(TransportBLE.listen).subscribe({
      complete: onScanningComplete,
      next: nextCallback,
      error: onError,
    });
  };

  return { error, devices, scanning, reload };
};

export default useScanLedger;
