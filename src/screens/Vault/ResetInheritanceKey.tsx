import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Pressable, StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useSignerMap from 'src/hooks/useSignerMap';
import { Signer } from 'src/services/wallets/interfaces/vault';
import moment from 'moment';
import IKSInfocard from './components/IKSInfoCard';
import { SDIcons } from './SigningDeviceIcons';
import { MONTHS_12 } from './constants';

function TimelineInfo({ duration, callback }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText } = translations;
  return (
    <Box style={styles.timelineInfoContainer}>
      <Text color={`${colorMode}.primaryText`} fontSize={15}>
        {vaultText.yourCurrentTimeline}
      </Text>
      <Box style={styles.timelineInfo}>
        <Text color={`${colorMode}.greenText`} fontSize={15}>
          {duration}
        </Text>
        <Pressable onPress={callback}>
          <Text color={`${colorMode}.greenText`}>{vaultText.changeTimeline}</Text>
        </Pressable>
      </Box>
    </Box>
  );
}

function ResetInheritanceKey({ route }) {
  const { signerId }: { signerId: string } = route.params;
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { signerMap } = useSignerMap();
  const { translations } = useContext(LocalizationContext);
  const signer: Signer = signerMap[signerId];
  const { vault: vaultText, common } = translations;
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={vaultText.resetIKTitle} subtitle={vaultText.resetIKDesc} />
      <Box style={styles.container}>
        <Box style={styles.contentContainer}>
          <IKSInfocard
            name={signer.signerName}
            description={`${common.added} ${moment(signer.addedOn).calendar().toLowerCase()}`}
            Icon={SDIcons(signer.type).Icon}
          />
          <TimelineInfo
            duration={MONTHS_12}
            callback={() => {
              navigation.dispatch(
                CommonActions.navigate({ name: 'ChangeIKSTimeline', params: { signerId } })
              );
            }}
          />
        </Box>
        <Box>
          <Buttons primaryText={vaultText.revaultNow} fullWidth />
        </Box>
      </Box>
    </ScreenWrapper>
  );
}

export default ResetInheritanceKey;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: hp(40),
    paddingHorizontal: wp(10),
  },
  contentContainer: {
    flex: 1,
  },
  timelineInfoContainer: {
    marginTop: hp(25),
    gap: hp(5),
  },
  timelineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: wp(7),
  },
});
