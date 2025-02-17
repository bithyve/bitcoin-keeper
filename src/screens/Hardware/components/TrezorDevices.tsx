import { ScrollView } from 'native-base';
import React from 'react';
import DeviceCard from './DeviceCard';
import TrezorT from 'src/assets/images/Trezor-model-T.svg';
import TrezorOne from 'src/assets/images/trezor-model-one.svg';
import Trezor3 from 'src/assets/images/Trezor-safe-3.svg';
import Trezor5 from 'src/assets/images/Trezor-safe-5.svg';
import { StyleSheet } from 'react-native';
const TrezorDevices = ({ wallet }) => {
  const TrezorData = [
    {
      id: 1,
      title2: 'Trezor Model T',
      image: <TrezorT />,
      link: 'https://www.trezor.io/',
    },
    {
      id: 2,
      title2: 'Trezor Model One',
      image: <TrezorOne />,
      link: 'https://www.trezor.io/',
    },
    {
      id: 3,
      title2: 'Trezor Safe 3',
      title2Sub: ' - BTC Only',
      image: <Trezor3 />,
      link: 'https://www.trezor.io/',
    },
    {
      id: 4,
      title2: 'Trezor Safe 5',
      title2Sub: ' - BTC Only',
      image: <Trezor5 />,
      link: 'https://www.trezor.io/',
    },
  ];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {TrezorData.map((item) => (
        <DeviceCard
          key={item.id}
          title2={item.title2}
          link={item.link}
          title2Sub={item.title2Sub}
          image={item.image}
          buttonText={wallet.hardwareDeviceButton}
        />
      ))}
    </ScrollView>
  );
};

export default TrezorDevices;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 15,
  },
});
