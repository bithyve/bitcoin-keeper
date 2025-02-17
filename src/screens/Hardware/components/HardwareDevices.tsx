import React, { useContext, useState } from 'react';
import DeviceCard from './DeviceCard';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { hp } from 'src/constants/responsive';
import BitBox from 'src/assets/images/bit-box-2.svg';
import ColdCard from 'src/assets/images/coldcard-image.svg';
import Passport from 'src/assets/images/foundation-passport-icon.svg';
import Legder from 'src/assets/images/Ledger-icon.svg';
import Trezor from 'src/assets/images/TREZOR-icon.svg';
import FlagCanada from 'src/assets/images/flag-canada.svg';
import FlagUSA from 'src/assets/images/flag-usa.svg';
import FlagSwizerland from 'src/assets/images/flag-swizerland.svg';
import FlagFrance from 'src/assets/images/flag-france.svg';
import FlagRepublic from 'src/assets/images/flag-czech.svg';
import usePlan from 'src/hooks/usePlan';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import KeeperModal from 'src/components/KeeperModal';
import TrezorDevices from './TrezorDevices';

const HardwareDevices = () => {
  const { isOnL1 } = usePlan();
  const { translations } = useContext(LocalizationContext);
  const { common, wallet } = translations;
  const { colorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);
  const handlePress = () => {
    setIsOpen(!isOpen);
  };

  const data = [
    {
      id: 1,
      title: wallet.hardwareBitBox,
      image: <BitBox />,
      flagIcon: <FlagSwizerland />,
      country: wallet.hardwareBitBoxCountry,
      subscribeText: wallet.hardwareSubscribeText,
      unSubscribeText: wallet.hardwareUnsubscribeText,
      link: 'https://shop.bitbox.swiss/?ref=bjhikjbf',
    },
    {
      id: 2,
      title: wallet.hardwareColdcard,
      image: <ColdCard />,
      flagIcon: <FlagCanada />,
      country: wallet.hardwareColdcardCountry,
      link: 'https://store.coinkite.com/promo/BITCOINKEEPER',
    },
    {
      id: 3,
      title: wallet.hardwareFoundation,
      image: <Passport />,
      flagIcon: <FlagUSA />,
      country: wallet.hardwareFoundationCountry,
      link: 'https://foundation.xyz/keeper',
    },
    {
      id: 4,
      title: wallet.hardwareLedger,
      image: <Legder />,
      flagIcon: <FlagFrance />,
      country: wallet.hardwareLedgerCountry,
      link: 'https://shop.ledger.com/?r=6df8a00ac94d',
    },
    {
      id: 5,
      title: wallet.hardwareTrezor,
      image: <Trezor />,
      flagIcon: <FlagRepublic />,
      country: wallet.hardwareTrezorCountry,
      onPress: () => handlePress(),
    },
  ];
  return (
    <Box style={styles.container}>
      {data.map((item) => (
        <DeviceCard
          key={item.title}
          madeText={common.madeIn}
          title={item.title}
          image={item.image}
          flagIcon={item.flagIcon}
          country={item.country}
          plan={isOnL1}
          subscribeText={item.subscribeText}
          unSubscribeText={item.unSubscribeText}
          link={item.link}
          buttonText={wallet.hardwareDeviceButton}
          onPress={item.onPress}
        />
      ))}

      <KeeperModal
        visible={isOpen}
        title={wallet.hardwareTrezor}
        subTitle={wallet.TrezorModalSub}
        close={() => setIsOpen(false)}
        showCloseIcon
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => <TrezorDevices wallet={wallet} />}
      />
    </Box>
  );
};

export default HardwareDevices;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
    paddingVertical: hp(20),
  },
});
