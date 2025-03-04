import React, { useContext } from 'react';
import ResellerCard from './ResellerCard';
import { Box } from 'native-base';
import usePlan from 'src/hooks/usePlan';
import { StyleSheet } from 'react-native';
import { hp } from 'src/constants/responsive';
import BitSaga from 'src/assets/images/bit-saga-icon.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const HardwareReseller = () => {
  const { isOnL1 } = usePlan();
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;

  const data = [
    {
      title: wallet.hardwareBitSaga,
      country: wallet.hardwareBitSagaCountry,
      subTitle: wallet.hardwareBitSagaSubTitle,
      icon: <BitSaga />,
      subscribeText: '',
      unSubscribeText: '',
      link: '',
    },
  ];
  return (
    <Box style={styles.container}>
      {data.map((item) => (
        <ResellerCard
          key={item.title}
          title={item.title}
          location={item.country}
          subTitle={item.subTitle}
          icon={item.icon}
          plan={isOnL1}
          subscribeText={item.subscribeText}
          unSubscribeText={item.unSubscribeText}
          link={item.link}
          buttonText={wallet.hardwareResellerButton}
        />
      ))}
    </Box>
  );
};

export default HardwareReseller;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
    paddingVertical: hp(20),
  },
});
