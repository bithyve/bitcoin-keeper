import React, { useCallback, useEffect, useState } from 'react';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import UTXOList from 'src/components/UTXOsComponents/UTXOList';
import NoVaultTransactionIcon from 'src/assets/images/emptystate.svg';
import VaultIcon from 'src/assets/images/icon_vault.svg';
import LinkedWallet from 'src/assets/images/walletUtxos.svg';
import { Box, HStack, Icon, VStack } from 'native-base';
import UTXOFooter from 'src/components/UTXOsComponents/UTXOFooter';
import FinalizeFooter from 'src/components/UTXOsComponents/FinalizeFooter';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { Alert, StyleSheet, FlatList, Dimensions } from 'react-native';
import UTXOSelectionTotal from 'src/components/UTXOsComponents/UTXOSelectionTotal';
import { AccountSelectionTab } from 'src/components/AccountSelectionTab';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { EntityKind, WalletType } from 'src/core/wallets/enums';
import { CommonActions, useNavigation } from '@react-navigation/native';
import KeeperModal from 'src/components/KeeperModal';
import Buttons from 'src/components/Buttons';
import { useAppSelector } from 'src/store/hooks';
import NoTransactionIcon from 'src/assets/images/noTransaction.svg';
import SwiperModalIcon from 'src/assets/images/swiper_modal_icon.svg';
import BatteryIllustration from 'src/assets/images/illustration_battery.svg';
import useVault from 'src/hooks/useVault';
import useWallets from 'src/hooks/useWallets';
import Colors from 'src/theme/Colors';
import { isNull } from 'lodash';

const { width } = Dimensions.get('window');

const getWalletBasedOnAccount = (depositWallet: Wallet | Vault, accountType: string) => {
  if (accountType === WalletType.BAD_BANK) return depositWallet?.whirlpoolConfig?.badbankWallet;
  if (accountType === WalletType.PRE_MIX) return depositWallet?.whirlpoolConfig?.premixWallet;
  if (accountType === WalletType.POST_MIX) return depositWallet?.whirlpoolConfig?.postmixWallet;
  return depositWallet;
};

function Footer({
  utxos,
  depositWallet,
  wallet,
  setEnableSelection,
  enableSelection,
  selectedUTXOs,
  setInitiateWhirlpool,
  setInitateWhirlpoolMix,
  initiateWhirlpool,
  initateWhirlpoolMix,
  setShowBatteryWarningModal,
}) {
  const navigation = useNavigation();

  const goToWhirlpoolConfiguration = () => {
    setEnableSelection(false);
    navigation.dispatch(
      CommonActions.navigate('WhirlpoolConfiguration', {
        utxos: selectedUTXOs || [],
        wallet,
      })
    );
  };

  const inititateWhirlpoolMixProcess = async () => {
    if (selectedUTXOs.length === 0) {
      Alert.alert('Please select atleast one UTXO');
      return;
    }
    setShowBatteryWarningModal(true);
  };

  return enableSelection ? (
    <FinalizeFooter
      initiateWhirlpool={initiateWhirlpool}
      setEnableSelection={setEnableSelection}
      setInitiateWhirlpool={setInitiateWhirlpool}
      initateWhirlpoolMix={initateWhirlpoolMix}
      setInitateWhirlpoolMix={setInitateWhirlpoolMix}
      secondaryText="Cancel"
      footerCallback={() =>
        initiateWhirlpool
          ? goToWhirlpoolConfiguration()
          : initateWhirlpoolMix
          ? inititateWhirlpoolMixProcess()
          : navigation.dispatch(CommonActions.navigate('Send', { sender: wallet, selectedUTXOs }))
      }
      selectedUTXOs={selectedUTXOs}
    />
  ) : (
    <UTXOFooter
      setEnableSelection={setEnableSelection}
      enableSelection={enableSelection}
      setInitiateWhirlpool={setInitiateWhirlpool}
      setInitateWhirlpoolMix={setInitateWhirlpoolMix}
      wallet={wallet}
      utxos={utxos}
      selectedUTXOs
    />
  );
}

function UTXOManagement({ route, navigation }) {
  const styles = getStyles();
  const {
    data,
    routeName,
    accountType,
  }: { data: Wallet | Vault; routeName: string; accountType: string } = route.params || {};
  const [enableSelection, _setEnableSelection] = useState(false);
  const [selectionTotal, setSelectionTotal] = useState(0);
  const [selectedUTXOMap, setSelectedUTXOMap] = useState({});
  const { id, entityKind } = data;
  const wallet =
    entityKind === EntityKind.VAULT
      ? useVault().activeVault
      : useWallets({ walletIds: [id], whirlpoolStruct: true }).wallets[0];
  const isWhirlpoolWallet = Boolean(wallet?.whirlpoolConfig?.whirlpoolWalletDetails);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | Vault>(wallet);
  const [selectedAccount, setSelectedAccount] = useState<string>();
  const [depositWallet, setDepositWallet] = useState<any>();
  const [utxos, setUtxos] = useState([]);
  const [selectedUTXOs, setSelectedUTXOs] = useState([]);
  const [initiateWhirlpool, setInitiateWhirlpool] = useState(false);
  const [initateWhirlpoolMix, setInitateWhirlpoolMix] = useState(false);
  const [showBatteryWarningModal, setShowBatteryWarningModal] = useState(false);
  const { walletPoolMap, syncing } = useAppSelector((state) => state.wallet);
  const [currentPosition, setCurrentPosition] = useState(0);

  const onViewRef = React.useRef((viewableItems) => {
    setCurrentPosition(viewableItems.changed[0].index);
  });
  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 });
  console.log(currentPosition, 'index');

  useEffect(() => {
    setSelectedAccount(accountType || WalletType.DEFAULT);
  }, [accountType]);

  useEffect(() => {
    if (isWhirlpoolWallet) {
      setDepositWallet(wallet);
      const walletAccount: Wallet = getWalletBasedOnAccount(wallet, selectedAccount);
      setSelectedWallet(walletAccount);
    } else {
      setSelectedWallet(wallet);
    }
  }, [syncing, selectedAccount]);

  const updateSelectedWallet = (selectedAccount) => {
    const walletAccount: Wallet = getWalletBasedOnAccount(wallet, selectedAccount);
    setSelectedWallet(walletAccount);
  };

  useEffect(() => {
    const { confirmedUTXOs, unconfirmedUTXOs } = selectedWallet?.specs || {
      confirmedUTXOs: [],
      unconfirmedUTXOs: [],
    };
    const utxos =
      confirmedUTXOs
        .map((utxo) => {
          utxo.confirmed = true;
          return utxo;
        })
        .concat(
          unconfirmedUTXOs.map((utxo) => {
            utxo.confirmed = false;
            return utxo;
          })
        ) || [];
    setUtxos(utxos);
  }, [selectedWallet]);

  useEffect(() => {
    const selectedUTXOsFiltered = utxos.filter(
      (utxo) => selectedUTXOMap[`${utxo.txId}${utxo.vout}`]
    );
    setSelectedUTXOs(selectedUTXOsFiltered);
  }, [utxos, selectedUTXOMap, selectionTotal]);

  const cleanUp = useCallback(() => {
    setSelectedUTXOMap({});
    setSelectionTotal(0);
  }, []);

  const setEnableSelection = useCallback(
    (value) => {
      _setEnableSelection(value);
      if (!value) {
        cleanUp();
      }
    },
    [cleanUp]
  );

  const [showSwiperModal, setShowSwiperModal] = useState(true);

  const closeShowSwiperModal = () => {
    setShowSwiperModal(false);
  };

  const SwiperModalContent = ({ contentTitle, contentSubTitle }) => {
    return (
      <Box style={styles.contentContaner}>
        <Box>
          <Text bold italic style={styles.modalTitle}>
            {contentTitle}
          </Text>
          <Text style={styles.modalSubTitle}>{contentSubTitle}</Text>
        </Box>
      </Box>
    );
  };

  const DATA = [
    {
      id: '1',
      firstContentHeading: {
        contentTitle: 'Pool',
        contentSubTitle: 'The denonination of the pool you have selected for this mix.',
      },
      secondContentHeading: {
        contentTitle: 'UTXO’s created',
        contentSubTitle: 'The number of unspent outputs that will be created with fresh histories.',
      },
      firstContentFooter: {
        contentTitle: 'Deterministic links',
        contentSubTitle:
          'The number of deterministically linked inputs and outputs in the resulting mix transaction',
      },
      secondContentFooter: {
        contentTitle: 'Combinations',
        contentSubTitle:
          'The number of potential combinations when attempting to link inputs to outputs of a single mix transaction',
      },
    },
    {
      id: '2',
      firstContentHeading: {
        contentTitle: 'Entropy',
        contentSubTitle:
          'The score of the resulting transaction when measured with the Boltzmann transaction analyzer tool.',
      },
      secondContentHeading: {
        contentTitle: 'Pool Fee',
        contentSubTitle: 'The fixed fee required to enter the pool',
      },
      firstContentFooter: {
        contentTitle: 'Total Premix Fee',
        contentSubTitle: 'The total miner fees for the Premix outputs created',
      },
      secondContentFooter: {
        contentTitle: 'Miner Fee',
        contentSubTitle: 'The miner fee for the Tx0 transaction being created',
      },
    },
  ];

  const renderItem = ({ item }) => {
    return (
      <Box>
        <SwiperModalContent
          contentTitle={item.firstContentHeading.contentTitle}
          contentSubTitle={item.firstContentHeading.contentSubTitle}
        />
        <SwiperModalContent
          contentTitle={item.secondContentHeading.contentTitle}
          contentSubTitle={item.secondContentHeading.contentSubTitle}
        />
        <Box style={styles.swiperModalIcon}>
          <SwiperModalIcon />
        </Box>
        <SwiperModalContent
          contentTitle={item.firstContentFooter.contentTitle}
          contentSubTitle={item.firstContentFooter.contentSubTitle}
        />
        <SwiperModalContent
          contentTitle={item.secondContentFooter.contentTitle}
          contentSubTitle={item.secondContentFooter.contentSubTitle}
        />
      </Box>
    );
  };

  const List = () => {
    return (
      <Box>
        <FlatList
          data={DATA}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          nestedScrollEnabled={true}
          horizontal
          snapToInterval={width}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
        />
      </Box>
    );
  };

  return (
    <ScreenWrapper>
      <HeaderTitle learnMore learnMorePressed={() => setShowSwiperModal(true)} />
      {isWhirlpoolWallet ? (
        <AccountSelectionTab
          selectedAccount={selectedAccount}
          setSelectedAccount={setSelectedAccount}
          updateSelectedWallet={updateSelectedWallet}
          setEnableSelection={setEnableSelection}
        />
      ) : (
        <HStack marginBottom={10}>
          <Box paddingX={3}>{routeName === 'Vault' ? <VaultIcon /> : <LinkedWallet />}</Box>
          <VStack>
            <Text color="light.greenText" style={[styles.vaultInfoText, { fontSize: 16 }]}>
              {wallet?.presentationData?.name}
            </Text>
            <Text color="light.grayText" style={[styles.vaultInfoText, { fontSize: 12 }]}>
              {wallet?.presentationData?.description}
            </Text>
          </VStack>
        </HStack>
      )}
      <Box style={{ flex: 1, paddingHorizontal: 10 }}>
        {Object.values(selectedUTXOMap).length ? (
          <UTXOSelectionTotal selectionTotal={selectionTotal} selectedUTXOs={selectedUTXOs} />
        ) : null}
        <UTXOList
          utxoState={utxos}
          enableSelection={enableSelection}
          setSelectionTotal={setSelectionTotal}
          selectedUTXOMap={selectedUTXOMap}
          setSelectedUTXOMap={setSelectedUTXOMap}
          currentWallet={selectedWallet}
          emptyIcon={routeName === 'Vault' ? NoVaultTransactionIcon : NoTransactionIcon}
        />
      </Box>
      <Footer
        utxos={utxos}
        setInitiateWhirlpool={setInitiateWhirlpool}
        setInitateWhirlpoolMix={setInitateWhirlpoolMix}
        depositWallet={depositWallet}
        wallet={selectedWallet}
        setEnableSelection={setEnableSelection}
        initiateWhirlpool={initiateWhirlpool}
        initateWhirlpoolMix={initateWhirlpoolMix}
        enableSelection={enableSelection}
        selectedUTXOs={selectedUTXOs}
        setShowBatteryWarningModal={setShowBatteryWarningModal}
      />
      <KeeperModal
        justifyContent="flex-end"
        visible={showBatteryWarningModal}
        close={() => {
          setShowBatteryWarningModal(false);
        }}
        title="Managing your mobile mixes"
        subTitle="Mix might take a while to complete. Dont close the app until the mix is complete."
        subTitleColor="#5F6965"
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonTextColor="#FAFAFA"
        closeOnOverlayClick={false}
        Content={() => (
          <Box>
            <Box style={styles.batteryModalContent}>
              <Box style={styles.batteryImage}>
                <BatteryIllustration />
              </Box>
              <Box style={styles.batteryModalTextArea}>
                <Box style={{ flexDirection: 'row' }}>
                  <Text style={[styles.batteryModalText, styles.bulletPoint]}>{'\u2022'}</Text>
                  <Text style={styles.batteryModalText}>Connect to power</Text>
                </Box>
                <Box style={{ flexDirection: 'row' }}>
                  <Text style={[styles.batteryModalText, styles.bulletPoint]}>{'\u2022'}</Text>
                  <Text style={styles.batteryModalText}>20% battery required</Text>
                </Box>
              </Box>
            </Box>

            <Box style={styles.mixSuccesModalFooter}>
              <Box style={{ alignSelf: 'flex-end' }}>
                <Buttons
                  primaryText="Continue"
                  primaryCallback={() => {
                    setShowBatteryWarningModal(false);
                    setEnableSelection(false);
                    navigation.navigate('MixProgress', {
                      selectedUTXOs,
                      depositWallet,
                      selectedWallet,
                      walletPoolMap,
                    });
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}
      />
      <KeeperModal
        visible={showSwiperModal}
        close={closeShowSwiperModal}
        title="Some Definitions:"
        modalBackground={['light.gradientStart', 'light.gradientEnd']}
        textColor="light.white"
        buttonTextColor="light.greenText"
        buttonBackground={['#FFF', '#80A8A1']}
        buttonCallback={closeShowSwiperModal}
        Content={() => {
          return <List />;
        }}
        DarkCloseIcon
        learnMore
        buttonText={currentPosition !== 0 && 'continue'}
        pagination={
          currentPosition === 0 && (
            <Box style={styles.paginationDots}>
              <Box style={styles.selectedDot} />
              <Box style={styles.unSelectedDot} />
            </Box>
          )
        }
      />
    </ScreenWrapper>
  );
}
const getStyles = () =>
  StyleSheet.create({
    vaultInfoText: {
      marginLeft: wp(3),
      letterSpacing: 1.28,
    },
    mixSuccesModalFooter: {
      marginTop: 20,
      flexDirection: 'row',
      alignContent: 'flex-end',
      justifyContent: 'flex-end',
      width: '100%',
    },
    batteryModalContent: {
      marginTop: 20,
      alignContent: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    batteryImage: {
      alignSelf: 'center',
    },
    batteryModalTextArea: {
      marginTop: 40,
    },
    bulletPoint: {
      paddingRight: 10,
      fontSize: 16,
      fontWeight: '600',
    },
    batteryModalText: {
      marginTop: 10,
      letterSpacing: 1.28,
    },
    modalTitle: {
      fontSize: 13,
      lineHeight: 18,
      textAlign: 'left',
      letterSpacing: 0.65,
      color: Colors.White,
    },
    modalSubTitle: {
      fontSize: 13,
      lineHeight: 18,
      textAlign: 'left',
      letterSpacing: 0.65,
      color: Colors.White,
      marginBottom: hp(15),
      maxWidth: hp(270),
    },
    swiperModalIcon: {
      alignSelf: 'center',
      marginTop: hp(-15),
      marginBottom: hp(8),
    },
    contentContaner: {
      width: hp(290),
    },
    paginationDots: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    selectedDot: {
      width: 25,
      height: 5,
      borderRadius: 5,
      backgroundColor: '#E3BE96',
      marginEnd: 5,
    },
    unSelectedDot: {
      width: 6,
      height: 5,
      borderRadius: 5,
      backgroundColor: '#89AEA7',
      marginEnd: 5,
    },
  });
export default UTXOManagement;
