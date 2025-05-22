import { Box, useColorMode } from 'native-base';
import React, { useContext, useState, useEffect } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import { useNavigation } from '@react-navigation/native';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useSignerMap from 'src/hooks/useSignerMap';
import { Signer, Vault } from 'src/services/wallets/interfaces/vault';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { useDispatch } from 'react-redux';
import WalletUtilities from 'src/services/wallets/operations/utils';
import useVault from 'src/hooks/useVault';
import { useAppSelector } from 'src/store/hooks';
import { getKeyUID } from 'src/utils/utilities';
import OptionPicker from 'src/components/OptionPicker';
import { getSignerDescription } from 'src/hardware';
import IKSInfocard from './components/IKSInfoCard';
import { SDIcons } from './SigningDeviceIcons';
import VaultMigrationController from './VaultMigrationController';
import { EMERGENCY_TIMELOCK_DURATIONS } from './AddEmergencyKey';
import {
  EMERGENCY_KEY_IDENTIFIER,
  getKeyTimelock,
  getVaultEnhancedSigners,
} from 'src/services/wallets/operations/miniscript/default/EnhancedVault';
import WalletHeader from 'src/components/WalletHeader';
import { isVaultUsingBlockHeightTimelock } from 'src/services/wallets/factories/VaultFactory';

function ResetEmergencyKey({ route }) {
  const {
    inheritanceKeys = [],
    initialTimelockDuration = 0,
    vault,
  }: { inheritanceKeys; initialTimelockDuration; vault: Vault } = route.params;
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { signerMap } = useSignerMap();
  const { translations } = useContext(LocalizationContext);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
  const { emergencySigners, otherSigners } = getVaultEnhancedSigners(vault);
  const signers: Signer[] = emergencySigners.map(
    (emergencySigner) => signerMap[getKeyUID(emergencySigner)]
  );
  const { vault: vaultText, common } = translations;
  const { showToast } = useToastMessage();
  const [generatedVaultId, setGeneratedVaultId] = useState('');
  const { allVaults } = useVault({ includeArchived: false });
  const newVault = allVaults.filter((v) => v.id === generatedVaultId)[0];
  const [vaultCreating, setCreating] = useState(false);
  const [currentBlockHeight, setCurrentBlockHeight] = useState(null);
  const [activationTimes, setActivationTimes] = useState<Record<string, string>>({});

  const { relayVaultUpdate, relayVaultError, realyVaultErrorMessage } = useAppSelector(
    (state) => state.bhr
  );

  const dispatch = useDispatch();

  const handleResetEmergencyKey = async () => {
    const hasAllSelections = emergencySigners
      .map((signer) => getKeyUID(signer))
      .every((id) => selectedOptions[id]);
    if (!hasAllSelections) {
      showToast(
        'Please select activation time' +
          (emergencySigners.length === 1 ? '' : 'for all emergency keys'),
        <ToastErrorIcon />
      );
      setCreating(false);
      return;
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
        return;
      }
    }
  };

  useEffect(() => {
    WalletUtilities.fetchCurrentBlockHeight()
      .then(({ currentBlockHeight }) => {
        setCurrentBlockHeight(currentBlockHeight);
      })
      .catch((err) => showToast(err));
  }, []);

  useEffect(() => {
    try {
      if (isVaultUsingBlockHeightTimelock(vault) && !currentBlockHeight) {
        setActivationTimes((prev) => {
          const newTimes = {};
          signers.forEach((signer) => {
            newTimes[getKeyUID(signer)] = 'Loading time until activation...';
          });
          return newTimes;
        });
        return;
      }

      signers.forEach((signer) => {
        let secondsUntilActivation = 0;

        if (isVaultUsingBlockHeightTimelock(vault)) {
          const blocksUntilActivation =
            getKeyTimelock(
              Object.entries(vault.scheme.miniscriptScheme.keyInfoMap)
                .find(
                  ([identifier, descriptor]) =>
                    identifier.startsWith(EMERGENCY_KEY_IDENTIFIER) &&
                    descriptor.substring(1, 9) === signer.masterFingerprint
                )[0]
                .split('<')[0],
              vault.scheme.miniscriptScheme.miniscriptElements
            ) - currentBlockHeight;

          secondsUntilActivation = blocksUntilActivation * 10 * 60;
        } else {
          secondsUntilActivation =
            getKeyTimelock(
              Object.entries(vault.scheme.miniscriptScheme.keyInfoMap)
                .find(
                  ([identifier, descriptor]) =>
                    identifier.startsWith(EMERGENCY_KEY_IDENTIFIER) &&
                    descriptor.substring(1, 9) === signer.masterFingerprint
                )[0]
                .split('<')[0],
              vault.scheme.miniscriptScheme.miniscriptElements
            ) - Math.floor(Date.now() / 1000);
        }

        let timeString = '';

        if (secondsUntilActivation > 0) {
          const days = Math.floor(secondsUntilActivation / (24 * 60 * 60));
          const months = Math.floor(days / 30);

          if (months > 0) {
            timeString = `${months} month${months > 1 ? 's' : ''}`;
          } else if (days > 0) {
            timeString = `${days} day${days > 1 ? 's' : ''}`;
          } else {
            const hours = Math.floor(secondsUntilActivation / 3600);
            const minutes = Math.floor((secondsUntilActivation % 3600) / 60);
            timeString = `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${
              minutes > 1 ? 's' : ''
            }`;
          }
        } else {
          timeString = vaultText.EKAlreadyActive;
        }

        setActivationTimes((prev) => ({
          ...prev,
          [getKeyUID(signer)]: timeString.includes('active')
            ? timeString
            : `Activates in ${timeString}`,
        }));
      });
    } catch {
      showToast(
        'Failed to check current activation time for Emergency Key',
        null,
        IToastCategory.DEFAULT,
        3000,
        true
      );
    }
  }, [currentBlockHeight, vault]);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        title={vaultText.resetEKTitle + (emergencySigners.length > 1 ? 's' : '')}
        subTitle={vaultText.resetEKDesc + (emergencySigners.length > 1 ? 's' : '')}
      />
      <Box style={styles.container}>
        {signers.map((signer) => (
          <Box key={getKeyUID(signer)} style={styles.contentContainer}>
            <IKSInfocard
              name={signer?.signerName}
              description={getSignerDescription(signer)}
              Icon={SDIcons({ type: signer?.type })?.Icon}
              duration={activationTimes[getKeyUID(signer)]}
            />
            <Box style={styles.dropdownContainer}>
              <Box>
                <Text color={`${colorMode}.primaryText`} fontSize={15}>
                  {vaultText.chooseNewActivationTimeTitle}
                </Text>
                <Text color={`${colorMode}.secondaryText`} fontSize={12}>
                  {vaultText.chooseNewActivationTimeDesc}
                </Text>
              </Box>
              <OptionPicker
                label={vaultText.selectActivationTime}
                options={EMERGENCY_TIMELOCK_DURATIONS}
                selectedOption={selectedOptions[getKeyUID(signer)]}
                onOptionSelect={(option) =>
                  setSelectedOptions((prev) => ({
                    ...prev,
                    [getKeyUID(signer)]: option,
                  }))
                }
              />
            </Box>
          </Box>
        ))}
        <Box>
          <Buttons
            primaryLoading={vaultCreating}
            primaryText={vaultText.revaultNow}
            fullWidth
            primaryCallback={() => {
              setCreating(true);
              handleResetEmergencyKey();
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
        inheritanceKeys={inheritanceKeys}
        emergencyKeys={emergencySigners.map((signer) => ({
          key: signer,
          duration: selectedOptions[getKeyUID(signer)]?.label,
        }))}
        initialTimelockDuration={initialTimelockDuration ?? 0}
        currentBlockHeight={currentBlockHeight}
        miniscriptTypes={vault.scheme.miniscriptScheme.usedMiniscriptTypes}
      />
    </ScreenWrapper>
  );
}

export default ResetEmergencyKey;

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
