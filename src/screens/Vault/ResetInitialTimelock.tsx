import { Box, useColorMode } from 'native-base';
import React, { useContext, useState, useEffect } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { Vault } from 'src/services/wallets/interfaces/vault';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import WalletUtilities from 'src/services/wallets/operations/utils';
import OptionPicker from 'src/components/OptionPicker';
import VaultMigrationController from './VaultMigrationController';
import { getVaultEnhancedSigners } from 'src/services/wallets/operations/miniscript/default/EnhancedVault';
import WalletHeader from 'src/components/WalletHeader';
import { INITIAL_TIMELOCK_DURATIONS } from './SelectInitialTimelock';

function ResetInitialTimelock({ route }) {
  const { vault }: { signerIds: string[]; vault: Vault } = route.params;
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const [selectedOption, setSelectedOption] = useState<any>('');
  const { inheritanceSigners, emergencySigners, otherSigners } = getVaultEnhancedSigners(vault);
  const hasInheritanceKeys = inheritanceSigners.length > 0;
  const hasEmergencyKeys = emergencySigners.length > 0;

  const { vault: vaultText, common } = translations;
  const { showToast } = useToastMessage();
  const [generatedVaultId, setGeneratedVaultId] = useState('');
  const [vaultCreating, setCreating] = useState(false);
  const [currentBlockHeight, setCurrentBlockHeight] = useState(null);

  const handleResetInitialTimelock = async () => {
    if (!selectedOption) {
      showToast('Please select initial timelock time', <ToastErrorIcon />);
      setCreating(false);
      return false;
    }
    let currentSyncedBlockHeight = currentBlockHeight;
    if (!currentSyncedBlockHeight) {
      try {
        currentSyncedBlockHeight = (await WalletUtilities.fetchCurrentBlockHeight())
          .currentBlockHeight;
      } catch (err) {
        console.log('Failed to re-fetch current block height: ' + err);
      }
      if (!currentSyncedBlockHeight) {
        showToast(
          'Failed to fetch current chain data, please check your connection and try again',
          <ToastErrorIcon />
        );
        setCreating(false);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    WalletUtilities.fetchCurrentBlockHeight()
      .then(({ currentBlockHeight }) => {
        setCurrentBlockHeight(currentBlockHeight);
      })
      .catch((err) => showToast(err));
  }, []);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={vaultText.resetIKTitle} subTitle={vaultText.resetIKDesc} />
      <Box style={styles.container}>
        <OptionPicker
          label={vaultText.selectActivationTime}
          options={INITIAL_TIMELOCK_DURATIONS}
          selectedOption={selectedOption}
          onOptionSelect={(option) => setSelectedOption(option)}
        />
        <Box>
          <Buttons
            primaryLoading={vaultCreating}
            primaryText={
              hasInheritanceKeys || hasEmergencyKeys ? common.continue : vaultText.revaultNow
            }
            fullWidth
            primaryCallback={async () => {
              let isValid = await handleResetInitialTimelock();
              if (!isValid) return;
              if (hasInheritanceKeys) {
                navigation.dispatch(
                  CommonActions.navigate({
                    name: 'ResetInheritanceKey',
                    params: {
                      initialTimelockDuration: selectedOption?.label,
                      vault,
                    },
                  })
                );
              } else if (hasEmergencyKeys) {
                navigation.dispatch(
                  CommonActions.navigate({
                    name: 'ResetEmergencyKey',
                    params: {
                      initialTimelockDuration: selectedOption?.label,
                      vault,
                    },
                  })
                );
              } else {
                setCreating(true);
              }
            }}
          />
        </Box>
      </Box>
      <VaultMigrationController
        vaultCreating={vaultCreating}
        vaultKeys={otherSigners}
        scheme={vault.scheme}
        name={vault.presentationData.name}
        description={vault.presentationData.description}
        vaultId={vault.id}
        setGeneratedVaultId={setGeneratedVaultId}
        setCreating={setCreating}
        vaultType={vault.type}
        initialTimelockDuration={selectedOption?.label}
        currentBlockHeight={currentBlockHeight}
        miniscriptTypes={vault.scheme.miniscriptScheme.usedMiniscriptTypes}
      />
    </ScreenWrapper>
  );
}

export default ResetInitialTimelock;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: hp(40),
    paddingHorizontal: wp(10),
  },
  contentContainer: {
    flex: 1,
    gap: hp(30),
  },
  dropdownContainer: {
    gap: hp(15),
  },
});
