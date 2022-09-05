const { WalletType, NetworkType, TxPriority } = require('../enums');
const { generateWallet } = require('../factories/WalletFactory');
import { getRandomBytes } from 'src/core/services/operations/encryption';
import Relay from 'src/core/services/operations/Relay';
import config, { APP_STAGE } from '../../config';
import WalletOperations from '../operations';
import WalletUtilities from '../operations/utils';
import * as bip39 from 'bip39';

describe('Testing wallet primitives', () => {
  let primaryMnemonic, walletShell, wallet, averageTxFees, txPrerequisites, txnPriority, PSBT;

  beforeAll(() => {
    primaryMnemonic =
      'such suffer age grid picture ordinary endorse danger coffee shrimp nose zone';
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
      'tragic water gloom vocal quick culture gasp comfort gas human valley warm'
    );
    expect(wallet.walletShellId).toEqual(walletShell.id);
  });

  test('wallet operations: generating a receive address', () => {
    const { receivingAddress, updatedWallet } = WalletOperations.getNextFreeExternalAddress(wallet);
    wallet = updatedWallet;
    expect(receivingAddress).toEqual('tb1qnjlm26z5vkuw9452t4k5rrluda59s84tumyq7y');
  });

  test('wallet operations: fetching balance, utxos & transactions', async () => {
    const network = WalletUtilities.getNetworkByType(wallet.networkType);
    const { synchedWallets } = await WalletOperations.syncWallets([wallet], network);
    wallet = synchedWallets[0];

    const { balances, transactions, confirmedUTXOs, unconfirmedUTXOs } = wallet.specs;

    let netBalance = 0;
    confirmedUTXOs.forEach((utxo) => (netBalance += utxo.value));
    unconfirmedUTXOs.forEach((utxo) => (netBalance += utxo.value));

    expect(balances.confirmed + balances.unconfirmed).toEqual(10000);
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
    expect(PSBT.data.inputs.length).toBeGreaterThan(0);
    expect(PSBT.data.outputs.length).toBeGreaterThan(0);
  });

  test('wallet operations: transaction signing(PSBT)', async () => {
    const inputs = txPrerequisites[txnPriority].inputs;
    const { signedPSBT } = await WalletOperations.signTransaction(wallet, inputs, PSBT);
    const areSignaturesValid = signedPSBT.validateSignaturesOfAllInputs();
    expect(areSignaturesValid).toEqual(true);

    const txHex = signedPSBT.finalizeAllInputs().extractTransaction().toHex();
    expect(txHex).toEqual(
      '020000000001010f2842dba0604af53f32203e9933b36d12a28f466dca23361766a17e8b21faae0000000000ffffffff02a612000000000000160014af6bf42be5406002a7711188b5c68dd78b0fc1118813000000000000160014ff9da567e62f30ea8654fa1d5fbd47bef8e3be13024730440220231becd53d99ece600551ed7ed42bdf01acef5f5c5d9af5787a180087644ad2f0220647ef7008df0aea18fb61a230bb5b5a4bf9b7419788ac5a90d9b4b33383f571f0121026d45cd4a4256307bd1f93d0e855d501ac8bd855c13471a8f274c618ad756532f00000000'
    );
  });
});
