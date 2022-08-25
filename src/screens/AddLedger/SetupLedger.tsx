import React, { useState } from 'react';

import DeviceSelectionScreen from './DeviceSelectionScreen';
import { SafeAreaView } from 'react-native';
import ShowAddressScreen from './ShowAddressScreen';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';

// This is helpful if you want to see BLE logs. (only to use in dev mode)

const AddLedger = () => {
  const [transport, setTransport] = useState(null);
  const onSelectDevice = async (device) => {
    const transport = await TransportBLE.open(device);
    // A better way is to pass in the device.id and handle the connection internally.
    transport.on('disconnect', () => {
      setTransport(null);
    });
    setTransport(transport);
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {!transport ? (
        <DeviceSelectionScreen onSelectDevice={onSelectDevice} />
      ) : (
        <ShowAddressScreen transport={transport} />
      )}
    </SafeAreaView>
  );
};

export default AddLedger;
