import { Box, Text } from 'native-base';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

import CheckIcon from 'src/assets/images/checked.svg';
import Next from 'src/assets/images/svgs/icon_arrow.svg';
import React from 'react';
import { SerializedPSBTEnvelop } from 'src/core/wallets/interfaces';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import moment from 'moment';
import { WalletMap } from '../Vault/WalletMap';

const { width } = Dimensions.get('screen');

function SignerList({
  signer,
  callback,
  envelops,
}: {
  signer: VaultSigner;
  callback: any;
  envelops: SerializedPSBTEnvelop[];
}) {
  const hasSignerSigned = !!envelops.filter(
    (psbt) => psbt.signerId === signer.signerId && psbt.isSigned
  ).length;
  return (
    <TouchableOpacity onPress={callback}>
      <Box m={5}>
        <Box flexDirection="row" borderRadius={10} justifyContent="space-between">
          <Box flexDirection="row">
            <View style={styles.inheritenceView}>
              <Box
                width={30}
                height={30}
                borderRadius={30}
                bg="#FAC48B"
                justifyContent="center"
                alignItems="center"
                marginX={1}
              >
                {WalletMap(signer.type).Icon}
              </Box>
            </View>
            <View style={{ flexDirection: 'column' }}>
              <Text
                color="light.textBlack"
                fontSize={14}
                fontWeight={200}
                fontFamily="heading"
                letterSpacing={1.12}
              >
                {`${signer.signerName} (${signer.xpubInfo.xfp})`}
              </Text>
              <Text
                color="light.GreyText"
                fontSize={12}
                marginRight={10}
                fontFamily="body"
                letterSpacing={0.6}
              >
                {`Added on ${moment(signer.addedOn).calendar().toLowerCase()}`}
              </Text>
              {!!signer.signerDescription && (
                <Text
                  noOfLines={1}
                  color="#6A7772"
                  fontSize={12}
                  fontWeight={200}
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
