import React, { useEffect, useState, useContext } from 'react';
import { Box, useColorMode } from 'native-base';
import { Signer, Vault, VaultSigner } from 'src/services/wallets/interfaces/vault';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { hp, wp } from 'src/constants/responsive';
import SignerCard from 'src/screens/AddSigner/SignerCard';
import { getSignerDescription, getSignerNameFromType } from 'src/hardware';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';
import Text from 'src/components/KeeperText';
import TimerOutlineLight from 'src/assets/images/timer-outline.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { StyleSheet } from 'react-native';
import {
  EMERGENCY_KEY_IDENTIFIER,
  getKeyTimelock,
  INHERITANCE_KEY_IDENTIFIER,
} from 'src/services/wallets/operations/miniscript/default/EnhancedVault';
import { isVaultUsingBlockHeightTimelock } from 'src/services/wallets/factories/VaultFactory';

function EnhancedKeysSection({
  vault,
  keys,
  currentMedianTimePast,
  currentBlockHeight,
  handleCardSelect,
  setCurrentBlockHeight,
  setCurrentMedianTimePast,
}: {
  vault: Vault;
  keys: { key: Signer; keyMeta: VaultSigner; identifier: string }[];
  currentBlockHeight: number | null;
  currentMedianTimePast: number | null;
  handleCardSelect: (
    signer: Signer,
    item: VaultSigner,
    isInheritanceKey: boolean,
    isEmergencyKey: boolean
  ) => void;
  setCurrentBlockHeight: (blockHeight: number | null) => void;
  setCurrentMedianTimePast: (medianTimePast: number | null) => void;
}) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText } = translations;
  const [currentTimeUntilActivation, setCurrentTimeUntilActivation] = useState('');

  useEffect(() => {
    if (isVaultUsingBlockHeightTimelock(vault)) {
      WalletUtilities.fetchCurrentBlockHeight()
        .then(({ currentBlockHeight }) => {
          setCurrentBlockHeight(currentBlockHeight);
        })
        .catch((err) => showToast(err));
    } else {
      WalletUtilities.fetchCurrentMedianTime()
        .then(({ currentMedianTime }) => {
          setCurrentMedianTimePast(currentMedianTime);
        })
        .catch((err) => showToast(err));
    }
  }, [setCurrentBlockHeight, setCurrentMedianTimePast, showToast, vault]);

  useEffect(() => {
    if (!keys.length || (isVaultUsingBlockHeightTimelock(vault) && currentBlockHeight === null))
      return;

    try {
      let secondsUntilActivation = 0;

      if (isVaultUsingBlockHeightTimelock(vault)) {
        const blocksUntilActivation =
          getKeyTimelock(keys[0].identifier, vault.scheme.miniscriptScheme.miniscriptElements) -
          currentBlockHeight;

        secondsUntilActivation = blocksUntilActivation * 10 * 60;
      } else {
        secondsUntilActivation =
          getKeyTimelock(keys[0].identifier, vault.scheme.miniscriptScheme.miniscriptElements) -
          currentMedianTimePast;
      }

      if (secondsUntilActivation > 0) {
        const days = Math.floor(secondsUntilActivation / (24 * 60 * 60));
        const months = Math.floor(days / 30);

        let timeString = '';
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

        setCurrentTimeUntilActivation(`${timeString}`);
      } else {
        setCurrentTimeUntilActivation(translations.vault.EnhancedKeyAlreadyActive);
      }
    } catch {
      showToast(vaultText.failedToCheckIKActivationTime, null, IToastCategory.DEFAULT, 3000, true);
    }
  }, [currentBlockHeight, keys, translations, vault, showToast]);

  if (!keys) return null;

  return (
    <Box style={styles.container}>
      <Box style={styles.headerContainer}>
        {currentTimeUntilActivation && (
          <Box>
            {currentTimeUntilActivation === vaultText.EnhancedKeyAlreadyActive ? (
              <Text fontSize={14} medium color={`${colorMode}.greenishGreyText`}>
                {keys.length > 1
                  ? vaultText.EnhancedKeysAlreadyActive
                  : vaultText.EnhancedKeyAlreadyActive}
              </Text>
            ) : (
              <>
                <Text fontSize={14} medium color={`${colorMode}.greenishGreyText`}>
                  {vaultText.EnhancedKeyActivatesIn}
                </Text>
                <Box style={styles.timerContainer}>
                  <TimerOutlineLight width={wp(14)} height={wp(14)} />
                  <Text fontSize={12} color={`${colorMode}.greenText`}>
                    {currentTimeUntilActivation}
                  </Text>
                </Box>
              </>
            )}
          </Box>
        )}
      </Box>
      {keys.map((key, index) => (
        <SignerCard
          key={index}
          onCardSelect={() =>
            handleCardSelect(
              key.key,
              key.keyMeta,
              key.identifier.startsWith(INHERITANCE_KEY_IDENTIFIER),
              key.identifier.startsWith(EMERGENCY_KEY_IDENTIFIER)
            )
          }
          name={`${getSignerNameFromType(key.key.type, false, false)}`}
          description={getSignerDescription(key.key)}
          icon={SDIcons({ type: key.key.type, light: true }).Icon}
          image={key?.key.extraData?.thumbnailPath}
          showSelection={false}
          showDot={false}
          colorVarient="green"
          colorMode={colorMode}
          badgeText={
            key.identifier.startsWith(INHERITANCE_KEY_IDENTIFIER)
              ? 'Inheritance Key'
              : key.identifier.startsWith(EMERGENCY_KEY_IDENTIFIER)
              ? 'Emergency Key'
              : ''
          }
        />
      ))}
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: hp(20),
  },
  headerContainer: {
    marginTop: hp(30),
    marginBottom: hp(20),
    gap: hp(2.5),
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
});

export default EnhancedKeysSection;
