import React, { useContext, useState } from 'react';
import { Box, ScrollView, Text, useColorMode } from 'native-base';
import { Share, StyleSheet } from 'react-native';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import IconShare from 'src/assets/images/copy-icon.svg';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { useRoute } from '@react-navigation/native';
import { captureError } from 'src/services/sentry';
import KeeperQRCode from 'src/components/KeeperQRCode';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useVault from 'src/hooks/useVault';
import { generateOutputDescriptors } from 'src/utils/service-utilities/utils';
import WalletHeader from 'src/components/WalletHeader';
import MonthlyYearlySwitch from 'src/components/Switch/MonthlyYearlySwitch';
import DisplayQR from '../QRScreens/DisplayQR';

const ConfigQR = ({ isMiniscriptVault, descriptorString, activeTab }) => {
  return isMiniscriptVault ? (
    <Box style={styles.IKConfigContainer}>
      {!activeTab ? (
        <KeeperQRCode size={windowWidth * 0.8} ecl="L" qrData={descriptorString} />
      ) : (
        <DisplayQR
          qrContents={Buffer.from(descriptorString, 'ascii').toString('hex')}
          toBytes
          type="hex"
          size={windowWidth * 0.8}
        />
      )}
    </Box>
  ) : (
    <KeeperQRCode size={windowWidth * 0.8} ecl="L" qrData={descriptorString} />
  );
};

function GenerateVaultDescriptor() {
  const route = useRoute();
  const { vaultId, isMiniscriptVault } = route.params as {
    descriptorString: string;
    vaultId: string;
    isMiniscriptVault: boolean;
  };
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText } = translations;
  const [activeTab, setActiveTab] = useState(false);
  const { activeVault: vault } = useVault({ includeArchived: true, vaultId });
  const vaultDescriptorString = generateOutputDescriptors(vault);

  const onShare = async () => {
    try {
      await Share.share({ message: vaultDescriptorString });
    } catch (error) {
      captureError(error);
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={vaultText.WalletConfiguration} />
      <Text style={[styles.desc, { marginBottom: isMiniscriptVault ? hp(0) : hp(20) }]}>
        {vaultText.WalletConfigurationDesc}
      </Text>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {isMiniscriptVault && (
          <Box style={styles.tabBarContainer}>
            <MonthlyYearlySwitch
              title2={vaultText.animatedQR}
              title1={vaultText.staticQR}
              value={activeTab}
              onValueChange={() => setActiveTab(!activeTab)}
            />
          </Box>
        )}
        <Box style={styles.container}>
          <ConfigQR
            isMiniscriptVault={isMiniscriptVault}
            descriptorString={vaultDescriptorString}
            activeTab={activeTab}
          />
          <TouchableOpacity onPress={onShare}>
            <Box
              style={styles.inputWrapper}
              backgroundColor={`${colorMode}.seashellWhite`}
              borderColor={`${colorMode}.dullGreyBorder`}
            >
              <Box style={styles.textWrapper}>
                <Text noOfLines={2}>{vaultDescriptorString}</Text>
              </Box>
              <Box style={styles.iconShare} backgroundColor={`${colorMode}.LightGraycolor`}>
                <IconShare style={styles.iconShare} />
              </Box>
            </Box>
          </TouchableOpacity>
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
}

export default GenerateVaultDescriptor;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
  },
  tabBarContainer: {
    marginBottom: hp(10),
  },
  inputWrapper: {
    borderRadius: 12,
    flexDirection: 'row',
    height: 75,
    width: windowWidth * 0.87,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: hp(15),
    marginBottom: hp(20),
    paddingLeft: wp(20),
    paddingRight: wp(8),
    borderWidth: 1,
    gap: wp(20),
  },
  textWrapper: {
    flex: -1,
  },
  iconShare: {
    borderRadius: 10,
    width: wp(40),
    height: wp(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  IKConfigContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  desc: {
    marginTop: hp(15),
    fontSize: 15,
    width: '100%',
    lineHeight: 24,
  },
});
