import { Box, KeyboardAvoidingView, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Platform } from 'react-native';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import KeeperTextInput from 'src/components/KeeperTextInput';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useConfigRecovery from 'src/hooks/useConfigReocvery';
import useIsSmallDevices from 'src/hooks/useSmallDevices';
import SignerCard from '../AddSigner/SignerCard';
import { getSignerDescription, getSignerNameFromType } from 'src/hardware';
import { SDIcons } from './SigningDeviceIcons';
import { CommonActions } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { resetSignersUpdateState } from 'src/store/reducers/bhr';

export const ImportedWalletSetup = ({ navigation, route }) => {
  const { vaultConfig } = route?.params;
  const { colorMode } = useColorMode();
  const { createVault } = useConfigRecovery();
  const { common, wallet: walletText, importWallet } = useContext(LocalizationContext).translations;
  const [vaultDetails, setVaultDetails] = useState(null);
  const [vaultName, setVaultName] = useState('Imported wallet');
  const [vaultDesc, setVaultDesc] = useState('Secure your sats');
  const isSmallDevice = useIsSmallDevices();
  const [signers, setSigners] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const { signers, miniscriptElements, scheme, vaultSigners } = vaultConfig;
    setSigners(signers);
    setVaultDetails({ miniscriptElements, scheme, vaultSigners });
  }, []);

  const updateSignerType = (selectedSigner) => {
    dispatch(resetSignersUpdateState());
    navigation.dispatch(
      CommonActions.navigate({
        name: 'AssignSignerType',
        params: {
          parentNavigation: navigation,
          signer: selectedSigner,
          isImportFlow: true,
          onTypeSelection: (type) => {
            const updatedSigners = signers.map((signer) => {
              if (signer.id === selectedSigner.id) {
                signer.type = type;
                signer.signerName = getSignerNameFromType(type, signer.isMock);
              }
              return signer;
            });
            setSigners(updatedSigners);
          },
        },
      })
    );
  };

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.scrollViewWrapper}
      >
        <WalletHeader title={walletText.confirmWalletDetail} />

        <ScrollView
          contentContainerStyle={{ flex: 1, justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
        >
          <FieldWithLabel
            testID="input_imported_wallet_name"
            label={importWallet.editWalletName}
            value={vaultName}
            onChangeText={setVaultName}
            maxLength={18}
          />
          <FieldWithLabel
            testID="input_imported_wallet_desc"
            label={importWallet.editWalletDesc}
            value={vaultDesc}
            onChangeText={setVaultDesc}
            maxLength={20}
          />

          <Box flexDirection={'row'}>
            <Text fontSize={14} medium style={{ flex: 1 }}>
              {walletText.yourWalletKey}
              {vaultDetails?.signers?.length > 1 ? 's' : ''}
            </Text>
          </Box>
          <Box
            flexDirection={'row'}
            flex={1}
            marginTop={isSmallDevice ? hp(4) : hp(6)}
            flexWrap={'wrap'}
          >
            {signers.length &&
              signers?.map((signer) => {
                return (
                  <SignerCard
                    key={signer.id}
                    name={signer.signerName}
                    description={getSignerDescription(signer)}
                    icon={SDIcons({ type: signer.type }).Icon}
                    image={signer?.extraData?.thumbnailPath}
                    showSelection={false}
                    isFullText
                    colorVarient="green"
                    colorMode={colorMode}
                    onCardSelect={(signer) => updateSignerType(signer)}
                    isSelected={signer}
                  />
                );
              })}
          </Box>
        </ScrollView>
        <Box style={styles.footer}>
          <Buttons
            primaryText={common.done}
            primaryCallback={() => {
              createVault(
                vaultDetails.scheme,
                signers,
                vaultDetails.vaultSigners,
                vaultDetails.miniscriptElements,
                vaultName,
                vaultDesc
              );
            }}
            fullWidth
          />
        </Box>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollViewWrapper: {
    flex: 1,
  },
  fieldsContainer: {
    marginTop: hp(10),
  },
  inputFieldWrapper: {
    borderRadius: 10,
    marginRight: wp(10),
  },
  footer: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

const FieldWithLabel = ({ value, onChangeText, testID, label, maxLength }) => {
  return (
    <Box style={styles.fieldsContainer}>
      <Text fontSize={14} medium>
        {label}
      </Text>
      <Box style={styles.inputFieldWrapper}>
        <KeeperTextInput
          placeholder={''}
          value={value}
          onChangeText={onChangeText}
          maxLength={maxLength}
          testID={testID}
        />
      </Box>
    </Box>
  );
};
