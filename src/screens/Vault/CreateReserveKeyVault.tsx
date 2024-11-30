import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Box, useColorMode } from 'native-base';
import { useDispatch } from 'react-redux';
import { useFocusEffect, useNavigation, CommonActions } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { VaultType } from 'src/services/wallets/enums';
import { resetRealyVaultState } from 'src/store/reducers/bhr';
import { useAppSelector } from 'src/store/hooks';
import KeeperModal from 'src/components/KeeperModal';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { wp, hp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import CardPill from 'src/components/CardPill';
import HexagonIcon from 'src/components/HexagonIcon';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import { StyleSheet } from 'react-native';
import useVault from 'src/hooks/useVault';
import Colors from 'src/theme/Colors';
import VaultMigrationController from './VaultMigrationController';

function CreateReserveKeyVault({
  vaultCreating,
  setCreating,
  vaultKeys,
  reservedKey,
  scheme,
  name,
  description,
  vaultId,
  isAddInheritanceKey,
  currentBlockHeight,
  selectedDuration,
}) {
  const { showToast } = useToastMessage();

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultTranslation, common } = translations;
  const isDarkMode = colorMode === 'dark';

  const [vaultCreatedModalVisible, setVaultCreatedModalVisible] = useState(false);
  const { relayVaultUpdate, relayVaultError, realyVaultErrorMessage } = useAppSelector(
    (state) => state.bhr
  );
  const [generatedVaultId, setGeneratedVaultId] = useState('');

  const { allVaults } = useVault({ vaultId });
  const newVault = allVaults.filter((v) => v.id === generatedVaultId)[0];

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
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: 'Home' },
          {
            name: 'VaultDetails',
            params: { vaultId: generatedVaultId, vaultTransferSuccessful: true },
          },
        ],
      })
    );
  };

  function VaultCreatedModalContent(vault: Vault) {
    const tags = ['Inheritance Key', `${vault.scheme.m}-of-${vault.scheme.n}`];
    return (
      <Box>
        <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.walletVaultInfoContainer}>
          <Box style={styles.pillsContainer}>
            {tags?.map((tag, index) => {
              return (
                <CardPill
                  key={tag}
                  heading={tag}
                  backgroundColor={
                    index % 2 !== 0 ? null : `${colorMode}.SignleSigCardPillBackColor`
                  }
                />
              );
            })}
          </Box>
          <Box style={styles.walletVaultInfoWrapper}>
            <Box style={styles.iconWrapper}>
              <HexagonIcon
                width={44}
                height={38}
                backgroundColor={isDarkMode ? Colors.DullGreenDark : Colors.pantoneGreen}
                icon={<VaultIcon />}
              />
            </Box>
            <Box>
              {vault.presentationData.description ? (
                <Text fontSize={12} color={`${colorMode}.secondaryText`}>
                  {vault.presentationData.description}
                </Text>
              ) : null}
              <Text color={`${colorMode}.greenText`} medium style={styles.titleText}>
                {vault.presentationData.name}
              </Text>
            </Box>
          </Box>
        </Box>
        <Box>
          <Text color={`${colorMode}.secondaryText`} style={styles.descText}>
            {vaultTranslation.VaultCreatedModalDesc}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <VaultMigrationController
        vaultCreating={vaultCreating}
        vaultKeys={vaultKeys}
        scheme={scheme}
        name={name}
        description={description}
        vaultId={vaultId}
        setGeneratedVaultId={setGeneratedVaultId}
        vaultType={VaultType.INHERITANCE}
        inheritanceKey={reservedKey}
        isAddInheritanceKey={isAddInheritanceKey}
        currentBlockHeight={currentBlockHeight}
        selectedDuration={selectedDuration}
      />
      <KeeperModal
        dismissible
        close={() => {}}
        visible={vaultCreatedModalVisible}
        title={vaultTranslation.vaultCreatedSuccessTitle}
        subTitle={`Your ${newVault?.scheme?.m}-of-${newVault?.scheme?.n} vault has been created successfully. Please test the setup before putting in significant amounts.`}
        Content={() => VaultCreatedModalContent(newVault)}
        buttonText={vaultTranslation.ViewVault}
        buttonCallback={viewVault}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.buttonText`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        subTitleWidth={wp(280)}
        showCloseIcon={false}
      />
    </>
  );
}

export default CreateReserveKeyVault;
const styles = StyleSheet.create({
  walletVaultInfoContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    marginVertical: 20,
    borderRadius: 10,
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  walletVaultInfoWrapper: {
    flexDirection: 'row',
  },
  iconWrapper: {
    marginRight: 10,
  },
  titleText: {
    fontSize: 14,
  },
  descText: {
    fontSize: 14,
    width: wp(300),
    marginBottom: hp(18),
  },
});
