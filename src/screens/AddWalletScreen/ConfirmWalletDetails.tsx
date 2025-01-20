import React, { useCallback, useState, useContext, useEffect, useRef } from 'react';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { Box, Pressable, ScrollView, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import Buttons from 'src/components/Buttons';
import { NewWalletInfo } from 'src/store/sagas/wallets';
import {
  DerivationPurpose,
  EntityKind,
  MiniscriptTypes,
  VaultType,
  WalletType,
} from 'src/services/wallets/enums';
import { useDispatch } from 'react-redux';
import { addNewWallets } from 'src/store/sagaActions/wallets';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import PrivacyIcon from 'src/assets/images/privacy.svg';
import EfficiencyIcon from 'src/assets/images/efficiency.svg';
import SaclingIcon from 'src/assets/images/scaling.svg';
import SecurityIcon from 'src/assets/images/security.svg';

import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import { resetRealyVaultState, resetRealyWalletState } from 'src/store/reducers/bhr';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { defaultTransferPolicyThreshold } from 'src/store/sagas/storage';
import { v4 as uuidv4 } from 'uuid';
import KeeperModal from 'src/components/KeeperModal';
import { hp, wp } from 'src/constants/responsive';
import WalletUtilities from 'src/services/wallets/operations/utils';
import config from 'src/utils/service-utilities/config';
import { StyleSheet } from 'react-native';
import { resetWalletStateFlags } from 'src/store/reducers/wallets';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperTextInput from 'src/components/KeeperTextInput';
import SettingsIcon from 'src/assets/images/settings_grey.svg';
import EditIcon from 'src/assets/images/edit_brown.svg';
import WalletVaultCreationModal from 'src/components/Modal/WalletVaultCreationModal';
import useWallets from 'src/hooks/useWallets';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import AddCircleLight from 'src/assets/images/add-circle-light.svg';
import VaultMigrationController from '../Vault/VaultMigrationController';
import useVault from 'src/hooks/useVault';
import CardPill from 'src/components/CardPill';
import HexagonIcon from 'src/components/HexagonIcon';
import { Vault } from 'src/services/wallets/interfaces/vault';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import DerivationPathModalContent from '../EnterWalletDetailScreen/DerivationPathModal';
import useWalletAsset from 'src/hooks/useWalletAsset';
import WalletHeader from 'src/components/WalletHeader';
import { SignersList } from '../SigningDevices/ManageSigners';
import SignerCard from '../AddSigner/SignerCard';
import { getKeyUID } from 'src/utils/utilities';
import { getSignerDescription, getSignerNameFromType } from 'src/hardware';
import { SDIcons } from '../Vault/SigningDeviceIcons';

// eslint-disable-next-line react/prop-types
function ConfirmWalletDetails({ route }) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const { wallets } = useWallets({ getAll: true });
  const { translations } = useContext(LocalizationContext);
  const { wallet, choosePlan, common, importWallet, vault: vaultTranslation } = translations;
  const [walletName, setWalletName] = useState(route.params?.name);
  const { getWalletTags } = useWalletAsset();

  const isHotWallet = route.params?.isHotWallet;
  const [walletCreatedModal, setWalletCreatedModal] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [transferPolicy, setTransferPolicy] = useState(
    defaultTransferPolicyThreshold?.toString() || ''
  );
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError, realyWalletErrorMessage } =
    useAppSelector((state) => state.bhr);
  const { hasNewWalletsGenerationFailed, err } = useAppSelector((state) => state.wallet);
  const [visibleModal, setVisibleModal] = useState(false);
  const [purpose, setPurpose] = useState(DerivationPurpose.BIP84);
  const [path, setPath] = useState(
    route.params?.path
      ? route.params?.path
      : WalletUtilities.getDerivationPath(EntityKind.WALLET, config.NETWORK_TYPE, 0, purpose)
  );
  const [advancedSettingsVisible, setAdvancedSettingsVisible] = useState(false);

  const descriptionInputRef = useRef('');
  const initialDescription = useRef(descriptionInputRef.current);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const onDescriptionChange = (value) => {
    descriptionInputRef.current = value;
  };
  const [vaultCreating, setCreating] = useState(false);
  const [generatedVaultId, setGeneratedVaultId] = useState('');
  const { allVaults } = useVault({});
  const newVault = allVaults.filter((v) => v.id === generatedVaultId)[0];
  const [vaultCreatedModalVisible, setVaultCreatedModalVisible] = useState(false);
  const vaultType = route.params.vaultType;

  const createNewHotWallet = useCallback(() => {
    // Note: only caters to new wallets(imported wallets currently have a different flow)
    setWalletLoading(true);
    const newWallet: NewWalletInfo = {
      walletType: WalletType.DEFAULT,
      walletDetails: {
        name: walletName,
        description: descriptionInputRef.current,
        derivationConfig: {
          path,
          purpose,
        },
        transferPolicy: {
          id: uuidv4(),
          threshold: transferPolicy ? parseInt(transferPolicy) : 0,
        },
        instanceNum: route.params.hotWalletInstanceNum,
      },
    };
    dispatch(addNewWallets([newWallet]));
  }, [walletName, descriptionInputRef, path, purpose, transferPolicy]);

  const { relayVaultUpdate, relayVaultError, realyVaultErrorMessage } = useAppSelector(
    (state) => state.bhr
  );

  useEffect(() => {
    if (relayWalletUpdate) {
      dispatch(resetRealyWalletState());
      setWalletLoading(false);
      setWalletCreatedModal(true);
    }
    if (relayWalletError) {
      showToast(realyWalletErrorMessage || wallet.walletCreationFailed, <ToastErrorIcon />);
      setWalletLoading(false);
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError]);

  function FailedModalContent() {
    return (
      <Box w="100%">
        <Buttons
          primaryCallback={() => {
            navigation.replace('ChoosePlan');
            dispatch(resetWalletStateFlags());
          }}
          primaryText={choosePlan.viewSubscription}
          activeOpacity={0.5}
          secondaryCallback={() => {
            dispatch(resetWalletStateFlags());
            navigation.replace('ChoosePlan');
          }}
          secondaryText={common.cancel}
          paddingHorizontal={wp(30)}
        />
      </Box>
    );
  }

  function TapRootContent() {
    const { colorMode } = useColorMode();
    const { translations } = useContext(LocalizationContext);
    const { wallet } = translations;
    return (
      <Box>
        <Box style={styles.tapRootContainer}>
          <Box style={styles.tapRootIconWrapper}>
            <PrivacyIcon />
          </Box>
          <Box style={styles.tapRootContentWrapper}>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.tapRootTitleText}>
              {wallet.tapRootPrivacy}
            </Text>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.tapRootDescText}>
              {wallet.tapRootPrivacyDesc}
            </Text>
          </Box>
        </Box>
        <Box style={styles.tapRootContainer}>
          <Box style={styles.tapRootIconWrapper}>
            <EfficiencyIcon />
          </Box>
          <Box style={styles.tapRootContentWrapper}>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.tapRootTitleText}>
              {wallet.tapRootEfficiency}
            </Text>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.tapRootDescText}>
              {wallet.tapRootEfficiencyDesc}
            </Text>
          </Box>
        </Box>
        <Box style={styles.tapRootContainer}>
          <Box style={styles.tapRootIconWrapper}>
            <SaclingIcon />
          </Box>
          <Box style={styles.tapRootContentWrapper}>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.tapRootTitleText}>
              {wallet.tapRootScalable}
            </Text>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.tapRootDescText}>
              {wallet.tapRootScalableDesc}
            </Text>
          </Box>
        </Box>
        <Box style={styles.tapRootContainer}>
          <Box style={styles.tapRootIconWrapper}>
            <SecurityIcon />
          </Box>
          <Box style={styles.tapRootContentWrapper}>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.tapRootTitleText}>
              {wallet.tapRootSecurity}
            </Text>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.tapRootDescText}>
              {wallet.tapRootSecurityDesc}
            </Text>
          </Box>
        </Box>
      </Box>
    );
  }

  function VaultCreatedModalContent(vault: Vault) {
    console.log(vault);
    const tags = getWalletTags(vault).map((tag, index) => ({
      ...tag,
      key: `tag-${index}-${tag.tag}`,
    }));

    return (
      <Box>
        <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.walletVaultInfoContainer}>
          <Box style={styles.pillsContainer}>
            {tags?.map((tag, index) => {
              return (
                <CardPill
                  key={tag.key}
                  heading={tag.tag}
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
                backgroundColor="rgba(45, 103, 89, 1)"
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
      </Box>
    );
  }

  function SingleSigWallet(vault: Vault) {
    const tags = getWalletTags(vault).map((tag, index) => ({
      ...tag,
      key: `tag-${index}-${tag.tag}`,
    }));
    return (
      <Box>
        <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.walletVaultInfoContainer}>
          <Box style={styles.pillsContainer}>
            {tags?.map((tag, index) => {
              return (
                <CardPill
                  key={tag.key}
                  heading={tag.tag}
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
                backgroundColor="rgba(45, 103, 89, 1)"
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
      </Box>
    );
  }

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

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        title="Confirm your wallet details"
        rightComponent={
          isHotWallet && (
            <Pressable
              style={styles.advancedContainer}
              onPress={() => setAdvancedSettingsVisible(true)}
            >
              <SettingsIcon />
            </Pressable>
          )
        }
      />
      <Box style={{ flex: 1, justifyContent: 'space-between' }}>
        <Box style={styles.fieldsContainer}>
          <Text fontSize={14} medium>
            Your wallet name
          </Text>
          <Box style={styles.inputFieldWrapper}>
            <KeeperTextInput
              placeholder={wallet.WalletNamePlaceHolder}
              value={walletName}
              onChangeText={(value) => {
                setWalletName(value);
              }}
              maxLength={18}
              testID="input_wallet_name"
            />
          </Box>
          <Pressable
            onPress={() => {
              setShowDescriptionModal(true);
              initialDescription.current = descriptionInputRef.current;
            }}
          >
            <Box style={styles.descriptionContainer}>
              <Text color={`${colorMode}.greenText`}>Add Description</Text>
              <AddCircleLight />
            </Box>
          </Pressable>
        </Box>
        <Box flexDirection={'row'}>
          <Text fontSize={14} medium style={{ flex: 1 }}>
            Your wallet keys
          </Text>
          <Pressable
            style={styles.editKeysContainer}
            onPress={() => {
              if (route.params.isAddInheritanceKey) {
                navigation.goBack();
              }
              navigation.goBack();
            }}
          >
            <EditIcon />
            <Text color={`${colorMode}.BrownNeedHelp`} semiBold fontSize={13}>
              Edit
            </Text>
          </Pressable>
        </Box>
        <ScrollView>
          <Box flexDirection={'row'} flex={1} marginTop={hp(20)} flexWrap={'wrap'}>
            {route.params.selectedSigners.map((signer) => {
              return (
                <SignerCard
                  key={getKeyUID(signer)}
                  name={getSignerNameFromType(signer.type, signer.isMock, signer.isAMF)}
                  description={getSignerDescription(signer)}
                  // customStyle={styles.signerCard}
                  icon={SDIcons(signer.type).Icon}
                  image={signer?.extraData?.thumbnailPath}
                  showSelection={false}
                  isFullText
                  colorVarient="green"
                  colorMode={colorMode}
                />
              );
            })}
          </Box>
        </ScrollView>
        <Box style={styles.footer}>
          <Buttons
            primaryText={'Create your Wallet'}
            primaryCallback={
              isHotWallet
                ? createNewHotWallet
                : () => {
                    setCreating(true);
                  }
            }
            primaryDisable={!walletName}
            primaryLoading={walletLoading || relayWalletUpdateLoading}
            fullWidth
          />
        </Box>
      </Box>
      <VaultMigrationController
        vaultCreating={vaultCreating}
        vaultKeys={route.params.vaultKeys}
        scheme={route.params.scheme}
        name={walletName}
        description={descriptionInputRef.current}
        vaultId={''}
        setGeneratedVaultId={setGeneratedVaultId}
        setCreating={setCreating}
        vaultType={VaultType.MINISCRIPT}
        inheritanceKey={route.params.reservedKey ?? null}
        isAddInheritanceKey={route.params.isAddInheritanceKey}
        currentBlockHeight={route.params.currentBlockHeight}
        selectedDuration={route.params.selectedDuration}
        miniscriptTypes={route.params.isAddInheritanceKey ? [MiniscriptTypes.INHERITANCE] : []}
      />
      <KeeperModal
        visible={showDescriptionModal}
        close={() => setShowDescriptionModal(false)}
        title="Add Description"
        subTitle="This will reflect on the home screen"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        showCloseIcon={false}
        Content={() => (
          <Box style={styles.descriptionInput}>
            <KeeperTextInput
              ref={(input) => {
                descriptionInputRef.current = input ? input.value : '';
              }}
              placeholder="Add a description (Optional)"
              defaultValue={descriptionInputRef.current}
              onChangeText={onDescriptionChange}
              testID="vault_description"
              maxLength={20}
            />
          </Box>
        )}
        buttonText="Save Changes"
        buttonCallback={() => {
          setShowDescriptionModal(false);
          showToast('Description added successfully!', <TickIcon />);
        }}
        secondaryButtonText="Cancel"
        secondaryCallback={() => {
          descriptionInputRef.current = initialDescription.current;
          setShowDescriptionModal(false);
        }}
      />
      <KeeperModal
        visible={advancedSettingsVisible}
        close={() => setAdvancedSettingsVisible(false)}
        title={importWallet.derivationPath}
        subTitle="Change or update purpose"
        subTitleWidth={wp(240)}
        subTitleColor={`${colorMode}.secondaryText`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.primaryText`}
        showCloseIcon={false}
        learnMoreButton={true}
        learnButtonTextColor={`${colorMode}.white`}
        learnMoreButtonPressed={() => {
          setVisibleModal(true);
        }}
        Content={() => (
          <DerivationPathModalContent
            initialPath={path}
            initialPurpose={purpose}
            closeModal={() => setAdvancedSettingsVisible(false)}
            setSelectedPath={setPath}
            setSelectedPurpose={setPurpose}
          />
        )}
      />
      <KeeperModal
        dismissible
        close={() => {}}
        visible={hasNewWalletsGenerationFailed}
        subTitle={err}
        title="Failed"
        Content={FailedModalContent}
        buttonText=""
        buttonCallback={() => {
          // setInitiating(true)
        }}
        subTitleColor={`${colorMode}.secondaryText`}
        subTitleWidth={wp(210)}
        showCloseIcon={false}
      />
      <KeeperModal
        dismissible
        close={() => {}}
        visible={vaultCreatedModalVisible}
        title={'Wallet Created Successfully'}
        subTitle="Your new wallet was created successfully and is ready to use."
        Content={
          vaultType === VaultType.SINGE_SIG
            ? () => SingleSigWallet(newVault)
            : () => VaultCreatedModalContent(newVault)
        }
        buttonText={'View Wallet'}
        buttonCallback={viewVault}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.buttonText`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        subTitleWidth={wp(280)}
        showCloseIcon={false}
      />
      <WalletVaultCreationModal
        visible={walletCreatedModal}
        title="Wallet Created Successfully!"
        subTitle="Your new wallet was created successfully and is ready to use."
        buttonText="View Wallet"
        descriptionMessage="Make sure to securely store your Recovery Key as back up for your wallet"
        buttonCallback={() => {
          setWalletCreatedModal(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: 'Home' },
                {
                  name: 'WalletDetails',
                  params: { autoRefresh: true, walletId: wallets[wallets.length - 1].id },
                },
              ],
            })
          );
        }}
        walletType={WalletType.DEFAULT}
        walletName={walletName}
        walletDescription={descriptionInputRef.current}
      />
      <KeeperModal
        visible={visibleModal}
        close={() => {
          setVisibleModal(false);
        }}
        title={wallet.tapRootBenefits}
        subTitle={''}
        modalBackground={`${colorMode}.modalGreenBackground`}
        textColor={`${colorMode}.modalGreenContent`}
        Content={TapRootContent}
        showCloseIcon={true}
        DarkCloseIcon
        buttonText={common.Okay}
        secondaryButtonText={common.needHelp}
        buttonTextColor={`${colorMode}.whiteButtonText`}
        buttonBackground={`${colorMode}.whiteButtonBackground`}
        secButtonTextColor={`${colorMode}.whiteSecButtonText`}
        secondaryCallback={() => {
          setAdvancedSettingsVisible(false);
          setVisibleModal(false);
          navigation.dispatch(
            CommonActions.navigate({
              name: 'TechnicalSupport',
              params: {
                tags: [ConciergeTag.WALLET],
                screenName: 'add-wallet-advanced-settings',
              },
            })
          );
        }}
        buttonCallback={() => setVisibleModal(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  inputFieldWrapper: {
    borderRadius: 10,
    marginRight: wp(10),
  },
  amountWrapper: {
    marginHorizontal: 10,
    marginTop: hp(30),
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    gap: 10,
    justifyContent: 'space-between',
  },
  balanceCrossesText: {
    fontSize: 12,
    letterSpacing: 0.12,
    marginTop: hp(10),
    marginHorizontal: 12,
  },
  fieldsContainer: {
    marginTop: hp(30),
    marginBottom: hp(50),
    gap: hp(10),
  },
  footer: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  advancedContainer: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 22,
  },
  editKeysContainer: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    paddingHorizontal: wp(16),
  },
  tapRootContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  tapRootIconWrapper: {
    width: '15%',
  },
  tapRootContentWrapper: {
    width: '85%',
    marginBottom: hp(20),
  },
  tapRootDescText: {
    fontSize: 13,
    letterSpacing: 0.65,
    padding: 1,
    marginBottom: 5,
  },
  tapRootTitleText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.65,
    padding: 1,
  },
  descriptionContainer: {
    width: '100%',
    height: hp(30),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(5),
  },
  descriptionInput: {
    marginBottom: hp(10),
  },
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
    marginBottom: hp(3),
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

export default ConfirmWalletDetails;
