import { Box, ScrollView, useColorMode } from 'native-base';
import { useContext, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Breadcrumbs from 'src/components/Breadcrumbs';
import Buttons from 'src/components/Buttons';
import KeeperHeader from 'src/components/KeeperHeader';
import Text from 'src/components/KeeperText';
import KeeperTextInput from 'src/components/KeeperTextInput';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import config from 'src/core/config';
import { DerivationPurpose, EntityKind } from 'src/core/wallets/enums';
import WalletUtilities from 'src/core/wallets/operations/utils';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';

function WalletPathScreen({ route }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet, common } = translations;

  const [showPurpose, setShowPurpose] = useState(false);
  const [purpose, setPurpose] = useState(route.params?.purpose);
  const [path, setPath] = useState(
    route.params?.path
      ? route.params?.path
      : WalletUtilities.getDerivationPath(EntityKind.WALLET, config.NETWORK_TYPE, 0, purpose)
  );

  const purposeList = [
    { label: wallet.purposelabel01, value: DerivationPurpose.BIP44 },
    { label: wallet.purposelabel02, value: DerivationPurpose.BIP49 },
    { label: wallet.purposelabel03, value: `${DerivationPurpose.BIP84}` },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={'Import'}
        subtitle={wallet.AddNewWalletDescription}
        //To-Do-Learn-More
      />
      <Box style={{ flex: 1, justifyContent: 'space-between' }}>
        <Box style={styles.fieldsContainer}>
          <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.inputFieldWrapper}>
            <KeeperTextInput
              placeholder={'Paste Wallet Path'}
              placeholderTextColor={`${colorMode}.SlateGreen`}
              height={10}
              value={path}
              onChangeText={(value) => {
                setPath(value);
              }}
              testID={`import_wallet_path`}
            />
          </Box>
          <TouchableOpacity onPress={() => setShowPurpose(!showPurpose)}>
            <Box
              backgroundColor={`${colorMode}.seashellWhite`}
              style={[
                styles.dropdown,
                showPurpose
                  ? {
                      borderTopLeftRadius: 10,
                      borderTopRightRadius: 10,
                    }
                  : { borderRadius: 10 },
              ]}
            >
              <Text color={`${colorMode}.SlateGreen`}>Select Wallet Purpose</Text>
              <Box style={styles.rightElem}>
                <Box backgroundColor={`${colorMode}.PaleIvory`} style={styles.verticalLine} />
                <Box
                  style={{
                    transform: [{ rotate: showPurpose ? '-90deg' : '90deg' }],
                  }}
                >
                  <RightArrowIcon />
                </Box>
              </Box>
            </Box>
          </TouchableOpacity>

          {showPurpose && (
            <ScrollView
              backgroundColor={`${colorMode}.seashellWhite`}
              style={styles.langScrollViewWrapper}
            >
              {purposeList.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => {
                    setShowPurpose(false);
                    setPurpose(item.value);
                  }}
                  style={styles.flagWrapper1}
                >
                  <Text
                    color={
                      item.value === purpose ? `${colorMode}.headerText` : `${colorMode}.GreyText`
                    }
                    bold={item.value === purpose}
                    style={styles.purposeText}
                  >
                    {item.label}
                  </Text>
                  <Box backgroundColor={`${colorMode}.DarkSage`} style={styles.horizontalLine} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Box>
        <Box style={styles.footer}>
          <Breadcrumbs totalScreens={4} currentScreen={3} />
          <Buttons
            primaryText={`${common.proceed}`}
            primaryCallback={() => {}}
            primaryDisable={!path}
            // primaryLoading={walletLoading || relayWalletUpdateLoading}
          />
        </Box>
      </Box>
    </ScreenWrapper>
  );
}

export default WalletPathScreen;

const styles = StyleSheet.create({
  fieldsContainer: {
    marginVertical: 40,
    marginHorizontal: 20,
    gap: hp(10),
  },
  inputFieldWrapper: {
    borderRadius: 10,
  },
  dropdown: {
    width: '100%',
    marginTop: 12,
    height: hp(50),
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footer: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langScrollViewWrapper: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingVertical: 10,
  },
  flagWrapper1: {
    height: wp(40),
    gap: 10,
    justifyContent: 'center',
  },

  purposeText: {
    fontSize: 13,
    marginLeft: wp(20),
    letterSpacing: 0.6,
  },
  horizontalLine: {
    width: '95%',
    height: 2,
    alignSelf: 'center',
    opacity: 0.3,
  },
  rightElem: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verticalLine: {
    width: 2,
    height: 25,
  },
});
