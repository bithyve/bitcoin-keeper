import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';

const DeviceItem = ({ onSelect, device }) => {
  const [pending, setPending] = useState(false);

  const onPress = async () => {
    setPending(true);
    try {
      await onSelect(device);
      //   await this.props.onSelect(this.props.device);
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
};

export default DeviceItem;

const styles = StyleSheet.create({
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
