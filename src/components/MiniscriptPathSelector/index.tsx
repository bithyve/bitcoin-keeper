import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Box, useColorMode } from 'native-base';
import { Pressable, StyleSheet } from 'react-native';
import { Path, Phase } from 'src/services/wallets/operations/miniscript/policy-generator';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { MiniscriptTypes, VaultType } from 'src/services/wallets/enums';
import WalletUtilities from 'src/services/wallets/operations/utils';
import WalletOperations from 'src/services/wallets/operations';
import {
  getAvailableMiniscriptPhase,
  getBlockHeightOrTimestampForVault,
  isVaultUsingBlockHeightTimelock,
} from 'src/services/wallets/factories/VaultFactory';
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import {
  EMERGENCY_KEY_IDENTIFIER,
  INHERITANCE_KEY_IDENTIFIER,
} from 'src/services/wallets/operations/miniscript/default/EnhancedVault';
import ActivityIndicatorView from '../AppActivityIndicator/ActivityIndicatorView';

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
  const [pathsModalVisible, setPathsModalVisible] = useState(false);
  const [availablePhases, setAvailablePhases] = useState<Phase[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<Phase>(null);
  const [availablePaths, setAvailablePaths] = useState<Path[]>([]);
  const [currentBlockHeight, setCurrentBlockHeight] = useState<number | null>(null);
  const [currentMedianTimePast, setCurrentMedianTimePast] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (vault.type === VaultType.MINISCRIPT) {
      if (isVaultUsingBlockHeightTimelock(vault)) {
        WalletUtilities.fetchCurrentBlockHeight()
          .then(({ currentBlockHeight }) => {
            setCurrentBlockHeight(currentBlockHeight);
          })
          .catch((err) => onError(err));
      } else {
        WalletUtilities.fetchCurrentMedianTime()
          .then(({ currentMedianTime }) => {
            setCurrentMedianTimePast(currentMedianTime);
          })
          .catch((err) => onError(err));
      }
    }
  }, []);

  const parseSelectedPhase = (phase: Phase) => {
    const pathsAvailable = phase.paths;

    setSelectedPhase(phase);
    if (pathsAvailable.length === phase.requiredPaths) {
      // Automatically select all paths
      return {
        phaseId: phase.id,
        availablePaths: pathsAvailable,
        selectedPaths: pathsAvailable.map((path) => path.id),
      };
    } else {
      // Allow user to select paths
      setAvailablePaths(pathsAvailable);
      return {
        phaseId: phase.id,
        availablePaths: pathsAvailable,
        selectedPaths: [], // Start with no paths selected
      };
    }
  };

  const getPhaseDescription = (phase: Phase) => {
    const inheritanceKeysInPhase = phase.paths[0]?.keys?.filter((key) =>
      key.identifier.startsWith(INHERITANCE_KEY_IDENTIFIER)
    ).length;

    const emergencyKeysInPhase = phase.paths?.reduce((count, path) => {
      return (
        count +
        (path.keys?.filter((key) => key.identifier.startsWith(EMERGENCY_KEY_IDENTIFIER)).length ||
          0)
      );
    }, 0);

    if (inheritanceKeysInPhase && emergencyKeysInPhase) {
      return {
        title: `Use with Enhanced Keys`,
        subtitle: `Spend using the Inheritance Key and the regular keys`,
      };
    }

    if (emergencyKeysInPhase) {
      return {
        title: `Use ${emergencyKeysInPhase > 1 ? 'an' : 'the'} Emergency Key`,
        subtitle: `Spend using ${emergencyKeysInPhase > 1 ? 'an' : 'the'} Emergency Key`,
      };
    }

    if (inheritanceKeysInPhase) {
      const multiKeysAppendix = inheritanceKeysInPhase === 1 ? '' : 's';
      return {
        title:
          vault.scheme.m == 1
            ? `Use the Inheritance Key${multiKeysAppendix}`
            : `Use with Inheritance Key${multiKeysAppendix}`,
        subtitle:
          vault.scheme.m == 1
            ? `Spend using the Inheritance Key${multiKeysAppendix}`
            : `Spend using the Inheritance Key and the regular keys${multiKeysAppendix}`,
      };
    }

    return {
      title: vault.scheme.n == 1 ? 'Use the regular key' : 'Use regular keys',
      subtitle:
        vault.scheme.n == 1
          ? 'Spend using the regular key'
          : 'Spend using only the regular vault keys',
    };
  };

  const getPathDescription = (path: Path) => {
    const inheritanceKeysInPhase = path.keys?.filter((key) =>
      key.identifier.startsWith(INHERITANCE_KEY_IDENTIFIER)
    ).length;

    const emergencyKey = path.keys?.find((key) =>
      key.identifier.startsWith(EMERGENCY_KEY_IDENTIFIER)
    );

    const totalEmergencyKeys = Object.entries(vault.scheme.miniscriptScheme.keyInfoMap).filter(
      ([identifier, _]) => identifier.startsWith(EMERGENCY_KEY_IDENTIFIER)
    ).length;

    if (emergencyKey) {
      return {
        title: `Use the${
          totalEmergencyKeys == 1
            ? ''
            : ' ' +
              convertNumberToOrdinal(
                parseInt(emergencyKey.identifier.replace(EMERGENCY_KEY_IDENTIFIER, ''))
              )
        } Emergency Key`,
        subtitle: `Spend using the${
          totalEmergencyKeys == 1
            ? ''
            : ' ' +
              convertNumberToOrdinal(
                parseInt(emergencyKey.identifier.replace(EMERGENCY_KEY_IDENTIFIER, ''))
              )
        } Emergency Key`,
      };
    }

    if (inheritanceKeysInPhase) {
      const multiKeysAppendix = inheritanceKeysInPhase === 1 ? '' : 's';
      return {
        title:
          vault.scheme.m == 1
            ? `Use the Inheritance Key${multiKeysAppendix}`
            : `Use with Inheritance Key${multiKeysAppendix}`,
        subtitle:
          vault.scheme.m == 1
            ? `Spend using the Inheritance Key${multiKeysAppendix}`
            : `Spend using the Inheritance Key and the regular keys${multiKeysAppendix}`,
      };
    }

    return {
      title: vault.scheme.n == 1 ? 'Use the regular key' : 'Use regular keys',
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

    const currentTime = getBlockHeightOrTimestampForVault(
      vault,
      currentBlockHeight,
      currentMedianTimePast
    );
    if (!currentTime) {
      throw Error('Failed to get current time, please check your connection and try again');
    }

    const { phases: availablePhasesOptions } = getAvailableMiniscriptPhase(vault, currentTime);

    if (!availablePhasesOptions || availablePhasesOptions.length === 0) {
      onError('No spending paths available; timelock is active');
      return;
    }

    setAvailablePhases(availablePhasesOptions);

    if (availablePhasesOptions.length === 1) {
      const phase = availablePhasesOptions[0];
      const { selectedPaths } = parseSelectedPhase(phase);

      if (selectedPaths.length === 0) {
        // Show modal for user to select paths
        setPathsModalVisible(true);
      } else {
        // Automatically handle phase selection
        handlePhaseSelection(phase);
      }
    } else {
      setModalVisible(true);
    }
  };

  const handlePhaseSelection = (phase: Phase) => {
    const { phaseId, selectedPaths } = parseSelectedPhase(phase);
    if (selectedPaths.length) {
      const miniscriptSelectedSatisfier = WalletOperations.getSelectedSatisfier(
        vault.scheme.miniscriptScheme,
        {
          selectedPhase: phaseId,
          selectedPaths: selectedPaths,
        }
      );
      setIsLoading(false);

      onPathSelected(miniscriptSelectedSatisfier);
    } else {
      setIsLoading(false);
      setPathsModalVisible(true);
    }
  };

  const handlePathsSelection = (paths: Path[]) => {
    const miniscriptSelectedSatisfier = WalletOperations.getSelectedSatisfier(
      vault.scheme.miniscriptScheme,
      {
        selectedPhase: selectedPhase.id,
        selectedPaths: paths.map((path) => path.id),
      }
    );
    setIsLoading(false);
    onPathSelected(miniscriptSelectedSatisfier);
  };

  useImperativeHandle(ref, () => ({
    selectVaultSpendingPaths,
  }));

  return (
    <>
      {vault && vault.type === VaultType.MINISCRIPT && (
        <>
          {isLoading && <ActivityIndicatorView visible={isLoading} />}
          <KeeperModal
            visible={modalVisible}
            close={() => {
              setModalVisible(false);
              onCancel();
            }}
            title="Select Signing Option"
            subTitle={`\nSelect how you would like to sign.\n\nUsing the regular option is better to reduce the transaction fee${
              vault.scheme.miniscriptScheme?.usedMiniscriptTypes?.length == 1 &&
              vault.scheme.miniscriptScheme?.usedMiniscriptTypes?.includes(
                MiniscriptTypes.INHERITANCE
              )
                ? ' if you are not planning to use the Inheritance Key.'
                : ''
            }`}
            modalBackground={`${colorMode}.modalWhiteBackground`}
            textColor={`${colorMode}.textGreen`}
            subTitleColor={`${colorMode}.modalSubtitleBlack`}
            Content={() => (
              <Box style={{ gap: wp(15), marginBottom: hp(10) }}>
                {availablePhases.map((phase) => (
                  <Pressable
                    key={phase.id}
                    onPress={() => {
                      setIsLoading(true);
                      setModalVisible(false);
                      setTimeout(() => {
                        handlePhaseSelection(phase);
                      }, 200);
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
          {/* TODO: For now we just assume one path to select, but need to implement multiple selection based on the phase.requiredPaths */}
          {availablePaths && (
            <KeeperModal
              visible={pathsModalVisible}
              close={() => {
                setPathsModalVisible(false);
                onCancel();
              }}
              title="Select Signing Path"
              subTitle={`\nSelect how you would like to sign.`}
              modalBackground={`${colorMode}.modalWhiteBackground`}
              textColor={`${colorMode}.textGreen`}
              subTitleColor={`${colorMode}.modalSubtitleBlack`}
              Content={() => (
                <Box style={{ gap: wp(15), marginBottom: hp(10) }}>
                  {availablePaths.map((path) => (
                    <Pressable
                      key={path.id}
                      onPress={() => {
                        setIsLoading(true);
                        setPathsModalVisible(false);
                        setTimeout(() => {
                          handlePathsSelection([path]);
                        }, 200);
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
                            {getPathDescription(path).title}
                          </Text>
                          <Text color={`${colorMode}.secondaryText`} fontSize={13}>
                            {getPathDescription(path).subtitle}
                          </Text>
                        </Box>
                      </Box>
                    </Pressable>
                  ))}
                </Box>
              )}
            />
          )}
        </>
      )}
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

export function convertNumberToOrdinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const value = n % 100;
  return n + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
}
