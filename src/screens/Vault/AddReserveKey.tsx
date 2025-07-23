import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useCallback, useContext, useState, useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import HorizontalAddCard from 'src/components/HorizontalAddCard';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import OptionPicker from 'src/components/OptionPicker';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { ADDRESERVEKEY } from 'src/navigation/contants';
import useSignerMap from 'src/hooks/useSignerMap';
import { getSignerDescription, getSignerNameFromType } from 'src/hardware';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import KEEPERAPP from 'src/assets/images/KeeperIcon.svg';
import KEEPERAPPLIGHT from 'src/assets/images/KeeperIconLight.svg';
import Buttons from 'src/components/Buttons';
import { SDIcons } from './SigningDeviceIcons';
import HorizontalSignerCard from '../AddSigner/HorizontalSignerCard';
import {
  MONTHS_12,
  MONTHS_24,
  MONTHS_18,
  MONTHS_6,
  MONTHS_30,
  MONTHS_36,
  MONTHS_42,
  MONTHS_48,
  MONTHS_54,
  MONTHS_60,
} from './constants';
import { getKeyUID } from 'src/utils/utilities';
import { MiniscriptTypes, VaultType } from 'src/services/wallets/enums';
import useVault from 'src/hooks/useVault';
import VaultMigrationController from './VaultMigrationController';
import { useAppSelector } from 'src/store/hooks';
import KeeperModal from 'src/components/KeeperModal';
import SuccessIcon from 'src/assets/images/successSvg.svg';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { INHERITANCE_KEY_IDENTIFIER } from 'src/services/wallets/operations/miniscript/default/EnhancedVault';
import WalletHeader from 'src/components/WalletHeader';
import { AddKeyButton } from '../SigningDevices/components/AddKeyButton';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';

export const DEFAULT_INHERITANCE_KEY_TIMELOCK = { label: MONTHS_12, value: MONTHS_12 };
export const INHERITANCE_TIMELOCK_DURATIONS = [
  { label: MONTHS_6, value: MONTHS_6 },
  { label: MONTHS_12, value: MONTHS_12 },
  { label: MONTHS_18, value: MONTHS_18 },
  { label: MONTHS_24, value: MONTHS_24 },
  { label: MONTHS_30, value: MONTHS_30 },
  { label: MONTHS_36, value: MONTHS_36 },
  { label: MONTHS_42, value: MONTHS_42 },
  { label: MONTHS_48, value: MONTHS_48 },
  { label: MONTHS_54, value: MONTHS_54 },
  { label: MONTHS_60, value: MONTHS_60 },
];

function AddReserveKey({ route }) {
  const {
    vaultKeys: vaultKeysParam,
    name,
    scheme,
    description,
    vaultId,
    isAddInheritanceKey,
    isAddEmergencyKey,
    hasInitialTimelock,
    currentBlockHeight: currentBlockHeightParam,
    keyToRotate,
    initialTimelockDuration,
  } = route.params;

  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { signerMap } = useSignerMap();
  const { translations } = useContext(LocalizationContext);
  const {
    common,
    vault: vaultTranslations,
    wallet: walletTranslations,
    error: errorText,
  } = translations;
  const { showToast } = useToastMessage();

  // Make inheritanceKeysCount a state variable
  const [inheritanceKeysCount, setInheritanceKeysCount] = useState(1);

  const [selectedInheritanceKeys, setSelectedInheritanceKeys] = useState<
    Array<{
      signer: any;
      option: any;
    }>
  >(() => {
    // Initialize with empty slots based on inheritanceKeysCount
    return Array(inheritanceKeysCount)
      .fill(null)
      .map(() => ({
        signer: null,
        option: DEFAULT_INHERITANCE_KEY_TIMELOCK,
      }));
  });
  const { activeVault } = useVault({ vaultId });
  const vaultKeys = vaultKeysParam || activeVault?.signers || [];
  const [vaultCreating, setCreating] = useState(false);
  const [vaultCreatedModalVisible, setVaultCreatedModalVisible] = useState(false);
  const [generatedVaultId, setGeneratedVaultId] = useState('');
  const { relayVaultUpdateLoading } = useAppSelector((state) => state.bhr);
  const [currentBlockHeight, setCurrentBlockHeight] = useState(currentBlockHeightParam);

  const isDarkMode = colorMode === 'dark';

  useEffect(() => {
    if (
      !activeVault?.id ||
      !activeVault?.scheme?.miniscriptScheme?.miniscriptElements?.signerFingerprints
    )
      return;

    const inheritanceKeysFingerprints = Object.entries(
      activeVault.scheme.miniscriptScheme.miniscriptElements.signerFingerprints
    ).filter(([key]) => key.startsWith(INHERITANCE_KEY_IDENTIFIER));

    if (!inheritanceKeysFingerprints.length) return;

    const inheritanceKeys = inheritanceKeysFingerprints
      .map(([_, fingerprint]) =>
        activeVault.signers.find((key) => key.masterFingerprint === fingerprint)
      )
      .filter(Boolean);

    if (inheritanceKeys.length > 0) {
      const inheritanceKeysWithOptions = inheritanceKeys.map((key) => ({
        signer: getKeyUID(keyToRotate) == getKeyUID(key) ? null : key,
        option: DEFAULT_INHERITANCE_KEY_TIMELOCK,
      }));
      setSelectedInheritanceKeys(inheritanceKeysWithOptions);
      setInheritanceKeysCount(inheritanceKeys.length);
    }
  }, [activeVault?.id, keyToRotate]);

  const viewVault = () => {
    setVaultCreatedModalVisible(false);
    const navigationState = {
      index: 1,
      routes: [
        { name: 'Home' },
        {
          name: 'VaultDetails',
          params: { vaultId: generatedVaultId, vaultTransferSuccessful: true },
        },
      ],
    };
    navigation.dispatch(CommonActions.reset(navigationState));
  };

  useEffect(() => {
    if (!currentBlockHeight) {
      WalletUtilities.fetchCurrentBlockHeight()
        .then(({ currentBlockHeight }) => {
          setCurrentBlockHeight(currentBlockHeight);
        })
        .catch((err) => console.log('Failed to fetch the current chain data:', err));
    }
  }, []);

  const userKeyCallback = useCallback(
    (index: number) => {
      navigation.push('AddSigningDevice', {
        parentScreen: ADDRESERVEKEY,
        selectedSignersFromParams: [
          ...(vaultKeys && vaultKeys.length > 0 ? vaultKeys : route.params.selectedSigners || []),
          ...selectedInheritanceKeys
            .filter((_, keyIndex) => keyIndex !== index)
            .map((key) => key.signer)
            .filter(Boolean),
        ],
        scheme,
        isAddInheritanceKey,
        isAddEmergencyKey,
        hasInitialTimelock,
        currentBlockHeight,
        onGoBack: (signer) => {
          // Handle the case where signer is an array
          const actualSigner = Array.isArray(signer) ? signer[0] : signer;

          setSelectedInheritanceKeys((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], signer: actualSigner };
            return updated;
          });
        },
      });
    },
    [
      navigation,
      vaultKeys,
      route.params.selectedSigners,
      scheme,
      isAddInheritanceKey,
      isAddEmergencyKey,
      hasInitialTimelock,
      currentBlockHeight,
      selectedInheritanceKeys,
    ]
  );

  // Add function to add inheritance key
  const addInheritanceKey = () => {
    if (inheritanceKeysCount === 5) {
      showToast(errorText.maximumInheritanceKeysReached, <ToastErrorIcon />);
      return;
    }
    setInheritanceKeysCount((prev) => prev + 1);
    setSelectedInheritanceKeys((prev) => [
      ...prev,
      {
        signer: null,
        option: DEFAULT_INHERITANCE_KEY_TIMELOCK,
      },
    ]);
  };

  // Add function to remove inheritance key
  const removeInheritanceKey = (index: number) => {
    if (inheritanceKeysCount > 1) {
      setInheritanceKeysCount((prev) => prev - 1);
      setSelectedInheritanceKeys((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Get the actual signer objects from signerMap
  const inheritanceKeysWithSigners = useMemo(() => {
    return selectedInheritanceKeys.map((inheritanceKey) => {
      // If we have a signer in state, get the proper one from signerMap
      let signer = inheritanceKey.signer;
      if (inheritanceKey.signer && signerMap) {
        // Handle the case where signer might be an array
        const signerToProcess = Array.isArray(inheritanceKey.signer)
          ? inheritanceKey.signer[0]
          : inheritanceKey.signer;

        if (signerToProcess && signerToProcess.masterFingerprint) {
          const signerId = getKeyUID(signerToProcess);
          signer = signerMap[signerId] || signerToProcess;
        }
      }

      return {
        ...inheritanceKey,
        signer,
      };
    });
  }, [selectedInheritanceKeys, signerMap]);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        title={`${vaultTranslations.addInheritanceKey}`}
        subTitle={vaultTranslations.setIKSForVault}
      />
      <Box style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {inheritanceKeysWithSigners.map((inheritanceKey, index) => {
            return (
              <Box key={index} style={styles.contentContainer}>
                <Box>
                  <Box style={styles.cardContainer}>
                    {!inheritanceKey.signer ? (
                      <HorizontalAddCard
                        name={vaultTranslations.addInheritanceKey}
                        cardStyles={{ minHeight: hp(92) }}
                        iconWidth={25}
                        iconHeight={22}
                        callback={() => userKeyCallback(index)}
                        KeyIcon={isDarkMode ? KEEPERAPPLIGHT : KEEPERAPP}
                      />
                    ) : (
                      <HorizontalSignerCard
                        key={getKeyUID(inheritanceKey.signer)}
                        name={getSignerNameFromType(
                          inheritanceKey.signer.type,
                          inheritanceKey.signer.isMock,
                          false
                        )}
                        description={getSignerDescription(inheritanceKey.signer)}
                        icon={SDIcons({ type: inheritanceKey.signer.type }).Icon}
                        isSelected={false}
                        showSelection={false}
                        changeKey={() => userKeyCallback(index)}
                        colorMode={colorMode}
                      />
                    )}
                  </Box>
                </Box>
                <Box>
                  <Box style={styles.textContainer}>
                    <Text color={`${colorMode}.primaryText`}>
                      {vaultTranslations.inheritanceKeyActivation}
                    </Text>
                    <Text color={`${colorMode}.greenishGreyText`} fontSize={12}>
                      {vaultTranslations.availableAfterDelay}
                    </Text>
                  </Box>
                  <Box style={styles.dropDownContainer}>
                    <OptionPicker
                      label={vaultTranslations.selectActivationTime}
                      options={INHERITANCE_TIMELOCK_DURATIONS}
                      selectedOption={inheritanceKey.option}
                      onOptionSelect={(option) => {
                        setSelectedInheritanceKeys((prev) => {
                          const updated = [...prev];
                          updated[index] = { ...updated[index], option };
                          return updated;
                        });
                      }}
                    />
                  </Box>
                  {/* Remove button - only show if there's more than 1 key */}
                  {inheritanceKeysCount > 1 && (
                    <Box style={styles.removeButtonContainer}>
                      <TouchableOpacity
                        onPress={() => removeInheritanceKey(index)}
                        style={styles.removeButton}
                        testID={`btn_remove_inheritance_key_${index}`}
                      >
                        <ThemedSvg name="delete_icon" width={16} height={16} />
                        <Text
                          color={`${colorMode}.redText`}
                          fontSize={12}
                          style={styles.removeButtonText}
                        >
                          {vaultTranslations.removeKey || 'Remove'}
                        </Text>
                      </TouchableOpacity>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}

          {/* Add key button */}
          <Box style={styles.addKeyButtonContainer}>
            <AddKeyButton short onPress={addInheritanceKey} />
          </Box>
        </ScrollView>

        <Box style={styles.bottomContainer}>
          <Buttons
            primaryLoading={vaultCreating || relayVaultUpdateLoading}
            primaryText={common.confirm}
            fullWidth
            primaryDisable={selectedInheritanceKeys.some((key) => !key.option || !key.signer)}
            primaryCallback={() => {
              if (isAddEmergencyKey) {
                navigation.navigate('AddEmergencyKey', {
                  vaultKeys,
                  vaultId,
                  scheme,
                  name,
                  description,
                  isAddInheritanceKey,
                  isAddEmergencyKey,
                  hasInitialTimelock,
                  currentBlockHeight,
                  selectedSigners: route.params.selectedSigners,
                  keyToRotate,
                  inheritanceKeys: selectedInheritanceKeys
                    .filter((key) => key.signer)
                    .filter((key) => key.option)
                    .map((key) => ({
                      key: key.signer,
                      duration: key.option.label,
                    })),
                  initialTimelockDuration,
                });
              } else {
                if (vaultId) {
                  setCreating(true);
                  return;
                }
                navigation.navigate('ConfirmWalletDetails', {
                  vaultKeys,
                  scheme,
                  isHotWallet: false,
                  vaultType: VaultType.MINISCRIPT,
                  isAddInheritanceKey,
                  isAddEmergencyKey,
                  hasInitialTimelock,
                  currentBlockHeight,
                  hotWalletInstanceNum: null,
                  reservedKeys: selectedInheritanceKeys
                    .filter((key) => key.signer)
                    .filter((key) => key.option)
                    .map((key) => ({
                      key: key.signer,
                      duration: key.option.label,
                    })),
                  selectedSigners: route.params.selectedSigners,
                  vaultId,
                  initialTimelockDuration,
                });
              }
            }}
          />
        </Box>
      </Box>
      <KeeperModal
        dismissible
        close={() => {}}
        visible={vaultCreatedModalVisible}
        title={vaultTranslations.keyReplacedSuccessfully}
        subTitle={vaultTranslations.replacedKeyMessage}
        Content={() => {
          return (
            <Box flex={1} alignItems={'center'}>
              <SuccessIcon />
            </Box>
          );
        }}
        buttonText={walletTranslations.ViewWallet}
        buttonCallback={viewVault}
        secondaryCallback={viewVault}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        buttonTextColor={`${colorMode}.buttonText`}
        buttonBackground={`${colorMode}.pantoneGreen`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        subTitleWidth={wp(280)}
        showCloseIcon={false}
      />
      <VaultMigrationController
        vaultCreating={vaultCreating}
        vaultKeys={vaultKeys
          .filter((key) => (keyToRotate ? getKeyUID(key) !== getKeyUID(keyToRotate) : true))
          .filter(
            (signer) =>
              !Object.entries(
                activeVault?.scheme?.miniscriptScheme?.miniscriptElements?.signerFingerprints || {}
              )
                .filter(([key]) => key.startsWith(INHERITANCE_KEY_IDENTIFIER))
                .map(([_, value]) => value)
                .includes(signer.masterFingerprint)
          )}
        scheme={scheme}
        name={name}
        description={description}
        vaultId={vaultId}
        setGeneratedVaultId={setGeneratedVaultId}
        setCreating={setCreating}
        vaultType={VaultType.MINISCRIPT}
        inheritanceKeys={selectedInheritanceKeys
          .filter((key) => key.signer)
          .filter((key) => key.option)
          .map((key) => ({
            key: key.signer,
            duration: key.option.label,
          }))}
        initialTimelockDuration={initialTimelockDuration ?? 0}
        currentBlockHeight={currentBlockHeight}
        miniscriptTypes={[
          ...(initialTimelockDuration ? [MiniscriptTypes.TIMELOCKED] : []),
          MiniscriptTypes.INHERITANCE,
        ]}
        setVaultCreatedModalVisible={setVaultCreatedModalVisible}
      />
    </ScreenWrapper>
  );
}

export default AddReserveKey;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: hp(20),
    paddingHorizontal: wp(10),
    justifyContent: 'space-between',
  },
  textContainer: {
    gap: hp(5),
  },
  cardContainer: {
    marginTop: hp(5),
  },
  contentContainer: {
    gap: hp(25),
    marginBottom: hp(25),
  },
  dropDownContainer: {
    marginTop: hp(20),
  },
  bottomContainer: {
    gap: hp(20),
  },
  removeButtonContainer: {
    marginTop: hp(15),
    alignItems: 'flex-end',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(8),
    paddingHorizontal: wp(12),
    borderRadius: 6,
    borderWidth: 1,
  },
  removeButtonText: {
    marginLeft: wp(6),
  },
  addKeyButtonContainer: {
    marginTop: hp(20),
    marginBottom: hp(10),
  },
});
