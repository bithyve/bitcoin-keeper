import { Box, Checkbox, useColorMode } from 'native-base';
import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import OptionPicker from 'src/components/OptionPicker';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useSignerMap from 'src/hooks/useSignerMap';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Buttons from 'src/components/Buttons';
import { MONTHS_3, MONTHS_6, MONTHS_9, MONTHS_12 } from './constants';
import { getKeyUID } from 'src/utils/utilities';
import { MiniscriptTypes, VaultType } from 'src/services/wallets/enums';
import useVault from 'src/hooks/useVault';
import VaultMigrationController from './VaultMigrationController';
import { useAppSelector } from 'src/store/hooks';
import KeeperModal from 'src/components/KeeperModal';
import SuccessIcon from 'src/assets/images/successSvg.svg';
import WalletUtilities from 'src/services/wallets/operations/utils';
import WalletHeader from 'src/components/WalletHeader';
import WarningNote from 'src/components/WarningNote';

export const DEFAULT_INITIAL_TIMELOCK = { label: MONTHS_6, value: MONTHS_6 };
export const INITIAL_TIMELOCK_DURATIONS = [
  { label: MONTHS_3, value: MONTHS_3 },
  { label: MONTHS_6, value: MONTHS_6 },
  { label: MONTHS_9, value: MONTHS_9 },
  { label: MONTHS_12, value: MONTHS_12 },
];

function SelectInitialTimelock({ route }) {
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
  } = route.params;
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common, vault: vaultTranslations } = translations;
  const [selectedOption, setSelectedOption] = useState(DEFAULT_INITIAL_TIMELOCK);
  const { activeVault } = useVault({ vaultId });
  const vaultKeys = vaultKeysParam || activeVault?.signers || [];
  const [vaultCreating, setCreating] = useState(false);
  const [vaultCreatedModalVisible, setVaultCreatedModalVisible] = useState(false);
  const [generatedVaultId, setGeneratedVaultId] = useState('');
  const { relayVaultUpdateLoading } = useAppSelector((state) => state.bhr);
  const [currentBlockHeight, setCurrentBlockHeight] = useState(currentBlockHeightParam);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        title={`${vaultTranslations.selectWalletTimelock}`}
        subTitle={vaultTranslations.selectWalletTimelockDesc}
      />
      <Box style={styles.container}>
        <Box style={styles.contentContainer}>
          <Box>
            <Box style={styles.dropDownContainer}>
              <OptionPicker
                label={vaultTranslations.selectActivationTime}
                options={INITIAL_TIMELOCK_DURATIONS}
                selectedOption={selectedOption}
                onOptionSelect={(option) => setSelectedOption(option)}
              />
            </Box>
          </Box>
          <Text fontSize={13}>{vaultTranslations.selectWalletTimelockNote}</Text>
        </Box>
        <Box style={styles.bottomContainer}>
          <WarningNote noteText={vaultTranslations.selectWalletTimelockWarning} />
          <Box style={styles.acceptContainer}>
            <Checkbox
              value={'acceptTerms'}
              isChecked={acceptedTerms}
              onChange={(isChecked) => setAcceptedTerms(isChecked)}
              accessibilityLabel={'acceptTerms'}
              _checked={{
                bg: `${colorMode}.pantoneGreen`,
                borderColor: `${colorMode}.pantoneGreen`,
                _icon: {
                  color: 'white',
                },
              }}
            />
            <Text fontSize={13}>{vaultTranslations.selectWalletTimelockAccept}</Text>
          </Box>
          <Buttons
            primaryLoading={vaultCreating || relayVaultUpdateLoading}
            primaryText={common.confirm}
            fullWidth
            primaryDisable={!selectedOption || !acceptedTerms}
            primaryCallback={() => {
              if (isAddInheritanceKey) {
                navigation.navigate('AddReserveKey', {
                  vaultKeys,
                  vaultId,
                  scheme,
                  name,
                  description,
                  isAddInheritanceKey,
                  isAddEmergencyKey,
                  hasInitialTimelock,
                  currentBlockHeight,
                  initialTimelockDuration: selectedOption.label,
                  selectedSigners: route.params.selectedSigners,
                  keyToRotate,
                });
              } else if (isAddEmergencyKey) {
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
                  initialTimelockDuration: selectedOption.label,
                  selectedSigners: route.params.selectedSigners,
                  keyToRotate,
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
                  initialTimelockDuration: selectedOption.label,
                  selectedSigners: route.params.selectedSigners,
                  vaultId,
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
        buttonBackground={`${colorMode}.pantoneGreen`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        subTitleWidth={wp(280)}
        showCloseIcon={false}
      />
      <VaultMigrationController
        vaultCreating={vaultCreating}
        vaultKeys={vaultKeys.filter((key) =>
          keyToRotate ? getKeyUID(key) !== getKeyUID(keyToRotate) : true
        )}
        scheme={scheme}
        name={name}
        description={description}
        vaultId={vaultId}
        setGeneratedVaultId={setGeneratedVaultId}
        setCreating={setCreating}
        vaultType={VaultType.MINISCRIPT}
        currentBlockHeight={currentBlockHeight}
        miniscriptTypes={[MiniscriptTypes.TIMELOCKED]}
        setVaultCreatedModalVisible={setVaultCreatedModalVisible}
        initialTimelockDuration={selectedOption.label}
      />
    </ScreenWrapper>
  );
}

export default SelectInitialTimelock;

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
  acceptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(10),
  },
});
