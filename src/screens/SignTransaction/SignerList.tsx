import Text from 'src/components/KeeperText';
import { Box, HStack, VStack, useColorMode } from 'native-base';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import CheckIcon from 'src/assets/images/checked.svg';
import TimeIcon from 'src/assets/images/time.svg';
import Next from 'src/assets/images/icon_arrow.svg';
import React, { useEffect, useState } from 'react';
import { SerializedPSBTEnvelop } from 'src/services/wallets/interfaces';
import { Signer, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { getSignerDescription, getSignerNameFromType } from 'src/hardware';
import { SDIcons } from '../Vault/SigningDeviceIcons';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { getPersistedDocument } from 'src/services/documents';
import { getKeyUID } from 'src/utils/utilities';
import { hp, wp } from 'src/constants/responsive';

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
  const { colorMode } = useColorMode();
  const hasSignerSigned = !!envelops.filter(
    (envelop) => envelop.xfp === vaultKey.xfp && envelop.isSigned
  ).length;
  const signer = signerMap[getKeyUID(vaultKey)];
  const [showIcon, setShowIcon] = useState(null);

  useEffect(() => {
    if (hasSignerSigned) {
      setShowIcon('check');
    } else {
      setShowIcon('next');
    }
  }, [hasSignerSigned]);

  return (
    <TouchableOpacity testID={`btn_transactionSigner`} onPress={callback}>
      <Box style={styles.container}>
        <HStack>
          <Box style={styles.iconBox}>
            <Box style={styles.iconContainer} backgroundColor={`${colorMode}.accent`}>
              {signer?.extraData?.thumbnailPath ? (
                <Image
                  src={getPersistedDocument(signer.extraData.thumbnailPath)}
                  style={styles.associatedContactImage}
                />
              ) : (
                SDIcons(signer.type).Icon
              )}
            </Box>
          </Box>
          <HStack style={styles.innerContainer}>
            <Box style={styles.contentBox}>
              <VStack style={styles.textContainer}>
                <Text color={`${colorMode}.textBlack`} fontSize={14} numberOfLines={2}>
                  {`${getSignerNameFromType(signer.type, signer.isMock, false)} (${
                    signer.masterFingerprint
                  })`}
                </Text>
                <Text numberOfLines={2} color={`${colorMode}.greenText`} fontSize={12}>
                  {getSignerDescription(signer)}
                </Text>
              </VStack>
            </Box>
            <Box
              style={styles.stateIconContainer}
              alignItems={showIcon === 'time' ? 'flex-end' : 'center'}
            >
              <Box>
                {showIcon === 'check' && <CheckIcon />}
                {showIcon === 'cross' && <ToastErrorIcon />}
                {showIcon === 'time' && <TimeIcon width={15} height={15} />}
                {showIcon === 'next' && <Next />}
              </Box>
            </Box>
          </HStack>
        </HStack>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    paddingRight: wp(16),
    paddingVertical: hp(12),
  },
  iconBox: {
    width: '16%',
    justifyContent: 'center',
  },
  iconContainer: {
    width: wp(35),
    height: wp(35),
    borderRadius: wp(35),
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  contentBox: {
    width: '70%',
  },
  textContainer: {
    width: '100%',
    gap: 2,
    justifyContent: 'center',
  },
  associatedContactImage: {
    width: '60%',
    height: '60%',
    borderRadius: 100,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  stateIconContainer: {
    minWidth: '5%',
    justifyContent: 'center',
  },
  durationText: {
    textAlign: 'center',
  },
});

export default SignerList;
