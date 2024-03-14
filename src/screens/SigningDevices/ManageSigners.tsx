import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Box, ScrollView, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import useSigners from 'src/hooks/useSigners';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';
import { windowWidth } from 'src/constants/responsive';
import AddCard from 'src/components/AddCard';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useSignerMap from 'src/hooks/useSignerMap';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import { UNVERIFYING_SIGNERS, getSignerDescription, getSignerNameFromType } from 'src/hardware';
import SignerIcon from 'src/assets/images/signer_brown.svg';
import useVault from 'src/hooks/useVault';
import { Signer, Vault, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import { resetSignersUpdateState } from 'src/store/reducers/bhr';
import { useDispatch } from 'react-redux';
import { NetworkType, SignerType } from 'src/services/wallets/enums';
import config from 'src/services/config';
import moment from 'moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import KeeperFooter from 'src/components/KeeperFooter';
import FloatingCTA from 'src/components/FloatingCTA';
import KeeperModal from 'src/components/KeeperModal';
import ActionCard from 'src/components/ActionCard';
import WalletVault from 'src/assets/images/wallet_vault.svg';
import Hide from 'src/assets/images/hide_icon.svg';
import ShowAll from 'src/assets/images/show_all.svg';
import Text from 'src/components/KeeperText';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import TickIcon from 'src/assets/images/tick_icon.svg';
import SignerCard from '../AddSigner/SignerCard';

type ScreenProps = NativeStackScreenProps<AppStackParams, 'ManageSigners'>;

function ManageSigners({ route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { vaultId = '' } = route.params || {};
  const { activeVault } = useVault({ vaultId });
  const { signers: vaultKeys } = activeVault || { signers: [] };
  const { signerMap } = useSignerMap();
  const { signers } = useSigners();
  const { realySignersUpdateErrorMessage } = useAppSelector((state) => state.bhr);
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();

  useEffect(() => {
    if (realySignersUpdateErrorMessage) {
      showToast(realySignersUpdateErrorMessage);
      dispatch(resetSignersUpdateState());
    }
    return () => {
      dispatch(resetSignersUpdateState());
    };
  }, [realySignersUpdateErrorMessage]);

  const handleCardSelect = (signer, item) => {
    navigation.dispatch(
      CommonActions.navigate('SigningDeviceDetails', {
        signerId: signer.masterFingerprint,
        vaultId,
        vaultKey: vaultKeys.length ? item : undefined,
        vaultSigners: vaultKeys,
      })
    );
  };

  const handleAddSigner = () => {
    navigation.dispatch(CommonActions.navigate('SigningDeviceList', { addSignerFlow: true }));
  };

  const { top } = useSafeAreaInsets();

  return (
    <Box backgroundColor={`${colorMode}.RussetBrown`} style={[styles.wrapper, { paddingTop: top }]}>
      <Box style={styles.topSection}>
        <KeeperHeader
          title="Manage Keys"
          subtitle="View and change key details"
          mediumTitle
          titleColor={`${colorMode}.seashellWhite`}
          subTitleColor={`${colorMode}.seashellWhite`}
          icon={
            <CircleIconWrapper
              backgroundColor={`${colorMode}.seashellWhite`}
              icon={<SignerIcon />}
            />
          }
          contrastScreen
        />
      </Box>
      <Box style={styles.signersContainer} backgroundColor={`${colorMode}.primaryBackground`}>
        <SignersList
          colorMode={colorMode}
          vaultKeys={vaultKeys}
          signers={signers}
          signerMap={signerMap}
          handleCardSelect={handleCardSelect}
          handleAddSigner={handleAddSigner}
          vault={activeVault}
        />
      </Box>
    </Box>
  );
}

function FooterIcon({ Icon, colorMode }) {
  return (
    <Box
      margin="1"
      width="12"
      height="12"
      borderRadius={30}
      backgroundColor={`${colorMode}.RussetBrown`}
      justifyContent="center"
      alignItems="center"
    >
      <Icon />
    </Box>
  );
}

function Content({ colorMode, vaultUsed }: { colorMode: string; vaultUsed: Vault }) {
  return (
    <Box>
      <ActionCard
        description={vaultUsed.presentationData?.description}
        cardName={vaultUsed.presentationData.name}
        icon={<WalletVault />}
        callback={() => {}}
      />
      <Box style={{ paddingVertical: 20 }}>
        <Text color={`${colorMode}.primaryText`} style={styles.warningText}>
          Either hide the vault or remove the key from the vault to perform this operation.
        </Text>
      </Box>
    </Box>
  );
}

function SignersList({
  colorMode,
  vaultKeys,
  signers,
  signerMap,
  handleCardSelect,
  handleAddSigner,
  vault,
}: {
  colorMode: string;
  vaultKeys: VaultSigner[];
  signers: Signer[];
  signerMap: any;
  handleCardSelect: any;
  handleAddSigner: any;
  vault: Vault;
}) {
  const [hiding, setHiding] = React.useState(false);
  const [selectedSigners, setSelectedSigners] = React.useState(new Map());
  const [warningEnabled, setWarning] = React.useState(false);
  const navigation = useNavigation();
  const [vaultUsed, setVaultUsed] = React.useState<Vault>();
  const { allVaults } = useVault({ includeArchived: false });
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();

  const footerItems = [
    {
      text: 'Hide Keys',
      Icon: () => <FooterIcon Icon={Hide} colorMode={colorMode} />,
      onPress: () => {
        setHiding(true);
      },
    },
    {
      text: 'Show All',
      Icon: () => <FooterIcon Icon={ShowAll} colorMode={colorMode} />,
      onPress: () => {
        if (signers.length) {
          for (const signer of signers) {
            dispatch(updateSignerDetails(signer, 'hidden', false));
          }
          showToast('All keys shown successfully', <TickIcon />);
        }
      },
    },
  ];

  const hideKeys = () => {
    for (const mfp of selectedSigners.keys()) {
      for (const vaultItem of allVaults) {
        if (vaultItem.signers.find((signer) => signer.masterFingerprint === mfp)) {
          setVaultUsed(vaultItem);
          setWarning(true);
          return;
        }
      }
    }
    for (const mfp of selectedSigners.keys()) {
      dispatch(updateSignerDetails(signerMap[mfp], 'hidden', true));
    }
    setHiding(false);
    setSelectedSigners(new Map());
    showToast('Keys hidden successfully', <TickIcon />);
  };

  const list = vaultKeys.length ? vaultKeys : signers.filter((signer) => !signer.hidden);

  return (
    <SafeAreaView style={styles.topContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        style={styles.scrollMargin}
      >
        <Box style={styles.addedSignersContainer}>
          {list.map((item) => {
            const signer: Signer = vaultKeys.length ? signerMap[item.masterFingerprint] : item;
            const isRegistered = vaultKeys.length
              ? item.registeredVaults.find((info) => info.vaultId === vault.id)
              : false;

            const showDot =
              vaultKeys.length &&
              !UNVERIFYING_SIGNERS.includes(signer.type) &&
              !isRegistered &&
              !signer.isMock &&
              vault.isMultiSig;

            const isAMF =
              signer.type === SignerType.TAPSIGNER &&
              config.NETWORK_TYPE === NetworkType.TESTNET &&
              !signer.isMock;

            return (
              <SignerCard
                key={signer.masterFingerprint}
                onCardSelect={() => {
                  if (hiding) {
                    if (selectedSigners.has(signer.masterFingerprint)) {
                      selectedSigners.delete(signer.masterFingerprint);
                      setSelectedSigners(new Map(selectedSigners));
                    } else {
                      const updatedSigners = new Map(
                        selectedSigners.set(signer.masterFingerprint, true)
                      );
                      setSelectedSigners(updatedSigners);
                    }
                    return;
                  }
                  handleCardSelect(signer, item);
                }}
                name={getSignerNameFromType(signer.type, signer.isMock, isAMF)}
                description={getSignerDescription(
                  signer.type,
                  signer.extraData?.instanceNumber,
                  signer
                )}
                icon={SDIcons(signer.type, colorMode !== 'dark').Icon}
                isSelected={hiding ? selectedSigners.get(signer.masterFingerprint) : false}
                showSelection={hiding}
                showDot={showDot}
                isFullText
                colorVarient="green"
              />
            );
          })}
          {!vaultKeys.length ? (
            <AddCard name="Add Key" cardStyles={styles.addCard} callback={handleAddSigner} />
          ) : null}
        </Box>
      </ScrollView>
      <KeeperModal
        visible={warningEnabled && !!vaultUsed}
        close={() => setWarning(false)}
        title="Key is being used for Vault"
        subTitle="The Key you are trying to hide is used in one of the visible vaults."
        buttonText="View Vault"
        secondaryButtonText="Back"
        secondaryCallback={() => setWarning(false)}
        buttonTextColor={`${colorMode}.white`}
        buttonCallback={() => {
          setWarning(false);
          navigation.dispatch(CommonActions.navigate('VaultDetails', { vaultId: vaultUsed.id }));
        }}
        textColor={`${colorMode}.primaryText`}
        Content={() => <Content vaultUsed={vaultUsed} colorMode={colorMode} />}
      />
      {hiding ? (
        <FloatingCTA primaryText="Hide" primaryCallback={hideKeys} />
      ) : !vaultKeys.length ? (
        <KeeperFooter marginX={5} wrappedScreen={false} items={footerItems} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    marginBottom: 20,
  },
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  topSection: {
    height: '35%',
    paddingLeft: 10,
    paddingTop: 20,
  },
  signersContainer: {
    paddingHorizontal: '5%',
    flex: 1,
  },
  scrollContainer: {
    zIndex: 2,
    gap: 40,
    marginVertical: 30,
    paddingBottom: 30,
  },
  scrollMargin: {
    marginTop: '-30%',
  },
  addedSignersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  addCard: {
    height: 125,
    width: windowWidth / 3 - windowWidth * 0.05,
    margin: 3,
  },
  warningText: {
    fontSize: 13,
    padding: 1,
    letterSpacing: 0.65,
  },
});

export default ManageSigners;
