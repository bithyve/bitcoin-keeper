import WalletOperations from 'src/services/wallets/operations';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { WalletType, NetworkType, TxPriority } from 'src/services/wallets/enums';
import { generateWallet } from 'src/services/wallets/factories/WalletFactory';
import ElectrumClient from 'src/services/electrum/client';
import { predefinedTestnetNodes } from 'src/services/electrum/predefinedNodes';

jest.setTimeout(150 * 1000);

describe('Wallet primitives', () => {
  let primaryMnemonic;
  let wallet;
  let averageTxFees;
  let txPrerequisites;
  let txnPriority;
  let PSBT;

  beforeAll(async () => {
    primaryMnemonic =
      'duty burger portion domain athlete sweet birth impact miss shield help peanut';

    try {
      ElectrumClient.setActivePeer(predefinedTestnetNodes);
      await ElectrumClient.connect();
      // console.log('Electrum connected');
    } catch (err) {
      console.log('failed to connect to Electrum:', err);
      process.exit(1);
    }
  });

  test('wallet factory: creating a wallet', async () => {
    const walletName = 'Checking Wallet';
    const walletDescription = 'Bitcoin Wallet';
    wallet = await generateWallet({
      type: WalletType.DEFAULT,
      instanceNum: 0,
      walletName,
      walletDescription,
      primaryMnemonic,
      networkType: NetworkType.TESTNET,
    });
    expect(wallet.derivationDetails.mnemonic).toEqual(
      'trumpet access minor basic rule rifle wife summer brown deny used very'
    );
  });

  test('wallet operations: generating a receive address', () => {
    const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(wallet);
    expect(receivingAddress).toEqual('tb1qvmww6r6zlf98a7rwp2mw7afpg32qe2j22c76tq');
  });

  test('wallet operations: fetching balance, utxos & transactions', async () => {
    const network = WalletUtilities.getNetworkByType(wallet.networkType);
    const { synchedWallets } = await WalletOperations.syncWalletsViaElectrumClient(
      [wallet],
      network
    );
    [wallet] = synchedWallets;

    const { balances, transactions, confirmedUTXOs, unconfirmedUTXOs } = wallet.synchedWallet.specs;

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
    const averageTxFeeByNetwork = await WalletOperations.calculateAverageTxFee();
    averageTxFees = averageTxFeeByNetwork;
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
    const currentBlockHeight = 1;
    const res = await WalletOperations.createTransaction(
      wallet,
      currentBlockHeight,
      txPrerequisites,
      txnPriority
    );
    PSBT = res.PSBT;
    expect(PSBT.data.inputs.length).toBeGreaterThan(0);
    expect(PSBT.data.outputs.length).toBeGreaterThan(0);
  });

  test('wallet operations: transaction signing(PSBT)', () => {
    const { inputs } = txPrerequisites[txnPriority];
    const { signedPSBT } = WalletOperations.signHotWalletTransaction(wallet, inputs, PSBT);
    // const areSignaturesValid = signedPSBT.validateSignaturesOfAllInputs();
    // expect(areSignaturesValid).toEqual(true);

    const txHex = signedPSBT.finalizeAllInputs().extractTransaction().toHex();
    expect(txHex).toBeDefined();
  });
});
