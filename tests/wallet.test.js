import Relay from 'src/core/services/operations/Relay';
import { getRandomBytes } from 'src/core/services/operations/encryption';
import WalletOperations from 'src/core/wallets/operations';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { WalletType, NetworkType, TxPriority } from 'src/core/wallets/enums';
import { generateWallet } from 'src/core/wallets/factories/WalletFactory';

describe('Wallet primitives', () => {
  let primaryMnemonic;
  let walletShell;
  let wallet;
  let averageTxFees;
  let txPrerequisites;
  let txnPriority;
  let PSBT;

  beforeAll(() => {
    primaryMnemonic =
      'duty burger portion domain athlete sweet birth impact miss shield help peanut';
    walletShell = {
      id: getRandomBytes(12),
      walletInstances: {},
    };
  });

  test('wallet factory: creating a wallet', async () => {
    const walletName = 'Checking Wallet';
    const walletDescription = 'Bitcoin Wallet';
    wallet = await generateWallet({
      type: WalletType.CHECKING,
      instanceNum: walletShell.walletInstances[WalletType.CHECKING] || 0,
      walletShellId: walletShell.id,
      walletName,
      walletDescription,
      primaryMnemonic,
      networkType: NetworkType.TESTNET,
    });
    expect(wallet.derivationDetails.mnemonic).toEqual(
      'trumpet access minor basic rule rifle wife summer brown deny used very'
    );
    expect(wallet.walletShellId).toEqual(walletShell.id);
  });

  test('wallet operations: generating a receive address', () => {
    const { receivingAddress, updatedWallet } = WalletOperations.getNextFreeExternalAddress(wallet);
    wallet = updatedWallet;
    expect(receivingAddress).toEqual('tb1qvmww6r6zlf98a7rwp2mw7afpg32qe2j22c76tq');
  });

  test('wallet operations: fetching balance, utxos & transactions', async () => {
    const network = WalletUtilities.getNetworkByType(wallet.networkType);
    const { synchedWallets } = await WalletOperations.syncWallets([wallet], network);
    [wallet] = synchedWallets;

    const { balances, transactions, confirmedUTXOs, unconfirmedUTXOs } = wallet.specs;

    let netBalance = 0;
    confirmedUTXOs.forEach((utxo) => {
      netBalance += utxo.value;
    });
    unconfirmedUTXOs.forEach((utxo) => {
      netBalance += utxo.value;
    });

    expect(balances.confirmed + balances.unconfirmed).toEqual(5000);
    expect(netBalance).toEqual(balances.confirmed + balances.unconfirmed);
    expect(transactions.length).toEqual(1);
  });

  test('wallet operations: transaction fee fetch', async () => {
    const res = await Relay.fetchFeeAndExchangeRates();
    averageTxFees = res.averageTxFees;
    expect(averageTxFees[NetworkType.MAINNET]).toBeDefined();
    expect(averageTxFees[NetworkType.TESTNET]).toBeDefined();
  });

  test('wallet operations: transaction pre-requisites(priority based coinselection)', async () => {
    const averageTxFeeByNetwork = averageTxFees[wallet.networkType];
    const recipients = [
      {
        address: 'tb1ql7w62elx9ucw4pj5lgw4l028hmuw80sndtntxt',
        amount: 3000,
      },
    ];

    const res = await WalletOperations.transferST1(wallet, recipients, averageTxFeeByNetwork);
    txPrerequisites = res.txPrerequisites;

    expect(txPrerequisites[TxPriority.LOW]).toBeDefined();
    expect(txPrerequisites[TxPriority.MEDIUM]).toBeDefined();
    expect(txPrerequisites[TxPriority.HIGH]).toBeDefined();
  });

  test('wallet operations: transaction construction(PSBT)', async () => {
    txnPriority = TxPriority.LOW;
    const res = await WalletOperations.createTransaction(wallet, txPrerequisites, txnPriority);
    PSBT = res.PSBT;
    expect(PSBT.data.inputs.length).toBeGreaterThan(0);
    expect(PSBT.data.outputs.length).toBeGreaterThan(0);
  });

  test('wallet operations: transaction signing(PSBT)', () => {
    const { inputs } = txPrerequisites[txnPriority];
    const { signedPSBT } = WalletOperations.signTransaction(wallet, inputs, PSBT);
    const areSignaturesValid = signedPSBT.validateSignaturesOfAllInputs();
    expect(areSignaturesValid).toEqual(true);

    const txHex = signedPSBT.finalizeAllInputs().extractTransaction().toHex();
    expect(txHex).toBeDefined();
  });
});
