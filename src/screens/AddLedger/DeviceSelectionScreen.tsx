import {
  FlatList,
  PermissionStatus,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Observable, Subscription } from 'rxjs';
import React, { Fragment, useEffect, useRef, useState } from 'react';

import DeviceItem from './DeviceItem';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';

const DeviceSelectionScreen = ({ onSelectDevice }) => {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const subscribed = useRef<Subscription>();

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

  useEffect(() => {
    // NB: this is the bare minimal. We recommend to implement a screen to explain to user.
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then(
        (status: PermissionStatus) => {
          if (status === 'granted') select();
        }
      );
    } else {
      select();
    }
    return () => {
      if (subscribed.current) subscribed.current.unsubscribe();
    };
  }, []);

  const startScan = async () => {
    setRefreshing(true);
    subscribed.current = new Observable(TransportBLE.listen).subscribe({
      complete: () => {
        setRefreshing(false);
      },
      next: (e: any) => {
        if (e.type === 'add') {
          const device = e.descriptor;
          setDevices(devices.some((i) => i.id === device.id) ? devices : devices.concat(device));
          // NB there is no "remove" case in BLE.
        }
      },
      error: (error) => {
        setError(error);
        setRefreshing(false);
      },
    });
  };

  const reload = async () => {
    if (subscribed.current) subscribed.current.unsubscribe();
    setDevices([]);
    setError(null);
    setRefreshing(false);
    startScan();
  };

  const keyExtractor = (item) => item.id;

  const _onSelectDevice = async (device) => {
    try {
      await onSelectDevice(device);
    } catch (error) {
      setError(error);
    }
  };

  const renderItem = ({ item }) => {
    return <DeviceItem device={item} onSelect={_onSelectDevice} />;
  };

  const ListHeader = () => {
    return error ? (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sorry, an error occured</Text>
        <Text style={styles.errorTitle}>{String(error.message)}</Text>
      </View>
    ) : (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scanning for Bluetooth...</Text>
        <Text style={styles.headerSubtitle}>Power up your Ledger Nano X and enter your pin.</Text>
      </View>
    );
  };

  return (
    <Fragment>
      <FlatList
        extraData={error}
        style={styles.list}
        data={devices}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        onRefresh={reload}
        refreshing={refreshing}
      />
    </Fragment>
  );
};

export default DeviceSelectionScreen;

const styles = StyleSheet.create({
  header: {
    paddingTop: 80,
    paddingBottom: 36,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  list: {
    flex: 1,
  },
  errorTitle: {
    color: '#c00',
    fontSize: 16,
    marginBottom: 16,
  },
});
