import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { SignerType } from 'src/services/wallets/enums';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import HardwareModalMap, { InteracationMode } from '../HardwareModalMap';
import { SDIcons } from '../SigningDeviceIcons';
import RightArrow from 'src/assets/images/icon_arrow.svg';
import RightArrowWhite from 'src/assets/images/icon_arrow_white.svg';

type AssignSignerTypeCardProps = {
  type: SignerType;
  disabled: boolean;
  first?: boolean;
  last?: boolean;
  vault: Vault;
  primaryMnemonic: string;
};

const AssignSignerTypeCard = ({
  type,
  disabled,
  first = false,
  last = false,
  vault,
  primaryMnemonic,
}: AssignSignerTypeCardProps) => {
  const [visible, setVisible] = useState(false);
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  const assignSignerType = () => {
    setVisible(true);
  };

  const close = () => setVisible(false);

  return (
    <>
      <TouchableOpacity
        disabled={disabled}
        activeOpacity={0.7}
        onPress={assignSignerType}
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

      <HardwareModalMap
        type={type}
        visible={visible}
        close={close}
        vaultSigners={vault?.signers}
        mode={InteracationMode.IDENTIFICATION}
        vaultShellId={vault?.shellId}
        isMultisig={vault?.isMultiSig}
        primaryMnemonic={primaryMnemonic}
        addSignerFlow={false}
        vaultId={vault?.id}
        skipHealthCheckCallBack={close}
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
});

export default AssignSignerTypeCard;
