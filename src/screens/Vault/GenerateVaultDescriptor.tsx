import React, { useContext, useEffect, useState } from 'react';
import { Box, ScrollView, Text, useColorMode } from 'native-base';
import { Share, StyleSheet } from 'react-native';
import KeeperHeader from 'src/components/KeeperHeader';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import IconShare from 'src/assets/images/upload-black.svg';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { captureError } from 'src/services/sentry';
import ShareWithNfc from '../NFCChannel/ShareWithNfc';
import KeeperQRCode from 'src/components/KeeperQRCode';
import DisplayQR from '../QRScreens/DisplayQR';
import TabBar from 'src/components/TabBar';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import OptionCTA from 'src/components/OptionCTA';
import GenerateSingleVaultFilePDF from 'src/utils/GenerateSingleVaultFilePDF';
import useVault from 'src/hooks/useVault';
import { generateOutputDescriptors } from 'src/utils/service-utilities/utils';
import DownloadPDF from 'src/assets/images/download-pdf-white.svg';
import CircleIconWrapper from 'src/components/CircleIconWrapper';

const ConfigQR = ({ isMiniscriptVault, descriptorString, activeTab }) => {
  return isMiniscriptVault ? (
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
  const { vaultId, isMiniscriptVault } = route.params as {
    descriptorString: string;
    vaultId: string;
    isMiniscriptVault: boolean;
  };
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText } = translations;
  const [activeTab, setActiveTab] = useState(0);
  const { activeVault: vault } = useVault({ includeArchived: true, vaultId });
  const vaultDescriptorString = generateOutputDescriptors(vault);
  const [fingerPrint, setFingerPrint] = useState(null);

  useEffect(() => {
    if (vault) {
      const vaultData = { name: vault.presentationData.name, file: vaultDescriptorString };
      setFingerPrint(vaultData);
    }
  }, []);

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
      await Share.share({ message: vaultDescriptorString });
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
        {isMiniscriptVault && (
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
              <Box style={styles.iconShare} backgroundColor={`${colorMode}.accent`}>
                <IconShare style={styles.iconShare} />
              </Box>
            </Box>
          </TouchableOpacity>
          <Box style={styles.optionsContainer}>
            <ShareWithNfc data={vaultDescriptorString} fileName={`${vaultId}-backup.txt`} />
            <OptionCTA
              icon={
                <CircleIconWrapper
                  width={wp(38)}
                  backgroundColor={`${colorMode}.pantoneGreen`}
                  icon={<DownloadPDF />}
                />
              }
              title={vaultText.exportPDF}
              callback={() => {
                GenerateSingleVaultFilePDF(fingerPrint).then((res) => {
                  if (res) {
                    navigation.navigate('PreviewPDF', { source: res });
                  }
                });
              }}
            />
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
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(20),
  },
});
