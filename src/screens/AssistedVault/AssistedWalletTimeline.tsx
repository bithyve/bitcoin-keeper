import React from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import TimelineItem from './components/TimeLineItem';
import WalletIcon from 'src/assets/images/wallet-white-icon.svg';
import BellIcon from 'src/assets/images/bell-white-icon.svg';
import SingleKeyIcon from 'src/assets/images/single-key-white-icon.svg';
import AssistedVaultIcon from 'src/assets/images/assisted-vault-white-icon.svg';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { VAULTDETAILS } from 'src/navigation/contants';

type RouteParams = {
  parentScreen?: string;
};

type AssistedWalletTimelineProps = {
  route: {
    params: RouteParams;
  };
};

function AssistedWalletTimeline({
  route: { params: { parentScreen = '' } = {} },
}: AssistedWalletTimelineProps) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();

  const isVaultDetails = parentScreen === VAULTDETAILS;

  const timelineData = [
    {
      icon: <WalletIcon />,
      title: 'Wallet Creation',
      description: 'One User Key, two Advisor Keys',
      phaseInfo: { duration: '~ 2 years', phase: 'Standard Phase' },
    },
    {
      icon: <BellIcon />,
      title: 'Start receiving notifications',
      description: 'Receive weekly renew notification',
      phaseInfo: { duration: '~ 3 months', phase: 'Renew Phase' },
    },
    {
      icon: <SingleKeyIcon />,
      title: 'Downgrade to single-key',
      description: 'User Key can renew or transfer funds',
      phaseInfo: { duration: '~ 1 month', phase: 'Emergency Window' },
    },
    {
      icon: <AssistedVaultIcon />,
      title: 'Assisted Keys can sign',
      description: '2 Assisted Keys can also transfer funds',
      phaseInfo: { duration: 'Till renewed or transferred', phase: 'Inheritance Phase' },
    },
  ];

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryGreenBackground`}>
      <KeeperHeader
        simple
        title="Assisted Wallet Timeline"
        titleColor={`${colorMode}.whiteText`}
        contrastScreen
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {timelineData.map((item, index) => (
          <TimelineItem
            key={index}
            icon={item.icon}
            title={item.title}
            description={item.description}
            phaseInfo={item.phaseInfo}
            index={index}
            isLast={index === timelineData.length - 1}
          />
        ))}
        {!isVaultDetails && (
          <>
            <Text style={styles.faqText} color={`${colorMode}.whiteText`}>
              For FAQs please visit our website
            </Text>
            <Box style={styles.createWalletButton}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('SetupAssistedVault');
                }}
              >
                <Box backgroundColor={`${colorMode}.modalWhiteButton`} style={styles.cta}>
                  <Text style={styles.ctaText} color={`${colorMode}.modalWhiteButtonText`} bold>
                    Create Wallet
                  </Text>
                </Box>
              </TouchableOpacity>
            </Box>
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: wp(10),
    marginTop: hp(10),
    flexGrow: 1,
    paddingBottom: hp(50),
  },
  faqText: {
    marginTop: hp(60),
    marginBottom: hp(27),
    fontSize: 14,
  },
  createWalletButton: {
    alignSelf: 'flex-end',
  },
  cta: {
    borderRadius: 10,
    width: wp(142),
    height: hp(42),
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 13,
    letterSpacing: 1,
  },
});

export default AssistedWalletTimeline;
