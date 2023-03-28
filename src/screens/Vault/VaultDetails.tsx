import { VStack } from 'native-base';
import { StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import LinearGradient from 'src/components/KeeperGradient';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { VaultMigrationType } from 'src/core/wallets/enums';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePlan from 'src/hooks/usePlan';
import useVault from 'src/hooks/useVault';
import UTXOsManageNavBox from 'src/components/UTXOsComponents/UTXOsManageNavBox';
import VaultInfo from './components/VaultInfo';
import VaultFooter from './components/VaultFooter';
import VaultHeader from './components/VaultHeader';
import SignerList from './components/SignerList';
import TransactionsAndUTXOs from './components/TransactionsAndUTXOs';
import VaultModals from './components/VaultModals';

<<<<<<< HEAD
function Footer({ vault }: { vault: Vault }) {
  const navigation = useNavigation();
  const { showToast } = useToastMessage();

  const styles = getStyles(0);
  return (
    <Box>
      <Box borderWidth={0.5} borderColor="light.GreyText" borderRadius={20} opacity={0.2} />
      <Box flexDirection="row" justifyContent="space-between" marginX={10} marginTop={3}>
        <TouchableOpacity
          style={styles.IconText}
          onPress={() => {
            navigation.dispatch(CommonActions.navigate('Send', { sender: vault }));
          }}
          testID={'btn_send'}
        >
          <Send />
          <Text color="light.primaryText" style={styles.footerText}>
            Send
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.IconText}
          onPress={() => {
            navigation.dispatch(CommonActions.navigate('Receive', { wallet: vault }));
          }}
          testID={'btn_receive'}
        >
          <Recieve />
          <Text color="light.primaryText" style={styles.footerText}>
            Receive
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.IconText}
          onPress={() => {
            showToast('Comming Soon');
          }}
          testID={'btn_buy'}
        >
          <Buy />
          <Text color="light.primaryText" style={styles.footerText}>
            Buy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.IconText}
          onPress={() => {
            navigation.navigate('VaultSettings');
          }}
          testID={'btn_settings'}
        >
          <IconSettings />
          <Text color="light.primaryText" style={styles.footerText}>
            Settings
          </Text>
        </TouchableOpacity>
      </Box>
    </Box>
  );
}

function Header() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const styles = getStyles(0);
  return (
    <Box flexDirection="row" width="100%" px="2%">
      <StatusBar barStyle="light-content" />
      <Box width="50%">
        <TouchableOpacity onPress={() => navigation.goBack()} testID={'btn_back'}>
          <BackIcon />
        </TouchableOpacity>
      </Box>
      <Box width="50%">
        <TouchableOpacity style={styles.knowMore} onPress={() => dispatch(setIntroModal(true))} testID={'btn_knowMore'}>
          <Text color="light.white" style={styles.footerText} light>
            Know More
          </Text>
        </TouchableOpacity>
      </Box>
    </Box>
  );
}

function VaultInfo({ vault }: { vault: Vault }) {
  const {
    presentationData: { name, description } = { name: '', description: '' },
    specs: { balances: { confirmed, unconfirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
  } = vault;
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);

  const styles = getStyles(0);
  return (
    <VStack paddingY={12}>
      <HStack alignItems="center" justifyContent="space-between">
        <HStack>
          <Box paddingRight={3}>
            <VaultIcon />
          </Box>
          <VStack>
            <Text color="light.white" style={styles.vaultInfoText} fontSize={16}>
              {name}
            </Text>
            <Text color="light.white" style={styles.vaultInfoText} fontSize={12}>
              {description}
            </Text>
          </VStack>
        </HStack>
        <VStack alignItems="flex-end">
          <Text color="light.white" style={styles.vaultInfoText} fontSize={9}>
            Unconfirmed
          </Text>
          {getNetworkAmount(
            unconfirmed,
            exchangeRates,
            currencyCode,
            currentCurrency,
            [styles.vaultInfoText, { fontSize: 12 }],
            0.9
          )}
        </VStack>
      </HStack>
      <VStack paddingBottom="16" paddingTop="6">
        {getNetworkAmount(confirmed, exchangeRates, currencyCode, currentCurrency, [
          styles.vaultInfoText,
          { fontSize: 31, lineHeight: 31 },
          2,
        ])}
        <Text color="light.white" style={styles.vaultInfoText} fontSize={9}>
          Available Balance
        </Text>
      </VStack>
    </VStack>
  );
}

function TransactionList({ transactions, pullDownRefresh, pullRefresh }) {
  const navigation = useNavigation();

  const renderTransactionElement = ({ item }) => (
    <TransactionElement
      transaction={item}
      onPress={() => {
        navigation.dispatch(
          CommonActions.navigate('TransactionDetails', {
            transaction: item,
          })
        );
      }}
    />
  );
  return (
    <>
      <VStack style={{ paddingTop: windowHeight * 0.09 }}>
        <HStack justifyContent="space-between">
          <Text color="light.textBlack" marginLeft={wp(3)} fontSize={16} letterSpacing={1.28}>
            Transactions
          </Text>
          {transactions.lenth ? (
            <TouchableOpacity>
              <HStack alignItems="center">
                <TouchableOpacity
                  onPress={() => {
                    navigation.dispatch(
                      CommonActions.navigate('VaultTransactions', {
                        title: 'Vault Transactions',
                        subtitle: 'All incoming and outgoing transactions',
                      })
                    );
                  }}
                  testID={'btn_viewAll'}
                >
                  <Text
                    color="light.primaryGreen"
                    marginRight={2}
                    fontSize={11}
                    bold
                    letterSpacing={0.6}
                  >
                    View All
                  </Text>
                </TouchableOpacity>
                <IconArrowBlack />
              </HStack>
            </TouchableOpacity>
          ) : null}
        </HStack>
      </VStack>
      <FlatList
        refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
        data={transactions}
        renderItem={renderTransactionElement}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyStateView
            IllustartionImage={NoVaultTransactionIcon}
            title="Security Tip"
            subTitle="Recreate the multisig on more coordinators. Receive a small amount and send a part of it. Check the balances are appropriately reflected across all the coordinators after each step."
          />
        }
      />
    </>
  );
}

function SignerList({ upgradeStatus, vault }: { upgradeStatus: VaultMigrationType; vault: Vault }) {
  const { signers: Signers, isMultiSig } = vault;
  const styles = getStyles(0);
  const navigation = useNavigation();

  const AddSigner = useCallback(() => {
    if (upgradeStatus === VaultMigrationType.UPGRADE) {
      return (
        <LinearGradient
          start={[0, 0]}
          end={[1, 1]}
          colors={['#B17F44', '#6E4A35']}
          style={[styles.signerCard]}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
            }}
          >
            <Box
              margin="1"
              marginBottom="3"
              width="12"
              height="12"
              borderRadius={30}
              justifyContent="center"
              alignItems="center"
              marginX={1}
              alignSelf="center"
            >
              <AddIcon />
            </Box>
            <VStack pb={2}>
              <Text color="light.white" fontSize={10} bold letterSpacing={0.6} textAlign="center">
                Add signing device to upgrade
              </Text>
            </VStack>
          </TouchableOpacity>
        </LinearGradient>
      );
    }
    return null;
  }, [upgradeStatus]);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={{ position: 'absolute', top: `${70 - Signers.length}%` }}
      showsHorizontalScrollIndicator={false}
      horizontal
    >
      {Signers.map((signer) => {
        const indicate =
          !signer.registered && isMultiSig && !UNVERIFYING_SIGNERS.includes(signer.type);

        return (
          <Box style={styles.signerCard} marginRight="3">
            <TouchableOpacity
              onPress={() => {
                navigation.dispatch(
                  CommonActions.navigate('SigningDeviceDetails', {
                    SignerIcon: <SignerIcon />,
                    signerId: signer.signerId,
                    vaultId: vault.id,
                  })
                );
              }}
              testID={`btn_${signer.signerId}`}
            >
              {indicate ? <Box style={styles.indicator} /> : null}
              <Box
                margin="1"
                width="12"
                height="12"
                borderRadius={30}
                backgroundColor="#725436"
                justifyContent="center"
                alignItems="center"
                alignSelf="center"
              >
                {WalletMap(signer.type, true).Icon}
              </Box>
              <Text bold style={styles.unregistered}>
                {indicate ? 'Not registered' : ' '}
              </Text>
              <VStack pb={2}>
                <Text
                  color="light.textBlack"
                  fontSize={11}
                  letterSpacing={0.6}
                  textAlign="center"
                  numberOfLines={1}
                >
                  {getSignerNameFromType(signer.type, signer.isMock, isSignerAMF(signer))}
                </Text>
                <Text
                  color="light.textBlack"
                  fontSize={8}
                  letterSpacing={0.6}
                  textAlign="center"
                  numberOfLines={2}
                >
                  {signer.signerDescription
                    ? signer.signerDescription
                    : `Added ${moment(signer.addedOn).fromNow().toLowerCase()}`}
                </Text>
              </VStack>
            </TouchableOpacity>
          </Box>
        );
      })}
      <AddSigner />
    </ScrollView>
  );
}

function VaultDetails({ route, navigation }) {
  const { vaultTransferSuccessful = false, autoRefresh } = route.params || {};

  const dispatch = useDispatch();
  const introModal = useAppSelector((state) => state.vault.introModal);
  const { useQuery } = useContext(RealmWrapperContext);
=======
function Wrapper({ children }) {
>>>>>>> utxo-mgt/ui
  const { top } = useSafeAreaInsets();
  const styles = getStyles(top);
  return (
    <LinearGradient
      colors={['#B17F44', '#6E4A35']}
      style={styles.container}
      start={[-0.5, 1]}
      end={[1, 1]}
    >
      {children}
    </LinearGradient>
  );
}
function Footer({ onPressBuy, vault }) {
  return <VaultFooter onPressBuy={onPressBuy} vault={vault} />
}

function VaultDetails({ route }) {
  const navigation = useNavigation();
  const { autoRefresh } = route.params || {};
  const vault: Vault = useVault().activeVault;
  const { subscriptionScheme } = usePlan();
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);

  const transactions = vault?.specs?.transactions || [];

  const hasPlanChanged = (): VaultMigrationType => {
    const currentScheme = vault.scheme;
    if (currentScheme.m > subscriptionScheme.m) {
      return VaultMigrationType.DOWNGRADE;
    }
    if (currentScheme.m < subscriptionScheme.m) {
      return VaultMigrationType.UPGRADE;
    }
    return VaultMigrationType.CHANGE;
  };

  return (
    <Wrapper>
      <VStack zIndex={1}>
        <VStack mx="8%" mt={5}>
          <VaultHeader />
          <VaultInfo vault={vault} />
        </VStack>
        <SignerList upgradeStatus={hasPlanChanged()} vault={vault} />
      </VStack>
      <VStack
        backgroundColor="light.primaryBackground"
        px={wp(28)}
        borderTopLeftRadius={20}
        flex={1}
        justifyContent="space-between"
        paddingBottom={windowHeight > 800 ? 5 : 0}
      >
        <VStack style={{ paddingTop: windowHeight * 0.09 }}>
          <UTXOsManageNavBox onClick={() => navigation.navigate('UTXOManagement', { data: vault, routeName: 'Vault' })} />
          <TransactionsAndUTXOs
            transactions={transactions}
            vault={vault}
            autoRefresh={autoRefresh}
          />
          <Footer
            onPressBuy={() => setShowBuyRampModal(true)}
            vault={vault}
          />
        </VStack>
        <VaultModals
          showBuyRampModal={showBuyRampModal}
          setShowBuyRampModal={setShowBuyRampModal}
          hasPlanChanged={hasPlanChanged}
        />
      </VStack>
    </Wrapper>
  );
}

const getStyles = (top) =>
  StyleSheet.create({
    container: {
      paddingTop: Math.max(top, 35),
      justifyContent: 'space-between',
      flex: 1,
    },
  });
export default VaultDetails;
