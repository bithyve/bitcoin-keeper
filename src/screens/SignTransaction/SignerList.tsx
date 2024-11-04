import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import CheckIcon from 'src/assets/images/checked.svg';
import TimeIcon from 'src/assets/images/time.svg';
import Next from 'src/assets/images/icon_arrow.svg';
import React, { useEffect, useState } from 'react';
import { SerializedPSBTEnvelop } from 'src/services/wallets/interfaces';
import { Signer, VaultSigner } from 'src/services/wallets/interfaces/vault';
import moment from 'moment';
import { getSignerNameFromType } from 'src/hardware';
import { NetworkType, SignerType } from 'src/services/wallets/enums';
import config from 'src/utils/service-utilities/config';
import { SDIcons } from '../Vault/SigningDeviceIcons';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { getPersistedDocument } from 'src/services/documents';

const { width } = Dimensions.get('screen');

function SignerList({
  vaultKey,
  callback,
  envelops,
  signerMap,
  isIKSClicked,
  isIKSDeclined,
  IKSSignTime,
}: {
  vaultKey: VaultSigner;
  callback: any;
  envelops: SerializedPSBTEnvelop[];
  signerMap: { [key: string]: Signer };
  isIKSClicked?: boolean;
  isIKSDeclined?: boolean;
  IKSSignTime?: number;
}) {
  const { colorMode } = useColorMode();
  const hasSignerSigned = !!envelops.filter(
    (envelop) => envelop.xfp === vaultKey.xfp && envelop.isSigned
  ).length;
  const signer = signerMap[vaultKey.masterFingerprint];
  const isIKS = signer.type === SignerType.INHERITANCEKEY;
  const [showIcon, setShowIcon] = useState(null);

  const formatDuration = (durationInMilliseconds) => {
    const millisecondsInSecond = 1000;
    const millisecondsInMinute = millisecondsInSecond * 60;
    const millisecondsInHour = millisecondsInMinute * 60;
    const millisecondsInDay = millisecondsInHour * 24;
    const millisecondsInMonth = millisecondsInDay * 30;

    if (durationInMilliseconds >= millisecondsInMonth) {
      const months = Math.floor(durationInMilliseconds / millisecondsInMonth);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else if (durationInMilliseconds >= millisecondsInDay) {
      const days = Math.floor(durationInMilliseconds / millisecondsInDay);
      return `${days} day${days > 1 ? 's' : ''}`;
    } else if (durationInMilliseconds >= millisecondsInHour) {
      const hours = Math.floor(durationInMilliseconds / millisecondsInHour);
      const remainingMinutes = Math.floor(
        (durationInMilliseconds % millisecondsInHour) / millisecondsInMinute
      );
      return `${hours} hour${hours > 1 ? 's' : ''} ${
        remainingMinutes > 0 ? remainingMinutes + ' min' : ''
      }`;
    } else if (durationInMilliseconds >= millisecondsInMinute) {
      const minutes = Math.ceil(durationInMilliseconds / millisecondsInMinute);
      return `${minutes} min`;
    } else {
      return '1 min';
    }
  };

  useEffect(() => {
    if (hasSignerSigned) {
      setShowIcon('check');
    } else if (isIKS) {
      if (isIKSDeclined) setShowIcon('cross');
      else if (isIKSClicked) setShowIcon('time');
      else setShowIcon('next');
    } else {
      setShowIcon('next');
    }
  }, [hasSignerSigned, isIKS, isIKSClicked, isIKSDeclined]);

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
                backgroundColor={`${colorMode}.accent`}
                justifyContent="center"
                alignItems="center"
                marginX={1}
              >
                {signer?.extraData?.thumbnailPath ? (
                  <Image
                    src={getPersistedDocument(signer.extraData.thumbnailPath)}
                    style={styles.associatedContactImage}
                  />
                ) : (
                  SDIcons(signer.type).Icon
                )}
              </Box>
            </View>
            <View style={{ flexDirection: 'column' }}>
              <Text
                color={`${colorMode}.textBlack`}
                fontSize={14}
                letterSpacing={1.12}
                maxWidth={width * 0.6}
              >
                {`${getSignerNameFromType(signer.type, signer.isMock, false)} (${
                  signer.masterFingerprint
                })`}
              </Text>
              <Text
                color={`${colorMode}.GreyText`}
                fontSize={12}
                marginRight={10}
                letterSpacing={0.6}
              >
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
            {showIcon === 'check' && <CheckIcon />}
            {showIcon === 'cross' && <ToastErrorIcon />}
            {showIcon === 'time' && <TimeIcon width={15} height={15} />}
            {showIcon === 'next' && <Next />}
            {isIKS && !isIKSDeclined && !hasSignerSigned && isIKSClicked && (
              <Text style={{ fontSize: 13 - formatDuration(IKSSignTime).length * 0.5 }}>
                {formatDuration(IKSSignTime)}
              </Text>
            )}
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
  associatedContactImage: {
    width: '60%',
    height: '60%',
    borderRadius: 100,
    alignSelf: 'center',
    justifyContent: 'center',
  },
});
