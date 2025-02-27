import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Box, useColorMode } from 'native-base';
import { Pressable, StyleSheet } from 'react-native';
import { Phase } from 'src/services/wallets/operations/miniscript/policy-generator';
import { INHERITANCE_KEY1_IDENTIFIER } from 'src/services/wallets/operations/miniscript/default/InheritanceVault';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { MiniscriptTypes, VaultType } from 'src/services/wallets/enums';
import WalletUtilities from 'src/services/wallets/operations/utils';
import WalletOperations from 'src/services/wallets/operations';
import { getAvailableMiniscriptPhase } from 'src/services/wallets/factories/VaultFactory';
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';

interface MiniscriptPathSelectorProps {
  vault: Vault;
  onPathSelected: (satisfier: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export interface MiniscriptPathSelectorRef {
  selectVaultSpendingPaths: () => Promise<void>;
}

export const MiniscriptPathSelector = forwardRef<
  MiniscriptPathSelectorRef,
  MiniscriptPathSelectorProps
>(({ vault, onPathSelected, onError, onCancel }: MiniscriptPathSelectorProps, ref) => {
  const { colorMode } = useColorMode();
  const [modalVisible, setModalVisible] = useState(false);
  const [availablePhases, setAvailablePhases] = useState<Phase[]>([]);
  const [currentBlockHeight, setCurrentBlockHeight] = useState<number | null>(null);

  useEffect(() => {
    if (vault.type === VaultType.MINISCRIPT) {
      WalletUtilities.fetchCurrentBlockHeight()
        .then(({ currentBlockHeight }) => {
          setCurrentBlockHeight(currentBlockHeight);
        })
        .catch((err) => onError(err));
    }
  }, []);

  const parseSelectedPhase = (phase: Phase) => {
    const pathsAvailable = phase.paths;
    return {
      phaseId: phase.id,
      availablePaths: pathsAvailable,
      selectedPaths: pathsAvailable.map((path) => path.id),
    };
  };

  const getPhaseDescription = (phase: Phase) => {
    const isInheritancePhase = phase.paths[0]?.keys?.find(
      (key) => key.identifier === INHERITANCE_KEY1_IDENTIFIER
    );

    if (isInheritancePhase) {
      return {
        title: vault.scheme.m == 1 ? 'Use the Inheritance Key' : 'Use with Inheritance Key',
        subtitle:
          vault.scheme.m == 1
            ? 'Spend using the Inheritance Key'
            : 'Spend using the Inheritance Key and the regular keys',
      };
    }

    return {
      title: vault.scheme.n == 1 ? 'Use the regular key' : 'Use only regular keys',
      subtitle:
        vault.scheme.n == 1
          ? 'Spend using the regular key'
          : 'Spend using only the regular vault keys',
    };
  };

  const selectVaultSpendingPaths = async () => {
    let currentSyncedBlockHeight = currentBlockHeight;
    if (!currentSyncedBlockHeight) {
      try {
        currentSyncedBlockHeight = (await WalletUtilities.fetchCurrentBlockHeight())
          .currentBlockHeight;
      } catch (err) {
        console.log('Failed to re-fetch current block height: ' + err);
      }
      if (!currentSyncedBlockHeight) {
        throw Error(
          'Failed to fetch current chain data, please check your connection and try again'
        );
      }
    }

    const { phases: availablePhasesOptions } = getAvailableMiniscriptPhase(
      vault,
      currentBlockHeight
    );

    if (!availablePhasesOptions || availablePhasesOptions.length === 0) {
      onError('No spending paths available; timelock is active');
      return;
    }

    setAvailablePhases(availablePhasesOptions);

    if (availablePhasesOptions.length === 1) {
      handlePhaseSelection(availablePhasesOptions[0]);
    } else {
      setModalVisible(true);
    }
  };

  const handlePhaseSelection = (phase: Phase) => {
    const { phaseId, selectedPaths } = parseSelectedPhase(phase);
    const miniscriptSelectedSatisfier = WalletOperations.getSelectedSatisfier(
      vault.scheme.miniscriptScheme,
      {
        selectedPhase: phaseId,
        selectedPaths: selectedPaths,
      }
    );
    onPathSelected(miniscriptSelectedSatisfier);
  };

  useImperativeHandle(ref, () => ({
    selectVaultSpendingPaths,
  }));

  return (
    <>
      <KeeperModal
        visible={modalVisible}
        close={() => {
          setModalVisible(false);
          onCancel();
        }}
        title="Select Signing Option"
        subTitle={`\nSelect how you would like to sign.\n\nUsing the regular option is better to reduce the transaction fee${
          vault.scheme.miniscriptScheme?.usedMiniscriptTypes?.length == 1 &&
          vault.scheme.miniscriptScheme?.usedMiniscriptTypes?.includes(MiniscriptTypes.INHERITANCE)
            ? ' if you are not planning to use the Inheritance Key.'
            : ''
        }`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <Box style={{ gap: wp(15), marginBottom: hp(10) }}>
            {availablePhases.map((phase) => (
              <Pressable
                key={phase.id}
                onPress={() => {
                  setModalVisible(false);
                  handlePhaseSelection(phase);
                }}
              >
                <Box
                  style={styles.optionCTR}
                  backgroundColor={`${colorMode}.boxSecondaryBackground`}
                  borderColor={`${colorMode}.separator`}
                >
                  <Box>
                    <Text
                      color={`${colorMode}.secondaryText`}
                      fontSize={16}
                      medium
                      style={styles.optionTitle}
                    >
                      {getPhaseDescription(phase).title}
                    </Text>
                    <Text color={`${colorMode}.secondaryText`} fontSize={13}>
                      {getPhaseDescription(phase).subtitle}
                    </Text>
                  </Box>
                </Box>
              </Pressable>
            ))}
          </Box>
        )}
      />
    </>
  );
});

const styles = StyleSheet.create({
  optionTitle: {
    marginBottom: hp(5),
  },
  optionCTR: {
    flexDirection: 'row',
    paddingHorizontal: wp(15),
    paddingVertical: hp(22),
    alignItems: 'center',
    gap: wp(16),
    borderRadius: 12,
    borderWidth: 1,
  },
});

export default MiniscriptPathSelector;
