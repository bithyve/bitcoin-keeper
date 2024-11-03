import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import CheckIcon from 'src/assets/images/checked.svg';
import CheckDarkIcon from 'src/assets/images/checked-dark.svg';
import TimeIcon from 'src/assets/images/time.svg';
import Next from 'src/assets/images/icon_arrow.svg';
import NextDark from 'src/assets/images/icon_arrow_white.svg';
import React, { useEffect, useState } from 'react';
import { SerializedPSBTEnvelop } from 'src/services/wallets/interfaces';
import { Signer, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { getSignerDescription, getSignerNameFromType } from 'src/hardware';
import { SignerType } from 'src/services/wallets/enums';
import { SDIcons } from '../Vault/SigningDeviceIcons';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { wp } from 'src/constants/responsive';

const { width } = Dimensions.get('screen');

function SignerList({
  vaultKey,
  callback,
  envelops,
  signerMap,
  isIKSClicked,
  isIKSDeclined,
  IKSSignTime,
  isFirst,
  isLast,
}: {
  vaultKey: VaultSigner;
  callback: any;
  envelops: SerializedPSBTEnvelop[];
  signerMap: { [key: string]: Signer };
  isIKSClicked?: boolean;
  isIKSDeclined?: boolean;
  IKSSignTime?: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
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
      <Box style={styles.container}>
        <Box flexDirection="row" borderRadius={10} justifyContent="space-between">
          <Box flexDirection="row">
            <View style={styles.inheritenceView}>
              <Box
                width={35}
                height={35}
                borderRadius={100}
                backgroundColor={`${colorMode}.yellowCircleBackground`}
                justifyContent="center"
                alignItems="center"
                marginX={1}
              >
                {SDIcons(signer.type, !isDarkMode).Icon}
              </Box>
            </View>
            <View style={{ flexDirection: 'column', gap: 2.5 }}>
              <Text color={`${colorMode}.primaryText`} fontSize={15} maxWidth={width * 0.6}>
                {`${getSignerNameFromType(signer.type, signer.isMock, false)} (${
                  signer.masterFingerprint
                })`}
              </Text>
              <Text
                numberOfLines={1}
                color={`${colorMode}.textGreenGrey`}
                fontSize={13}
                maxWidth={width * 0.6}
              >
                {getSignerDescription(signer)}
              </Text>
            </View>
          </Box>
          <Box alignItems="center" justifyContent="center">
            {showIcon === 'check' ? isDarkMode ? <CheckDarkIcon /> : <CheckIcon /> : null}
            {showIcon === 'cross' && <ToastErrorIcon />}
            {showIcon === 'time' && <TimeIcon width={15} height={15} />}
            {showIcon === 'next' ? isDarkMode ? <NextDark /> : <Next /> : null}
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
  container: {
    paddingHorizontal: wp(10),
    paddingVertical: wp(10),
  },
  inheritenceView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    backgroundColor: '#E3E3E3',
    borderRadius: 30,
    marginRight: 15,
    alignSelf: 'center',
  },
});
