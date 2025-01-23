import React, { useEffect, useState, useMemo, useContext } from 'react';
import { Box, useColorMode } from 'native-base';
import { Signer, Vault, VaultSigner } from 'src/services/wallets/interfaces/vault';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import { INHERITANCE_KEY1_IDENTIFIER } from 'src/services/wallets/operations/miniscript/default/InheritanceVault';
import { getKeyUID } from 'src/utils/utilities';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { hp, wp } from 'src/constants/responsive';
import SignerCard from 'src/screens/AddSigner/SignerCard';
import { getSignerDescription, getSignerNameFromType } from 'src/hardware';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';
import Text from 'src/components/KeeperText';
import TimerOutlineLight from 'src/assets/images/timer-outline.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { StyleSheet } from 'react-native';

function InheritanceKeySection({
  vault,
  currentBlockHeight,
  signerMap,
  handleCardSelect,
  setCurrentBlockHeight,
}: {
  vault: Vault;
  currentBlockHeight: number | null;
  signerMap: Record<string, Signer>;
  handleCardSelect: (signer: Signer, item: VaultSigner, isInheritanceKey: boolean) => void;
  setCurrentBlockHeight: (blockHeight: number | null) => void;
}) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText } = translations;
  const [currentTimeUntilActivation, setCurrentTimeUntilActivation] = useState('');
  const inheritanceKeyMeta = useMemo(() => {
    return vault?.signers?.find(
      (signer) =>
        signer.masterFingerprint ===
        vault?.scheme?.miniscriptScheme?.miniscriptElements?.signerFingerprints[
          INHERITANCE_KEY1_IDENTIFIER
        ]
    );
  }, [vault]);

  const inheritanceKey = inheritanceKeyMeta ? signerMap[getKeyUID(inheritanceKeyMeta)] : null;

  useEffect(() => {
    WalletUtilities.fetchCurrentBlockHeight()
      .then(({ currentBlockHeight }) => {
        setCurrentBlockHeight(currentBlockHeight);
      })
      .catch((err) => showToast(err));
  }, [setCurrentBlockHeight, showToast]);

  useEffect(() => {
    if (!inheritanceKeyMeta || currentBlockHeight === null) return;

    try {
      const blocksUntilActivation =
        vault.scheme.miniscriptScheme.miniscriptElements.timelocks[0] - currentBlockHeight;

      if (blocksUntilActivation > 0) {
        const seconds = blocksUntilActivation * 10 * 60;
        const days = Math.floor(seconds / (24 * 60 * 60));
        const months = Math.floor(days / 30);

        let timeString = '';
        if (months > 0) {
          timeString = `${months} month${months > 1 ? 's' : ''}`;
        } else if (days > 0) {
          timeString = `${days} day${days > 1 ? 's' : ''}`;
        } else {
          const hours = Math.floor(seconds / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          timeString = `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${
            minutes > 1 ? 's' : ''
          }`;
        }

        setCurrentTimeUntilActivation(`${timeString}`);
      } else {
        setCurrentTimeUntilActivation(translations.vault.IKAlreadyActive);
      }
    } catch {
      showToast(vaultText.failedToCheckIKActivationTime, null, IToastCategory.DEFAULT, 3000, true);
    }
  }, [currentBlockHeight, inheritanceKeyMeta, translations, vault, showToast]);

  if (!inheritanceKey) return null;

  return (
    <Box style={styles.container}>
      <Box style={styles.headerContainer}>
        {currentTimeUntilActivation && (
          <Box>
            {currentTimeUntilActivation === vaultText.IKAlreadyActive ? (
              <Text fontSize={14} medium color={`${colorMode}.greenishGreyText`}>
                {vaultText.IKAlreadyActive}
              </Text>
            ) : (
              <>
                <Text fontSize={14} medium color={`${colorMode}.greenishGreyText`}>
                  {vaultText.IKActivatesIn}
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
      <SignerCard
        onCardSelect={() => handleCardSelect(inheritanceKey, inheritanceKeyMeta, true)}
        name={`${getSignerNameFromType(inheritanceKey.type, false, false)}`}
        description={getSignerDescription(inheritanceKey)}
        icon={SDIcons(inheritanceKey.type, true).Icon}
        image={inheritanceKey?.extraData?.thumbnailPath}
        showSelection={false}
        showDot={false}
        colorVarient="green"
        colorMode={colorMode}
      />
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

export default InheritanceKeySection;
