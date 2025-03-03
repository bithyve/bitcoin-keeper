import { ScrollView } from 'native-base';
import React from 'react';
import DeviceCard from './DeviceCard';
import TrezorT from 'src/assets/images/Trezor-model-T.svg';
import TrezorOne from 'src/assets/images/trezor-model-one.svg';
import Trezor3 from 'src/assets/images/Trezor-safe-3.svg';
import Trezor5 from 'src/assets/images/Trezor-safe-5.svg';
import { StyleSheet } from 'react-native';
const TrezorDevices = ({ wallet, getSellerLink }) => {
  const TrezorData = [
    {
      id: 1,
      title2: wallet.TrezorModelT,
      image: <TrezorT />,
      link: getSellerLink('trezorModelT'),
    },
    {
      id: 2,
      title2: wallet.TrezorModel1,
      image: <TrezorOne />,
      link: getSellerLink('trezorModelOne'),
    },
    {
      id: 3,
      title2: wallet.TrezorSafe3,
      title2Sub: wallet.TrezorBTCOnly,
      image: <Trezor3 />,
      link: getSellerLink('trezorSafe3'),
    },
    {
      id: 4,
      title2: wallet.TrezorSafe5,
      title2Sub: wallet.TrezorBTCOnly,
      image: <Trezor5 />,
      link: getSellerLink('trezorSafe5'),
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
