import { Observable, Subscription } from 'rxjs';
import { PermissionStatus, PermissionsAndroid, Platform } from 'react-native';
import { useEffect, useRef, useState } from 'react';

import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';

const useScanLedger = () => {
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const subscribed = useRef<Subscription>();

  const hasBLEPermission = () => {
    return Platform.select({
      ios: () => true,
      android: () => {
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)
          .then((status: PermissionStatus) => {
            if (status === 'granted') return true;
            return false;
          })
          .catch(console.log);
      },
    });
  };

  useEffect(() => {
    // NB: this is the bare minimal. We recommend to implement a screen to explain to user.
    if (hasBLEPermission()) {
      select();
    } else {
      console.log('No BLE permission!');
    }
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
      setDevices(devices.some((i) => i.id === device.id) ? devices : devices.concat(device));
    } // NB there is no "remove" case in BLE.
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

  const select = () => {
    let previousAvailable = false;
    new Observable(TransportBLE.observeState).subscribe((e: any) => {
      if (e.available !== previousAvailable) {
        previousAvailable = e.available;
        if (e.available) {
          reload();
        }
      }
    });
    startScan();
  };

  return { error, devices, scanning, reload };
};

export default useScanLedger;
