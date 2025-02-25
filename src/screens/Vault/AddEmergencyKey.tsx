import { Box, useColorMode } from 'native-base';
import React, { useCallback, useContext, useState, useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import HorizontalAddCard from 'src/components/HorizontalAddCard';
import KeeperHeader from 'src/components/KeeperHeader';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import OptionPicker from 'src/components/OptionPicker';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { ADDEMERGENCYKEY } from 'src/navigation/contants';
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
  MONTHS_36,
  MONTHS_3,
  MONTHS_6,
  MONTHS_30,
  MONTHS_42,
  MONTHS_48,
  MONTHS_54,
  MONTHS_60,
} from './constants';
import { getKeyUID } from 'src/utils/utilities';
import { MiniscriptTypes, VaultType } from 'src/services/wallets/enums';
import useVault from 'src/hooks/useVault';
import VaultMigrationController from './VaultMigrationController';
import { resetRealyVaultState } from 'src/store/reducers/bhr';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import useToastMessage from 'src/hooks/useToastMessage';
import KeeperModal from 'src/components/KeeperModal';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import SuccessIcon from 'src/assets/images/successSvg.svg';
import WalletUtilities from 'src/services/wallets/operations/utils';
import {
  EMERGENCY_KEY_IDENTIFIER,
  INHERITANCE_KEY_IDENTIFIER,
} from 'src/services/wallets/operations/miniscript/default/EnhancedVault';

const DEFAULT_EMERGENCY_KEY_TIMELOCK = { label: MONTHS_36, value: MONTHS_36 };
const EMERGENCY_TIMELOCK_DURATIONS = [
  { label: MONTHS_3, value: MONTHS_3 },
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

function AddEmergencyKey({ route }) {
  const {
    vaultKeys: vaultKeysParam,
    name,
    scheme,
    description,
    vaultId,
    isAddInheritanceKey,
    isAddEmergencyKey,
    currentBlockHeight: currentBlockHeightParam,
    keyToRotate,
    inheritanceKeys = [],
  } = route.params;
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { signerMap } = useSignerMap();
  const { translations } = useContext(LocalizationContext);
  const { common, vault: vaultTranslations } = translations;
  const [selectedOption, setSelectedOption] = useState(DEFAULT_EMERGENCY_KEY_TIMELOCK);
  const [selectedSigner, setSelectedSigner] = useState(null);
  const { activeVault, allVaults } = useVault({ vaultId });
  const vaultKeys = vaultKeysParam || activeVault?.signers || [];
  const [vaultCreating, setCreating] = useState(false);
  const [vaultCreatedModalVisible, setVaultCreatedModalVisible] = useState(false);
  const [generatedVaultId, setGeneratedVaultId] = useState('');
  const newVault = allVaults.filter((v) => v.id === generatedVaultId)[0];
  const { relayVaultUpdate, relayVaultError, realyVaultErrorMessage, relayVaultUpdateLoading } =
    useAppSelector((state) => state.bhr);
  const { showToast } = useToastMessage();
  const [currentBlockHeight, setCurrentBlockHeight] = useState(currentBlockHeightParam);

  const dispatch = useDispatch();

  // TODO: Allow multiple inheritance keys
  const emergencyKey = useMemo(() => {
    if (!selectedSigner || !signerMap) return null;
    return signerMap[getKeyUID(selectedSigner[0])];
  }, [selectedSigner, signerMap]);

  const isDarkMode = colorMode === 'dark';

  useEffect(() => {
    if (selectedSigner || keyToRotate) return;

    if (
      !activeVault?.id ||
      !activeVault?.scheme?.miniscriptScheme?.miniscriptElements?.signerFingerprints
    )
      return;

    const emergencyKeyFingerprint = Object.entries(
      activeVault.scheme.miniscriptScheme.miniscriptElements.signerFingerprints
    ).find(([key]) => key.startsWith(EMERGENCY_KEY_IDENTIFIER))?.[1];

    if (!emergencyKeyFingerprint) return;

    const emergencyKey = activeVault.signers.find(
      (key) => key.masterFingerprint === emergencyKeyFingerprint
    );

    if (emergencyKey) {
      setSelectedSigner([emergencyKey]);
    }
  }, [activeVault?.id, keyToRotate, selectedSigner]);

  useFocusEffect(
    useCallback(() => {
      if (relayVaultUpdate && newVault) {
        dispatch(resetRealyVaultState());
        setCreating(false);
        setVaultCreatedModalVisible(true);
      } else if (relayVaultUpdate) {
        navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: 'Home' }] }));
        dispatch(resetRealyVaultState());
        setCreating(false);
      }

      if (relayVaultError) {
        showToast(realyVaultErrorMessage, <ToastErrorIcon />);
        dispatch(resetRealyVaultState());
        setCreating(false);
      }
    }, [relayVaultUpdate, relayVaultError, newVault, navigation, dispatch])
  );

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

  const userKeyCallback = useCallback(() => {
    navigation.push('AddSigningDevice', {
      parentScreen: ADDEMERGENCYKEY,
      selectedSignersFromParams:
        vaultKeys && vaultKeys.length > 0 ? vaultKeys : route.params.selectedSigners,
      scheme,
      isAddInheritanceKey,
      isAddEmergencyKey,
      currentBlockHeight,
      onGoBack: (signer) => setSelectedSigner(signer),
    });
  }, [
    navigation,
    vaultKeys,
    route.params.selectedSigners,
    selectedSigner,
    scheme,
    isAddInheritanceKey,
    isAddEmergencyKey,
    currentBlockHeight,
  ]);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={`${vaultTranslations.addEmergencyKey}`}
        subtitle={vaultTranslations.setEmergencyKeyForVault}
      />
      <Box style={styles.container}>
        <Box style={styles.contentContainer}>
          <Box>
            <Box style={styles.cardContainer}>
              {!emergencyKey ? (
                <HorizontalAddCard
                  name={vaultTranslations.addEmergencyKey}
                  cardStyles={{ minHeight: hp(92) }}
                  iconWidth={25}
                  iconHeight={22}
                  callback={userKeyCallback}
                  KeyIcon={isDarkMode ? KEEPERAPPLIGHT : KEEPERAPP}
                />
              ) : (
                <HorizontalSignerCard
                  key={getKeyUID(emergencyKey)}
                  name={getSignerNameFromType(emergencyKey.type, emergencyKey.isMock, false)}
                  description={getSignerDescription(emergencyKey)}
                  icon={SDIcons(emergencyKey.type).Icon}
                  isSelected={false}
                  showSelection={false}
                  changeKey={userKeyCallback}
                  colorMode={colorMode}
                />
              )}
            </Box>
          </Box>
          <Box>
            <Box style={styles.textContainer}>
              <Text color={`${colorMode}.primaryText`}>
                {vaultTranslations.emergencyKeyActivation}
              </Text>
              <Text color={`${colorMode}.greenishGreyText`} fontSize={12}>
                {vaultTranslations.availableAfterDelay}
              </Text>
            </Box>
            <Box style={styles.dropDownContainer}>
              <OptionPicker
                label={vaultTranslations.selectActivationTime}
                options={EMERGENCY_TIMELOCK_DURATIONS}
                selectedOption={selectedOption}
                onOptionSelect={(option) => setSelectedOption(option)}
              />
            </Box>
          </Box>
        </Box>
        <Box style={styles.bottomContainer}>
          <Buttons
            primaryLoading={vaultCreating || relayVaultUpdateLoading}
            primaryText={common.confirm}
            fullWidth
            primaryDisable={!selectedSigner || !selectedOption}
            primaryCallback={() => {
              if (vaultId) {
                setCreating(true);
                return;
              }
              navigation.navigate('ConfirmWalletDetails', {
                vaultKeys,
                scheme,
                isHotWallet: false,
                vaultType: VaultType.MINISCRIPT,
                isTimeLock: false,
                isAddInheritanceKey,
                isAddEmergencyKey,
                currentBlockHeight,
                hotWalletInstanceNum: null,
                reservedKeys: inheritanceKeys,
                emergencyKeys: selectedSigner
                  ? [{ key: selectedSigner[0], duration: selectedOption.label }]
                  : [],
                selectedSigners: route.params.selectedSigners,
                vaultId,
              });
            }}
          />
        </Box>
      </Box>
      <KeeperModal
        dismissible
        close={() => {}}
        visible={vaultCreatedModalVisible}
        title={'Key Replaced Successfully'}
        subTitle={
          'Your key was successfully replaced, you can continue to use your updated wallet.'
        }
        Content={() => {
          return (
            <Box flex={1} alignItems={'center'}>
              <SuccessIcon />
            </Box>
          );
        }}
        buttonText={'View Wallet'}
        buttonCallback={viewVault}
        secondaryCallback={viewVault}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        buttonTextColor={`${colorMode}.buttonText`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        textColor={`${colorMode}.modalHeaderTitle`}
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
          )
          .filter(
            (signer) =>
              !Object.entries(
                activeVault?.scheme?.miniscriptScheme?.miniscriptElements?.signerFingerprints || {}
              )
                .filter(([key]) => key.startsWith(EMERGENCY_KEY_IDENTIFIER))
                .map(([_, value]) => value)
                .includes(signer.masterFingerprint) &&
              !Object.entries(
                activeVault?.scheme?.miniscriptScheme?.miniscriptElements?.signerFingerprints || {}
              )
                .filter(([key]) => key.startsWith('K'))
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
        inheritanceKeys={inheritanceKeys}
        emergencyKeys={
          selectedSigner ? [{ key: selectedSigner[0], duration: selectedOption.label }] : []
        }
        currentBlockHeight={currentBlockHeight}
        miniscriptTypes={[
          ...(inheritanceKeys ? [MiniscriptTypes.INHERITANCE] : []),
          MiniscriptTypes.EMERGENCY,
        ]}
      />
    </ScreenWrapper>
  );
}

export default AddEmergencyKey;

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
  },
  dropDownContainer: {
    marginTop: hp(20),
  },
  bottomContainer: {
    gap: hp(20),
  },
});
