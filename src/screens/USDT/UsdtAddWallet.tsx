import { Box, useColorMode } from 'native-base';
import React, { useContext, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';
import KeeperTextInput from 'src/components/KeeperTextInput';
import ScreenWrapper from 'src/components/ScreenWrapper';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import WalletHeader from 'src/components/WalletHeader';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import Buttons from 'src/components/Buttons';
import { CommonActions, useNavigation } from '@react-navigation/native';

const AddUsdtWallet = () => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const {
    usdtWalletText,
    wallet: walletText,
    importWallet,
    vault: vaultText,
    common,
  } = translations;
  const [walletName, setWalletName] = useState('');
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const descriptionInputRef = useRef('ustd wallet');
  const initialDescription = useRef(descriptionInputRef.current);
  const { showToast } = useToastMessage();
  const navigation = useNavigation();

  const onDescriptionChange = (value) => {
    descriptionInputRef.current = value;
  };
  const navigationState = {
    name: 'Home',
    params: { selectedOption: 'Wallets' },
  };

  //   states to use
  // For wallet name {walletName}
  // For description {descriptionInputRef.current}
  // For navigation {navigationState}

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <Box flex={1}>
        <WalletHeader
          title={usdtWalletText.addWalletDetails}
          subTitle={usdtWalletText.dedicatedWalletSub}
        />
        <Box style={styles.fieldsContainer}>
          <Text fontSize={14} medium>
            {walletText.yourWalletName}
          </Text>
          <Box style={styles.inputFieldWrapper}>
            <KeeperTextInput
              placeholder={walletText.WalletNamePlaceHolder}
              value={walletName}
              onChangeText={(value) => {
                setWalletName(value);
              }}
              maxLength={18}
              testID="input_wallet_name"
            />
          </Box>
          <Pressable
            onPress={() => {
              setShowDescriptionModal(true);
              initialDescription.current = descriptionInputRef.current;
            }}
          >
            <Box style={styles.descriptionContainer}>
              <Text color={`${colorMode}.greenText`}>{importWallet.addDescription}</Text>
              <ThemedSvg name={'add_circle'} />
            </Box>
          </Pressable>
        </Box>
      </Box>
      <Box style={styles.footer}>
        <Buttons
          primaryText={walletText.createYourWallet}
          primaryCallback={() => {
            navigation.dispatch(CommonActions.navigate(navigationState));
            showToast(<TickIcon />);
          }}
          primaryDisable={!walletName}
          fullWidth
        />
      </Box>

      <KeeperModal
        visible={showDescriptionModal}
        close={() => setShowDescriptionModal(false)}
        title={importWallet.addDescription}
        subTitle={vaultText.vaultEditSubtitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        showCloseIcon={false}
        Content={() => {
          const [description, setDescription] = useState(descriptionInputRef.current);

          return (
            <Box style={styles.descriptionInput}>
              <KeeperTextInput
                placeholder={walletText.addOptionalDesc}
                value={description}
                onChangeText={(value) => {
                  setDescription(value);
                  descriptionInputRef.current = value;
                  onDescriptionChange(value);
                }}
                testID="vault_description"
                maxLength={20}
              />
            </Box>
          );
        }}
        buttonText={common.saveChanges}
        buttonCallback={() => {
          setShowDescriptionModal(false);
          showToast(walletText.descriptionAddedSuccessfully, <TickIcon />);
        }}
        secondaryButtonText={common.cancel}
        secondaryCallback={() => {
          descriptionInputRef.current = initialDescription.current;
          setShowDescriptionModal(false);
        }}
      />
    </ScreenWrapper>
  );
};

export default AddUsdtWallet;

const styles = StyleSheet.create({
  descriptionContainer: {
    width: '100%',
    height: hp(30),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(5),
  },
  inputFieldWrapper: {
    borderRadius: 10,
    marginRight: wp(10),
  },
  fieldsContainer: {
    marginTop: hp(30),
    marginBottom: hp(50),
    gap: hp(10),
  },
  descriptionInput: {
    marginBottom: hp(10),
  },
  footer: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
