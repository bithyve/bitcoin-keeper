import { ScrollView } from 'native-base';
import React from 'react';
import DeviceCard from './DeviceCard';
import ColdCardMk4 from 'src/assets/images/coldCard-MK4.svg';
import ColdCardQ from 'src/assets/images/coldCard-Q.svg';
import { StyleSheet } from 'react-native';
const CoinkiteDevices = ({ wallet, getSellerLink }) => {
  const TrezorData = [
    {
      id: 1,
      title2: wallet.coldCardMK4,
      image: <ColdCardMk4 />,
      link: getSellerLink('coinkite'),
    },
    {
      id: 2,
      title2: wallet.coldCardQ,
      image: <ColdCardQ />,
      link: getSellerLink('coinkite'),
    },
  ];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {TrezorData.map((item) => (
        <DeviceCard
          key={item.id}
          title2={item.title2}
          link={item.link}
          image={item.image}
          buttonText={wallet.hardwareDeviceButton}
        />
      ))}
    </ScrollView>
  );
};

export default CoinkiteDevices;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 15,
  },
});
