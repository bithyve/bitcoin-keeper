const { WalletType, NetworkType, TxPriority } = require('../enums');
const { generateWallet } = require('../factories/WalletFactory');
import { getRandomBytes } from 'src/core/services/operations/encryption';
import Relay from 'src/core/services/operations/Relay';
import config, { APP_STAGE } from '../../config';
import WalletOperations from '../operations';
import WalletUtilities from '../operations/utils';

describe('Testing wallet primitives', () => {
  let primaryMnemonic, walletShell, wallet, averageTxFees, txPrerequisites, txnPriority, PSBT;

  beforeAll(() => {
    primaryMnemonic =
      'will arrive forget true master similar another eyebrow between sword word object';
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
      walletName: walletName,
      walletDescription: walletDescription,
      primaryMnemonic,
      networkType:
        config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET,
    });
    expect(wallet.derivationDetails.mnemonic).toEqual(
      'update lawsuit canal dress limb swift session need humble swear heavy approve'
    );
    expect(wallet.walletShellId).toEqual(walletShell.id);
  });

  test('wallet operations: generating a receive address', () => {
    const { receivingAddress, updatedWallet } = WalletOperations.getNextFreeExternalAddress(wallet);
    wallet = updatedWallet;
    expect(receivingAddress).toEqual('tb1q5trmuj2eqmehllwrgumdn04fp2x27r4nr6qu42');
  });

  test('wallet operations: fetching balance, utxos & transactions', async () => {
    const network = WalletUtilities.getNetworkByType(wallet.networkType);
    const { synchedWallets } = await WalletOperations.syncWallets([wallet], network);
    wallet = synchedWallets[0];

    const { balances, transactions, confirmedUTXOs, unconfirmedUTXOs } = wallet.specs;

    let netBalance = 0;
    confirmedUTXOs.forEach((utxo) => (netBalance += utxo.value));
    unconfirmedUTXOs.forEach((utxo) => (netBalance += utxo.value));

    expect(balances.confirmed + balances.unconfirmed).toEqual(20000);
    expect(netBalance).toEqual(balances.confirmed + balances.unconfirmed);
    expect(transactions.length).toEqual(2);
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
        amount: 5000,
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
    expect(PSBT.inputs).toBeTruthy();
    expect(PSBT.outputs).toBeTruthy();
  });

  test('wallet operations: transaction signing(PSBT)', async () => {
    const inputs = txPrerequisites[txnPriority].inputs;
    const { signedPSBT } = await WalletOperations.signTransaction(wallet, inputs, PSBT);
    const areSignaturesValid = signedPSBT.validateSignaturesOfAllInputs();
    expect(areSignaturesValid).toEqual(true);

    const txHex = signedPSBT.finalizeAllInputs().extractTransaction().toHex();
    expect(txHex).toEqual(
      '02000000000101bebacb14b7d1ee616ba88a82af4b64d8e046bf2fafa283fc5e434b73a73a2df90000000000ffffffff028813000000000000160014ff9da567e62f30ea8654fa1d5fbd47bef8e3be13a61200000000000016001401a93fdabaff067b5d06f914f520e205b7f9c3660247304402206d89be0097be6bd5fb91eeaa0117db3969f3735528273be5bbb749c929f3323402207518e6270db0d2f45dccffb5f00c39e3d7398c68c3eb9421de6775637ad1b27a0121021f57d4d68b3a350426fb4c686aef4c884f417b1b86d102cc64a0efbc007d81b000000000'
    );
  });
});
