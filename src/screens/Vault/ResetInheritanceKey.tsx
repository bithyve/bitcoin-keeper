import { Box, useColorMode } from 'native-base';
import React, { useContext, useState, useEffect, useCallback } from 'react';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useSignerMap from 'src/hooks/useSignerMap';
import { Signer, Vault } from 'src/services/wallets/interfaces/vault';
import moment from 'moment';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { useDispatch } from 'react-redux';
import WalletUtilities from 'src/services/wallets/operations/utils';
import useVault from 'src/hooks/useVault';
import { useAppSelector } from 'src/store/hooks';
import { resetRealyVaultState } from 'src/store/reducers/bhr';
import IKSInfocard from './components/IKSInfoCard';
import { SDIcons } from './SigningDeviceIcons';
import VaultMigrationController from './VaultMigrationController';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { getKeyUID } from 'src/utils/utilities';
import OptionDropdown from 'src/components/OptionDropdown';
import { MONTHS_12, MONTHS_18, MONTHS_24 } from './constants';

const DEFAULT_INHERITANCE_TIMELOCK = { label: MONTHS_12, value: 12 * 30 * 24 * 60 * 60 * 1000 };
const INHERITANCE_TIMELOCK_DURATIONS = [
  DEFAULT_INHERITANCE_TIMELOCK,
  { label: MONTHS_18, value: 18 * 30 * 24 * 60 * 60 * 1000 },
  { label: MONTHS_24, value: 24 * 30 * 24 * 60 * 60 * 1000 },
];

function ResetInheritanceKey({ route }) {
  const { signerId, vault }: { signerId: string; vault: Vault } = route.params;
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { signerMap } = useSignerMap();
  const { translations } = useContext(LocalizationContext);
  const [selectedOption, setSelectedOption] = useState(null);
  const signer: Signer = signerMap[signerId];
  const inheritanceSigner = vault.signers.find((signer) => getKeyUID(signer) === signerId);
  const otherSigners = vault.signers.filter((signer) => getKeyUID(signer) !== signerId);
  const { vault: vaultText, common } = translations;
  const { showToast } = useToastMessage();
  const [generatedVaultId, setGeneratedVaultId] = useState('');
  const { allVaults } = useVault({ includeArchived: false });
  const newVault = allVaults.filter((v) => v.id === generatedVaultId)[0];
  const [vaultCreating, setCreating] = useState(false);
  const [currentBlockHeight, setCurrentBlockHeight] = useState(null);

  const { relayVaultUpdate, relayVaultError, realyVaultErrorMessage } = useAppSelector(
    (state) => state.bhr
  );

  const dispatch = useDispatch();

  const handleResetInheritanceKey = () => {
    if (!selectedOption) {
      showToast('Please select a timeline', <ToastErrorIcon />);
      return;
    }
    if (!currentBlockHeight) {
      showToast('Failed to sync current block height', <ToastErrorIcon />);
      return;
    }
    setCreating(true);
  };

  useEffect(() => {
    // should bind with a refresher in case the auto fetch for block-height fails
    WalletUtilities.fetchCurrentBlockHeight()
      .then(({ currentBlockHeight }) => {
        setCurrentBlockHeight(currentBlockHeight);
      })
      .catch((err) => showToast(err));
  }, []);

  useEffect(() => {
    if (route.params?.selectedOption) {
      setSelectedOption(route.params.selectedOption);
    }
  }, [route.params]);

  useFocusEffect(
    useCallback(() => {
      if (relayVaultUpdate && newVault) {
        dispatch(resetRealyVaultState());
        setCreating(false);
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

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <ActivityIndicatorView visible={vaultCreating} />
      <KeeperHeader title={vaultText.resetIKTitle} subtitle={vaultText.resetIKDesc} />
      <Box style={styles.container}>
        <Box style={styles.contentContainer}>
          <IKSInfocard
            name={signer?.signerName}
            description={`${common?.added} ${moment(signer?.addedOn).calendar().toLowerCase()}`}
            Icon={SDIcons(signer?.type)?.Icon}
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
            <OptionDropdown
              label={vaultText.selectActivationTime}
              options={INHERITANCE_TIMELOCK_DURATIONS}
              selectedOption={selectedOption}
              onOptionSelect={(option) => setSelectedOption(option)}
            />
          </Box>
        </Box>
        <Box>
          <Buttons
            primaryText={vaultText.revaultNow}
            fullWidth
            primaryCallback={handleResetInheritanceKey}
          />
        </Box>
      </Box>
      <VaultMigrationController
        vaultCreating={vaultCreating}
        setCreating={setCreating}
        vaultKeys={otherSigners}
        scheme={{ m: vault.scheme.m, n: vault.scheme.n }}
        name={vault.presentationData.name}
        description={vault.presentationData.description}
        vaultId={vault.id}
        setGeneratedVaultId={setGeneratedVaultId}
        vaultType={vault.type}
        inheritanceKey={inheritanceSigner}
        isAddInheritanceKey={true}
        currentBlockHeight={currentBlockHeight}
        selectedDuration={selectedOption?.label}
      />
    </ScreenWrapper>
  );
}

export default ResetInheritanceKey;

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
