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
  MONTHS_3,
  MONTHS_30,
  MONTHS_36,
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
import { INHERITANCE_KEY1_IDENTIFIER } from 'src/services/wallets/operations/miniscript/default/InheritanceVault';

const DEFAULT_INHERITANCE_TIMELOCK = { label: MONTHS_12, value: 12 * 30 * 24 * 60 * 60 * 1000 };
const INHERITANCE_TIMELOCK_DURATIONS = [
  { label: MONTHS_3, value: 3 * 30 * 24 * 60 * 60 * 1000 },
  { label: MONTHS_6, value: 6 * 30 * 24 * 60 * 60 * 1000 },
  DEFAULT_INHERITANCE_TIMELOCK,
  { label: MONTHS_18, value: 18 * 30 * 24 * 60 * 60 * 1000 },
  { label: MONTHS_24, value: 24 * 30 * 24 * 60 * 60 * 1000 },
  { label: MONTHS_30, value: 30 * 30 * 24 * 60 * 60 * 1000 },
  { label: MONTHS_36, value: 36 * 30 * 24 * 60 * 60 * 1000 },
];

function AddReserveKey({ route }) {
  const {
    vaultKeys: vaultKeysParam,
    name,
    scheme,
    description,
    vaultId,
    isAddInheritanceKey,
    currentBlockHeight: currentBlockHeightParam,
    keyToRotate,
  } = route.params;
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { signerMap } = useSignerMap();
  const { translations } = useContext(LocalizationContext);
  const { common, vault: vaultTranslations } = translations;
  const [selectedOption, setSelectedOption] = useState(DEFAULT_INHERITANCE_TIMELOCK);
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

  const reservedKey = useMemo(() => {
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

    const inheritanceKeyFingerprint =
      activeVault.scheme.miniscriptScheme.miniscriptElements.signerFingerprints[
        INHERITANCE_KEY1_IDENTIFIER
      ];

    if (!inheritanceKeyFingerprint) return;

    const inheritanceKey = activeVault.signers.find(
      (key) => key.masterFingerprint === inheritanceKeyFingerprint
    );

    if (inheritanceKey) {
      setSelectedSigner([inheritanceKey]);
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
      parentScreen: ADDRESERVEKEY,
      selectedSignersFromParams:
        vaultKeys && vaultKeys.length > 0 ? vaultKeys : route.params.selectedSigners,
      selectedReserveKey: selectedSigner,
      scheme,
      isAddInheritanceKey,
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
    currentBlockHeight,
  ]);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={`${vaultTranslations.addInheritanceKey}`}
        subtitle={vaultTranslations.setIKSForVault}
      />
      <Box style={styles.container}>
        <Box style={styles.contentContainer}>
          <Box>
            <Box style={styles.cardContainer}>
              {!reservedKey ? (
                <HorizontalAddCard
                  name={vaultTranslations.addInheritanceKey}
                  cardStyles={{ minHeight: hp(92) }}
                  iconWidth={25}
                  iconHeight={22}
                  callback={userKeyCallback}
                  KeyIcon={isDarkMode ? KEEPERAPPLIGHT : KEEPERAPP}
                />
              ) : (
                <HorizontalSignerCard
                  key={getKeyUID(reservedKey)}
                  name={getSignerNameFromType(reservedKey.type, reservedKey.isMock, false)}
                  description={getSignerDescription(reservedKey)}
                  icon={SDIcons(reservedKey.type).Icon}
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
                currentBlockHeight,
                hotWalletInstanceNum: null,
                reservedKey: selectedSigner ? selectedSigner[0] : null,
                selectedDuration: selectedOption.label,
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
              signer.masterFingerprint !==
              activeVault?.scheme?.miniscriptScheme?.miniscriptElements?.signerFingerprints[
                INHERITANCE_KEY1_IDENTIFIER
              ]
          )}
        scheme={scheme}
        name={name}
        description={description}
        vaultId={vaultId}
        setGeneratedVaultId={setGeneratedVaultId}
        setCreating={setCreating}
        vaultType={VaultType.MINISCRIPT}
        inheritanceKey={selectedSigner ? selectedSigner[0] : null}
        isAddInheritanceKey={true}
        currentBlockHeight={currentBlockHeight}
        selectedDuration={selectedOption.label}
        miniscriptTypes={[MiniscriptTypes.INHERITANCE]}
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
  },
  dropDownContainer: {
    marginTop: hp(20),
  },
  bottomContainer: {
    gap: hp(20),
  },
});
