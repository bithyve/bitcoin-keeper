import React, { useContext } from 'react';
import ResellerCard from './ResellerCard';
import { Box } from 'native-base';
import usePlan from 'src/hooks/usePlan';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import FastImage from 'react-native-fast-image';

const HardwareReseller = ({ resellers }) => {
  const { isOnL1 } = usePlan();
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletText } = translations;
  return (
    <Box style={styles.container}>
      {resellers.map((item) => (
        <ResellerCard
          key={item.id}
          title={item.title}
          location={item.country}
          subTitle={item.subTitle}
          icon={<FastImage source={{ uri: item.icon }} style={styles.icon} />}
          plan={isOnL1}
          subscribeText={item.subscribeText}
          unSubscribeText={item.unSubscribeText}
          link={item.link}
          buttonText={walletText.hardwareResellerButton}
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
  icon: {
    height: wp(40),
    width: wp(40),
    borderRadius: wp(8),
  },
});
