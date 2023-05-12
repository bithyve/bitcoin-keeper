import { Box, ScrollView } from 'native-base';
import React from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType } from 'src/core/wallets/enums';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import { getSignerNameFromType } from 'src/hardware';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { SDIcons } from '../Vault/SigningDeviceIcons';

type IProps = {
  navigation: any;
  route: {
    params: {
      signer: VaultSigner;
      parentNavigation: any;
    };
  };
};
function AssignSignerType({ navigation, route }: IProps) {
  const dispatch = useDispatch();
  const { signer, parentNavigation } = route.params;
  const assignSignerType = (type: SignerType) => {
    parentNavigation.setParams({
      signer: { ...signer, type, signerName: getSignerNameFromType(type) },
    });
    dispatch(updateSignerDetails(signer, 'type', type));
    dispatch(updateSignerDetails(signer, 'signerName', getSignerNameFromType(type)));
    navigation.goBack();
  };
  const availableSigners = [
    SignerType.TAPSIGNER,
    SignerType.COLDCARD,
    SignerType.SEEDSIGNER,
    SignerType.PASSPORT,
    SignerType.JADE,
    SignerType.KEYSTONE,
    SignerType.LEDGER,
    SignerType.TREZOR,
    SignerType.BITBOX02,
    SignerType.KEEPER,
    SignerType.SEED_WORDS,
    SignerType.MOBILE_KEY,
    SignerType.POLICY_SERVER,
  ];
  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Identify your Signing Device"
        subtitle="for better communication and conectivity"
        headerTitleColor="light.textBlack"
        onPressHandler={() => navigation.goBack()}
        paddingTop={hp(5)}
      />
      <ScrollView style={{ height: hp(520) }} showsVerticalScrollIndicator={false}>
        <Box>
          {availableSigners.map((type: SignerType, index: number) => {
            const first = index === 0;
            const last = index === availableSigners.length - 1;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => assignSignerType(type)}
                key={type}
              >
                <Box
                  backgroundColor="light.primaryBackground"
                  borderTopRadius={first ? 15 : 0}
                  borderBottomRadius={last ? 15 : 0}
                >
                  <Box style={styles.walletMapContainer}>
                    <Box style={styles.walletMapWrapper}>{SDIcons(type).Icon}</Box>
                    <Box backgroundColor="light.divider" style={styles.divider} />
                    <Box style={styles.walletMapLogoWrapper}>{SDIcons(type).Logo}</Box>
                  </Box>
                  <Box backgroundColor="light.divider" style={styles.dividerStyle} />
                </Box>
              </TouchableOpacity>
            );
          })}
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  walletMapContainer: {
    alignItems: 'center',
    height: windowHeight * 0.08,
    flexDirection: 'row',
    paddingLeft: wp(40),
  },
  walletMapWrapper: {
    marginRight: wp(20),
    width: wp(15),
  },
  walletMapLogoWrapper: {
    alignItems: 'center',
    marginLeft: wp(23),
    justifyContent: 'flex-end',
  },
  dividerStyle: {
    opacity: 0.1,
    width: windowWidth * 0.8,
    height: 0.5,
  },
  divider: {
    opacity: 0.5,
    height: hp(26),
    width: 1.5,
  },
});

export default AssignSignerType;
