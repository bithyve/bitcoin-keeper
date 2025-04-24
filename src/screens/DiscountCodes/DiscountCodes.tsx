import React, { useContext, useState } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import DiscountCard from 'src/components/DiscountCard';
import DiscountIcon from 'src/assets/images/foundation.svg';
import DiscountIconLarge from 'src/assets/images/foundation_large.svg';
import CopyIcon from 'src/assets/images/copy_new.svg';

import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';
import { hp, windowHeight } from 'src/constants/responsive';
import WalletHeader from 'src/components/WalletHeader';

const DiscountModal = ({ card }) => {
  const { colorMode } = useColorMode();
  console.log({ card });
  return (
    <Box style={styles.modalContainer}>
      <Box alignItems={'center'}>
        <DiscountIconLarge />
      </Box>
      <Box marginTop={30}>
        <Text fontSize={16} style={styles.cardDescription}>
          {card?.description} {card?.discount}% off
        </Text>
      </Box>

      <Box marginTop={30}>
        <Text fontSize={13}>Buy from here</Text>
        <Text underline color={`${colorMode}.greenText`}>
          www.foundationdevices/purchase/discountapplied.com
        </Text>
      </Box>
      <Box marginTop={windowHeight > 600 ? hp(40) : 0}>
        <Text>or use this discount code</Text>
        <TouchableOpacity
          activeOpacity={0.4}
          testID="btn_copy_address"
          style={styles.inputContainer}
        >
          <Box style={styles.inputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
            <Text width="80%" marginLeft={4} numberOfLines={1}>
              ASDF - GHJK - 8974 - UWMB
            </Text>

            <Box backgroundColor={`${colorMode}.textColor`} style={styles.copyIconWrapper}>
              <CopyIcon />
            </Box>
          </Box>
        </TouchableOpacity>
      </Box>
    </Box>
  );
};

function DiscountCodes({ navigation }) {
  const { colorMode } = useColorMode();
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedOfferDesp, setSelectedOfferDesp] = useState(null);
  const { translations } = useContext(LocalizationContext);
  const { DiscountCodes } = translations;

  const data = [
    {
      icon: <DiscountIcon />,
      discount: 30,
      description: `on Foundation\ndevice`,
    },
    {
      icon: <DiscountIcon />,
      discount: 30,
      description: `on Foundation\ndevice`,
    },
    {
      icon: <DiscountIcon />,
      discount: 30,
      description: `on Foundation\ndevice`,
    },
    {
      icon: <DiscountIcon />,
      discount: 30,
      description: `on Foundation\ndevice`,
    },
    {
      icon: <DiscountIcon />,
      discount: 30,
      description: `on Foundation\ndevice`,
    },
    {
      icon: <DiscountIcon />,
      discount: 30,
      description: `on Foundation\ndevice`,
    },
  ];
  const handleSelectedOffer = (card) => {
    console.log('description', card);
    setShowDiscountModal(true);
    setSelectedOfferDesp(card);
  };
  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.Champagne`}>
      <WalletHeader
        title={DiscountCodes.DiscountCodesTitle}
        subTitle={DiscountCodes.DiscountCodesDescp}
        // To-Do-Learn-More
      />
      <ScrollView>
        <Box style={styles.container}>
          {data.map((card) => (
            <DiscountCard card={card} handleSelectedOffer={handleSelectedOffer} />
          ))}
        </Box>
      </ScrollView>
      <KeeperModal
        visible={showDiscountModal}
        close={() => setShowDiscountModal(false)}
        title={'Discount Details'}
        Content={() => <DiscountModal card={selectedOfferDesp} />}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 25,
    marginTop: 20,
  },
  walletType: {
    justifyContent: 'space-between',
    gap: 10,
  },
  note: {
    position: 'absolute',
    bottom: 40,
    width: '90%',
    alignSelf: 'center',
  },
  modalContainer: {},
  inputContainer: {
    alignItems: 'center',
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
  },
  copyIconWrapper: {
    padding: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  cardDescription: {
    fontWeight: 400,
  },
});

export default DiscountCodes;
