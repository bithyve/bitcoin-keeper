import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { SignerType } from 'src/services/wallets/enums';
import { Signer, Vault } from 'src/services/wallets/interfaces/vault';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import { SDIcons } from '../SigningDeviceIcons';
import RightArrow from 'src/assets/images/icon_arrow.svg';
import RightArrowWhite from 'src/assets/images/icon_arrow_white.svg';
import { useDispatch } from 'react-redux';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import KeeperModal from 'src/components/KeeperModal';
import { getSignerNameFromType } from 'src/hardware';

type AssignSignerTypeCardProps = {
  type: SignerType;
  disabled: boolean;
  first?: boolean;
  last?: boolean;
  vault: Vault;
  primaryMnemonic: string;
  signer?: Signer;
};

const AssignSignerTypeCard = ({
  type,
  disabled,
  first = false,
  last = false,
  signer,
}: AssignSignerTypeCardProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const dispatch = useDispatch();

  const changeSignerType = () => {
    setShowConfirm(false);
    dispatch(updateSignerDetails(signer, 'type', type));
    dispatch(updateSignerDetails(signer, 'signerName', getSignerNameFromType(type, signer.isMock)));
  };

  return (
    <>
      <TouchableOpacity
        disabled={disabled}
        activeOpacity={0.7}
        onPress={() => setShowConfirm(true)}
        testID={`btn_identify_${type}`}
      >
        <Box
          backgroundColor={`${colorMode}.secondaryBackground`}
          borderTopRadius={first ? 10 : 0}
          borderBottomRadius={last ? 10 : 0}
          borderWidth={isDarkMode ? 1 : 0}
          borderTopWidth={first && isDarkMode ? 1 : 0}
          borderBottomWidth={isDarkMode || !last ? 1 : 0}
          borderColor={`${colorMode}.dullGreyBorder`}
          style={[styles.container]}
        >
          <Box
            style={[
              styles.walletMapContainer,
              {
                opacity: disabled ? 0.4 : 1,
              },
            ]}
          >
            <Box style={styles.walletMapWrapper}>{SDIcons(type, colorMode === 'dark').Icon}</Box>
            <Box backgroundColor={`${colorMode}.dullGreyBorder`} style={styles.divider} />
            <Box style={styles.walletMapLogoWrapper}>{SDIcons(type).Logo}</Box>
            <Box style={styles.arrowIconWrapper}>
              {isDarkMode ? <RightArrowWhite /> : <RightArrow />}
            </Box>
          </Box>
        </Box>
      </TouchableOpacity>

      <KeeperModal
        visible={showConfirm}
        close={() => setShowConfirm(false)}
        title="Changing Signer Type"
        subTitle={`Are you sure you want to change the signer type to ${getSignerNameFromType(
          type
        )}?`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonText="Continue"
        secondaryButtonText="Cancel"
        secondaryCallback={() => setShowConfirm(false)}
        buttonCallback={changeSignerType}
      />
    </>
  );
};

const styles = StyleSheet.create({
  walletMapContainer: {
    alignItems: 'center',
    minHeight: windowHeight * 0.075,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletMapWrapper: {
    marginRight: wp(13.2),
    alignItems: 'center',
  },
  walletMapLogoWrapper: {
    marginLeft: wp(20),
    justifyContent: 'flex-end',
    marginVertical: hp(20),
    width: windowWidth * 0.53,
  },
  divider: {
    height: hp(25),
    width: 1,
  },
  container: {
    alignItems: 'center',
  },
  arrowIconWrapper: {
    marginLeft: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningIllustration: {
    alignSelf: 'center',
    marginBottom: hp(20),
    marginRight: wp(40),
  },
  warningText: {
    fontSize: 14,
    padding: 1,
    letterSpacing: 0.65,
  },
});

export default AssignSignerTypeCard;
