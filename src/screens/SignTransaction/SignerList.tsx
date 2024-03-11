import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

import CheckIcon from 'src/assets/images/checked.svg';
import Next from 'src/assets/images/icon_arrow.svg';
import React from 'react';
import { SerializedPSBTEnvelop } from 'src/core/wallets/interfaces';
import { Signer, VaultSigner } from 'src/core/wallets/interfaces/vault';
import moment from 'moment';
import { getSignerNameFromType } from 'src/hardware';
import { NetworkType, SignerType } from 'src/core/wallets/enums';
import config from 'src/core/config';
import { SDIcons } from '../Vault/SigningDeviceIcons';

const { width } = Dimensions.get('screen');

function SignerList({
  vaultKey,
  callback,
  envelops,
  signerMap,
}: {
  vaultKey: VaultSigner;
  callback: any;
  envelops: SerializedPSBTEnvelop[];
  signerMap: { [key: string]: Signer };
}) {
  const hasSignerSigned = !!envelops.filter(
    (envelop) => envelop.xfp === vaultKey.xfp && envelop.isSigned
  ).length;
  const signer = signerMap[vaultKey.masterFingerprint];
  const isAMF =
    signer.type === SignerType.TAPSIGNER &&
    config.NETWORK_TYPE === NetworkType.TESTNET &&
    !signer.isMock;
  return (
    <TouchableOpacity testID={`btn_transactionSigner`} onPress={callback}>
      <Box margin={5}>
        <Box flexDirection="row" borderRadius={10} justifyContent="space-between">
          <Box flexDirection="row">
            <View style={styles.inheritenceView}>
              <Box
                width={30}
                height={30}
                borderRadius={30}
                backgroundColor="light.accent"
                justifyContent="center"
                alignItems="center"
                marginX={1}
              >
                {SDIcons(signer.type).Icon}
              </Box>
            </View>
            <View style={{ flexDirection: 'column' }}>
              <Text
                color="light.textBlack"
                fontSize={14}
                letterSpacing={1.12}
                maxWidth={width * 0.6}
              >
                {`${getSignerNameFromType(signer.type, signer.isMock, isAMF)} (${
                  signer.masterFingerprint
                })`}
              </Text>
              <Text color="light.GreyText" fontSize={12} marginRight={10} letterSpacing={0.6}>
                {`Added on ${moment(signer.addedOn).calendar().toLowerCase()}`}
              </Text>
              {!!signer.signerDescription && (
                <Text
                  numberOfLines={1}
                  color="#6A7772"
                  fontSize={12}
                  letterSpacing={0.6}
                  fontStyle={null}
                  maxWidth={width * 0.6}
                >
                  {signer.signerDescription}
                </Text>
              )}
            </View>
          </Box>
          <Box alignItems="center" justifyContent="center">
            {hasSignerSigned ? <CheckIcon /> : <Next />}
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

export default SignerList;

const styles = StyleSheet.create({
  inheritenceView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    backgroundColor: '#E3E3E3',
    borderRadius: 30,
    marginRight: 20,
    alignSelf: 'center',
  },
});
