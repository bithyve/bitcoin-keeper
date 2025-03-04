import React, { useContext, useEffect, useState } from 'react';
import DeviceCard from './DeviceCard';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { hp } from 'src/constants/responsive';
import BitBox from 'src/assets/images/bit-box-2.svg';
import ColdCard from 'src/assets/images/coinkite-image.svg';
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
import CoinkiteDevices from './CoinkiteDevices';
import Relay from 'src/services/backend/Relay';
import { useAppSelector } from 'src/store/hooks';

const HardwareDevices = () => {
  const { isOnL1 } = usePlan();
  const { translations } = useContext(LocalizationContext);
  const { common, wallet } = translations;
  const { colorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);
  const [coinkiteOpen, setCoinkiteOpen] = useState(false);
  const [sellers, setSellers] = useState([]);
  const appId = useAppSelector((state) => state.storage.appId);

  useEffect(() => {
    const fetchHardwareReferralLinks = async () => {
      const result = await Relay.fetchHardwareReferralLinks(appId);
      if (result?.sellers) {
        setSellers(result.sellers);
      }
    };

    fetchHardwareReferralLinks();
  }, []);

  const getSellerLink = (identifier) => {
    const seller = sellers.find((s) => s.identifier === identifier);
    return seller ? seller.link : null;
  };

  const data = [
    {
      id: 1,
      title: wallet.hardwareBitBox,
      image: <BitBox width={hp(90)} height={hp(100)} />,
      flagIcon: <FlagSwizerland />,
      country: wallet.hardwareBitBoxCountry,
      link: getSellerLink('bitbox'),
      subscribeText: '',
      unSubscribeText: '',
    },
    {
      id: 2,
      title: wallet.hardwareColdcard,
      image: <ColdCard height={hp(100)} width={hp(70)} />,
      flagIcon: <FlagCanada />,
      country: wallet.hardwareColdcardCountry,
      subscribeText: wallet.hardwareSubscribeText,
      unSubscribeText: wallet.hardwareSubscribeText,
      onPress: () => setCoinkiteOpen(true),
    },
    {
      id: 3,
      title: wallet.hardwareFoundation,
      image: <Passport height={hp(100)} width={hp(70)} />,
      flagIcon: <FlagUSA />,
      country: wallet.hardwareFoundationCountry,
      link: getSellerLink('foundation'),
      subscribeText: wallet.hardwareFoundationSubscribeText,
      unSubscribeText: wallet.hardwareFoundationSubscribeText,
    },
    {
      id: 4,
      title: wallet.hardwareLedger,
      image: <Legder height={hp(80)} width={hp(70)} />,
      flagIcon: <FlagFrance />,
      country: wallet.hardwareLedgerCountry,
      link: getSellerLink('leger'),
      subscribeText: '',
      unSubscribeText: '',
    },
    {
      id: 5,
      title: wallet.hardwareTrezor,
      image: <Trezor />,
      flagIcon: <FlagRepublic />,
      country: wallet.hardwareTrezorCountry,
      onPress: () => setIsOpen(true),
      subscribeText: '',
      unSubscribeText: '',
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
        Content={() => <TrezorDevices getSellerLink={getSellerLink} wallet={wallet} />}
      />
      <KeeperModal
        visible={coinkiteOpen}
        title={wallet.hardwareColdcard}
        subTitle={wallet.TrezorModalSub}
        close={() => setCoinkiteOpen(false)}
        showCloseIcon
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => <CoinkiteDevices getSellerLink={getSellerLink} wallet={wallet} />}
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
