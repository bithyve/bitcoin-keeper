import React, { useContext, useState } from 'react';
import { Box, ScrollView, Text, useColorMode } from 'native-base';
import { Share, StyleSheet } from 'react-native';
import KeeperHeader from 'src/components/KeeperHeader';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import IconShare from 'src/assets/images/upload-black.svg';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { useRoute } from '@react-navigation/native';
import { captureError } from 'src/services/sentry';
import ShareWithNfc from '../NFCChannel/ShareWithNfc';
import KeeperQRCode from 'src/components/KeeperQRCode';
import DisplayQR from '../QRScreens/DisplayQR';
import TabBar from 'src/components/TabBar';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const ConfigQR = ({ isInheritanceVault, descriptorString, activeTab }) => {
  return isInheritanceVault ? (
    <Box style={styles.IKConfigContainer}>
      {activeTab === 0 ? (
        <KeeperQRCode size={windowWidth * 0.7} ecl="L" qrData={descriptorString} />
      ) : (
        <DisplayQR
          qrContents={Buffer.from(descriptorString, 'ascii').toString('hex')}
          toBytes
          type="hex"
        />
      )}
    </Box>
  ) : (
    <KeeperQRCode size={windowWidth * 0.7} ecl="L" qrData={descriptorString} />
  );
};

function GenerateVaultDescriptor() {
  const route = useRoute();
  const { descriptorString, vaultId, isInheritanceVault } = route.params as {
    descriptorString: string;
    vaultId: string;
    isInheritanceVault: boolean;
  };
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText } = translations;
  const [activeTab, setActiveTab] = useState(0);
  const tabsData = [
    {
      label: vaultText.staticQR,
    },
    {
      label: vaultText.animatedQR,
    },
  ];

  const onShare = async () => {
    try {
      await Share.share({ message: descriptorString });
    } catch (error) {
      captureError(error);
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Vault Configuration File"
        subtitle="The vault configuration file is used to restore the vault on other devices."
      />
      <Box style={styles.container}>
        {isInheritanceVault && (
          <Box style={styles.tabBarContainer}>
            <TabBar
              radius={7}
              width="95%"
              tabs={tabsData}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </Box>
        )}
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <ConfigQR
            isInheritanceVault={isInheritanceVault}
            descriptorString={descriptorString}
            activeTab={activeTab}
          />
          <TouchableOpacity onPress={onShare}>
            <Box
              style={styles.inputWrapper}
              backgroundColor={`${colorMode}.seashellWhite`}
              borderColor={`${colorMode}.dullGreyBorder`}
            >
              <Box style={styles.textWrapper}>
                <Text noOfLines={2}>{descriptorString}</Text>
              </Box>
              <Box style={styles.iconShare} backgroundColor={`${colorMode}.accent`}>
                <IconShare style={styles.iconShare} />
              </Box>
            </Box>
          </TouchableOpacity>
          <Box style={{ paddingBottom: '10%' }}>
            <ShareWithNfc data={descriptorString} fileName={`${vaultId}-backup.txt`} />
          </Box>
        </ScrollView>
      </Box>
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
    marginTop: hp(30),
    alignItems: 'center',
  },
  tabBarContainer: {
    marginTop: hp(30),
    marginBottom: hp(10),
  },
  inputWrapper: {
    borderRadius: 12,
    flexDirection: 'row',
    height: 75,
    width: '91%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: hp(30),
    marginBottom: hp(30),
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
});
