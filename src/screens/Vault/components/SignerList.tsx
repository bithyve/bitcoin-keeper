import { Platform, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useCallback } from 'react';
import { Box, VStack } from 'native-base';
import moment from 'moment';
import { getSignerNameFromType, isSignerAMF, UNVERIFYING_SIGNERS } from 'src/hardware';
import { CommonActions, useNavigation } from '@react-navigation/native';
import LinearGradient from 'src/components/KeeperGradient';
import { VaultMigrationType } from 'src/core/wallets/enums';
import Text from 'src/components/KeeperText';
import { Vault } from 'src/core/wallets/interfaces/vault';
import AddIcon from 'src/assets/images/icon_add_plus.svg';
import SignerIcon from 'src/assets/images/icon_vault_coldcard.svg';
import { windowHeight } from 'src/common/data/responsiveness/responsive';
import { WalletMap } from '../WalletMap';

function SignerList({ vault, upgradeStatus }: { vault: Vault; upgradeStatus: VaultMigrationType }) {
  const { signers: Signers, isMultiSig } = vault;
  const navigation = useNavigation();

  const AddSigner = useCallback(() => {
    if (upgradeStatus === VaultMigrationType.UPGRADE) {
      return (
        <LinearGradient
          start={[0, 0]}
          end={[1, 1]}
          colors={['#B17F44', '#6E4A35']}
          style={[styles.signerCard]}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
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
        </LinearGradient>
      );
    }
    return null;
  }, [upgradeStatus]);
  console.log('windowHeight', windowHeight)
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={{ position: 'absolute', top: `${70 - Signers.length}%` }}
      showsHorizontalScrollIndicator={false}
      horizontal
    >
      {Signers.map((signer) => {
        const indicate =
          !signer.registered && isMultiSig && !UNVERIFYING_SIGNERS.includes(signer.type);
        return (
          <Box
            style={styles.signerCard}
            marginRight="3"
            key={signer.signerId}
          >
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
              <Box
                style={styles.signerTypeIconWrapper}
              >
                {WalletMap(signer.type, true).Icon}
              </Box>
              <Text bold style={styles.unregistered}>
                {indicate ? 'Not registered' : ' '}
              </Text>
              <VStack style={styles.signerNameFromTypeWrapper}>
                <Text
                  color="light.textBlack"
                  style={styles.signerNameFromTypeText}
                >
                  {getSignerNameFromType(signer.type, signer.isMock, isSignerAMF(signer))}
                </Text>
                <Text
                  color="light.textBlack"
                  style={styles.signerDescDateText}
                >
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: windowHeight > 670 ? 5 : 2,
    backgroundColor: '#FDF7F0',
  },
  scrollContainer: {
    padding: windowHeight > 670 ? '8%' : '5%',
    width: Platform.select({ android: null, ios: '100%' }),
  },
  unregistered: {
    color: '#6E563B',
    fontSize: 8,
    letterSpacing: 0.6,
    textAlign: 'center',
    numberOfLines: 1,
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
    textAlign: "center",
    numberOfLines: 1
  },
  signerDescDateText: {
    fontSize: 7,
    letterSpacing: windowHeight > 670 ? 0.6 : 0,
    textAlign: "center",
    numberOfLines: 2
  },
  signerNameFromTypeWrapper: {
    paddingBottom: 2
  },
  signerTypeIconWrapper: {
    margin: 2,
    width: windowHeight > 670 ? 45 : 40,
    height: windowHeight > 670 ? 45 : 40,
    borderRadius: 45,
    backgroundColor: "#725436",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center"
  }
});
