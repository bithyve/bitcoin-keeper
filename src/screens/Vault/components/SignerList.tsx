import { Platform, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useCallback } from 'react';
import { Box, useColorMode, VStack } from 'native-base';
import moment from 'moment';
import { getSignerNameFromType, isSignerAMF, UNVERIFYING_SIGNERS } from 'src/hardware';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { VaultMigrationType } from 'src/core/wallets/enums';
import Text from 'src/components/KeeperText';
import { Vault } from 'src/core/wallets/interfaces/vault';
import AddIcon from 'src/assets/images/icon_add_plus.svg';
import SignerIcon from 'src/assets/images/icon_vault_coldcard.svg';
import { windowHeight } from 'src/constants/responsive';
import { WalletMap } from '../WalletMap';

function SignerList({ vault, upgradeStatus }: { vault: Vault; upgradeStatus: VaultMigrationType }) {
  const { colorMode } = useColorMode();
  const { signers: Signers, isMultiSig } = vault;
  const navigation = useNavigation();

  const AddSigner = useCallback(() => {
    if (upgradeStatus === VaultMigrationType.UPGRADE) {
      return (
        <Box style={styles.signerCard} backgroundColor={`${colorMode}.coffeeBackground`}>
          <TouchableOpacity
            onPress={() => {
              navigation.dispatch(
                CommonActions.navigate({ name: 'AddSigningDevice', merge: true, params: {} })
              );
            }}
          >
            <Box
              margin="1"
              marginBottom="3"
              width="12"
              height="12"
              borderRadius={30}
              justifyContent="center"
              alignItems="center"
              marginX={1}
              alignSelf="center"
            >
              <AddIcon />
            </Box>
            <VStack pb={2}>
              <Text color="light.white" fontSize={10} bold letterSpacing={0.6} textAlign="center">
                Add signing device to upgrade
              </Text>
            </VStack>
          </TouchableOpacity>
        </Box>
      );
    }
    return null;
  }, [upgradeStatus]);
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={{ position: 'absolute', top: -50 }}
      showsHorizontalScrollIndicator={false}
      horizontal
    >
      {Signers.map((signer) => {
        const indicate =
          !signer.registered && isMultiSig && !UNVERIFYING_SIGNERS.includes(signer.type);
        return (
          <Box style={styles.signerCard} marginRight="3" key={signer.signerId}>
            <TouchableOpacity
              onPress={() => {
                navigation.dispatch(
                  CommonActions.navigate('SigningDeviceDetails', {
                    SignerIcon: <SignerIcon />,
                    signerId: signer.signerId,
                    vaultId: vault.id,
                  })
                );
              }}
            >
              {indicate ? <Box style={styles.indicator} /> : null}
              <Box style={styles.signerTypeIconWrapper}>{WalletMap(signer.type, true).Icon}</Box>
              <Text bold style={styles.unregistered}>
                {indicate ? 'Not registered' : ' '}
              </Text>
              <VStack style={styles.signerNameFromTypeWrapper}>
                <Text
                  color="light.textBlack"
                  style={styles.signerNameFromTypeText}
                  numberOfLines={1}
                >
                  {getSignerNameFromType(signer.type, signer.isMock, isSignerAMF(signer))}
                </Text>
                <Text color="light.textBlack" style={styles.signerDescDateText} numberOfLines={2}>
                  {signer.signerDescription
                    ? signer.signerDescription
                    : `Added ${moment(signer.addedOn).fromNow().toLowerCase()}`}
                </Text>
              </VStack>
            </TouchableOpacity>
          </Box>
        );
      })}
      <AddSigner />
    </ScrollView>
  );
}

export default SignerList;

const styles = StyleSheet.create({
  signerCard: {
    elevation: 4,
    shadowRadius: 4,
    shadowOpacity: 0.3,
    shadowOffset: { height: 2, width: 0 },
    height: windowHeight > 670 ? 130 : 121,
    width: 70,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    borderBottomLeftRadius: Platform.OS === 'ios' ? 10 : 30,
    borderBottomRightRadius: Platform.OS === 'ios' ? 10 : 30,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: windowHeight > 670 ? 5 : 2,
    backgroundColor: '#FDF7F0',
  },
  scrollContainer: {
    paddingVertical: '3%',
    paddingHorizontal: '2%',
    width: Platform.select({ android: null, ios: '100%' }),
    marginRight: '10%',
  },
  unregistered: {
    color: '#6E563B',
    fontSize: 8,
    letterSpacing: 0.6,
    textAlign: 'center',
    lineHeight: 16,
  },
  indicator: {
    height: 10,
    width: 10,
    borderRadius: 10,
    position: 'absolute',
    zIndex: 2,
    right: '10%',
    top: '5%',
    borderWidth: 1,
    borderColor: 'white',
    backgroundColor: '#F86B50',
  },
  signerNameFromTypeText: {
    fontSize: 9,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  signerDescDateText: {
    fontSize: 7,
    letterSpacing: windowHeight > 670 ? 0.6 : 0,
    textAlign: 'center',
  },
  signerNameFromTypeWrapper: {
    paddingBottom: 2,
  },
  signerTypeIconWrapper: {
    margin: 2,
    width: windowHeight > 670 ? 45 : 40,
    height: windowHeight > 670 ? 45 : 40,
    borderRadius: 45,
    backgroundColor: '#725436',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
});
