import { Box, Select, useColorMode } from 'native-base';
import { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import Breadcrumbs from 'src/components/Breadcrumbs';
import Buttons from 'src/components/Buttons';
import KeeperHeader from 'src/components/KeeperHeader';
import KeeperTextInput from 'src/components/KeeperTextInput';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import config from 'src/utils/service-utilities/config';
import { DerivationPurpose, EntityKind } from 'src/services/wallets/enums';
import WalletUtilities from 'src/services/wallets/operations/utils';

function WalletPathScreen({ route }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet, common } = translations;

  const [purpose, setPurpose] = useState(route.params?.purpose);
  const [path, setPath] = useState(
    route.params?.path
      ? route.params?.path
      : WalletUtilities.getDerivationPath(EntityKind.WALLET, config.NETWORK_TYPE, 0, purpose)
  );

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Import"
        subtitle={wallet.AddNewWalletDescription}
        // To-Do-Learn-More
      />
      <Box style={{ flex: 1, justifyContent: 'space-between' }}>
        <Box style={styles.fieldsContainer}>
          <Box style={styles.inputFieldWrapper}>
            <KeeperTextInput
              placeholder="Paste Wallet Path"
              placeholderTextColor={`${colorMode}.SlateGreen`}
              height={10}
              value={path}
              onChangeText={(value) => {
                setPath(value);
              }}
              testID="import_wallet_path"
            />
          </Box>
          <Select
            backgroundColor={`${colorMode}.seashellWhite`}
            borderColor={`${colorMode}.seashellWhite`}
            selectedValue={purpose}
            minWidth="200"
            accessibilityLabel={common.chooseService}
            placeholder={common.choosePurpose}
            placeholderTextColor={`${colorMode}.SlateGreen`}
            onValueChange={(itemValue) => setPurpose(itemValue)}
            style={styles.dropdown}
          >
            <Select.Item label={wallet.purposelabel01} value={`${DerivationPurpose.BIP44}`} />
            <Select.Item label={wallet.purposelabel02} value={`${DerivationPurpose.BIP49}`} />
            <Select.Item label={wallet.purposelabel03} value={`${DerivationPurpose.BIP84}`} />
          </Select>
        </Box>
        <Box style={styles.footer}>
          <Breadcrumbs totalScreens={4} currentScreen={3} />
          <Buttons
            primaryText={`${common.proceed}`}
            primaryCallback={() => route.params.createNewWallet(path, purpose)}
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
    marginHorizontal: 10,
    gap: hp(10),
  },
  inputFieldWrapper: {
    borderRadius: 10,
  },
  dropdown: {
    height: hp(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
