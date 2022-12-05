import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';

import { Text } from 'native-base';
import useScanLedger from './useScanLedger';

function DeviceItem({ device, onSelect }) {
  const [pending, setPending] = useState(false);
  const onPress = async () => {
    setPending(true);
    try {
      await onSelect(device);
    } catch (error) {
      console.log(error);
      // setError(error);
    } finally {
      setPending(false);
    }
  };

  return (
    <TouchableOpacity style={styles.deviceItem} onPress={onPress} disabled={pending}>
      <Text style={styles.deviceName}>{device.name}</Text>
      {pending ? <ActivityIndicator /> : null}
    </TouchableOpacity>
  );
}

function DeviceSelectionScreen({ onSelectDevice }) {
  const { error, devices, reload, scanning } = useScanLedger();

  function ListHeader() {
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
  }

  return (
    <ScrollView
      style={styles.list}
      refreshControl={<RefreshControl refreshing={scanning} onRefresh={reload} />}
    >
      <ListHeader />
      {devices.map((device) => <DeviceItem device={device} onSelect={onSelectDevice} key={device.id} />)}
    </ScrollView>
  );
}

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
  deviceItem: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginVertical: 8,
    marginHorizontal: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
