import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { useDispatch } from 'react-redux';
import { Box, useColorMode } from 'native-base';
import VaultSetupIcon from 'src/assets/images/pull-down-wallet.svg';
import { hp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import Checked from 'src/assets/images/check';
import { hideOnboarding } from 'src/store/reducers/concierge';
import { openConcierge } from 'src/store/sagaActions/concierge';
import CustomButton from '../CustomButton/CustomButton';

function ConciergeOnboardingModal({ visible }) {
  const dispatch = useDispatch();
  const { colorMode } = useColorMode();
  const [pageNo, setPageNo] = useState(1);

  function Check({ checked = false }) {
    return checked ? (
      <Box height={5} width={5}>
        <Checked default={false} />
      </Box>
    ) : (
      <Box style={styles.circle} />
    );
  }

  function LinkedWalletContent() {
    const [agree, setAgree] = useState(false);
    const [dontShow, setDontShow] = useState(false);

    if (pageNo === 1) {
      return (
        <View style={styles.contentContainer}>
          {/* <Box alignSelf="center">
            <VaultSetupIcon />
          </Box> */}
          <Text style={styles.contentText}>
            Get all your queries answered with Keeper Concierge. Upgrade to Hodler to chat with a
            support executive and Diamond Hands to schedule calls.
          </Text>
          <Box marginTop={4} alignSelf="flex-end">
            <CustomButton value="Next" disabled={false} onPress={() => setPageNo(2)} />
          </Box>
        </View>
      );
    } else if (pageNo === 2) {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>
            {`Test your multi-key setups and backups atleast once every few months.\n\nRegularly update your signing devices’ firmwares/softwares.\n\nPlease ensure that your backups are updated if you change one or more of the signers.`}
          </Text>
          <Box marginTop={4} alignSelf="flex-end">
            <CustomButton value="Next" disabled={false} onPress={() => setPageNo(3)} />
          </Box>
        </View>
      );
    } else {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>
            To help you troubleshoot better and faster, Keeper would like to collect the following
            data:
          </Text>
          <Text style={styles.contentText}>
            {
              '1. Tier Info\n2. Phone and OS\n3. App version history\n4. Screen context (where the user is coming from)\n5. Tor and network (WiFi/ Mobile) status\n6.Sentry items - error codes'
            }
          </Text>
          <Text style={styles.contentText}>
            You can choose to decline now but maybe asked for the data again if one or more
            parameter seems to be the bottleneck in troubleshooting.
          </Text>
          <TouchableOpacity
            onPress={() => setDontShow((prev) => !prev)}
            activeOpacity={0.6}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 2,
            }}
          >
            <Check checked={dontShow} />
            <Text ml={4} style={styles.contentText}>
              Don’t show again
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setAgree((prev) => !prev)}
            activeOpacity={0.6}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 2,
            }}
          >
            <Check checked={agree} />
            <Text ml={4} style={styles.contentText}>
              I agree for these to be shared
            </Text>
          </TouchableOpacity>
          <Box marginTop={4} alignSelf="flex-end">
            <CustomButton
              value="Continue"
              disabled={!agree}
              onPress={() => {
                setPageNo(1);
                dispatch(hideOnboarding());
                dispatch(openConcierge(dontShow));
              }}
            />
          </Box>
        </View>
      );
    }
  }

  return (
    <KeeperModal
      visible={visible}
      close={() => {
        setPageNo(1);
        dispatch(hideOnboarding());
      }}
      title={
        pageNo === 1
          ? 'Welcome to Keeper \nConcierge (Beta)'
          : pageNo === 2
          ? 'Cautions and Encouragements'
          : 'Share data for analytics:'
      }
      subTitle=""
      modalBackground={`${colorMode}.modalGreenBackground`}
      textColor={`${colorMode}.modalGreenContent`}
      Content={LinkedWalletContent}
      DarkCloseIcon
      showCloseIcon={false}
      buttonText=""
      buttonTextColor={`${colorMode}.modalWhiteButtonText`}
      buttonBackground={`${colorMode}.modalWhiteButton`}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    marginVertical: 5,
  },
  contentText: {
    marginTop: hp(10),
    color: 'white',
    fontSize: 13,
    letterSpacing: 0.65,
    padding: 1,
    marginBottom: 10,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    borderWidth: 1,
    borderColor: '#FDF7F0',
  },
});

export default ConciergeOnboardingModal;
