const { WalletType, NetworkType } = require('../enums');
const { generateWallet } = require('../factories/WalletFactory');
import { getRandomBytes } from 'src/core/services/operations/encryption';
import config, { APP_STAGE } from '../../config';
import WalletOperations from '../operations';
import WalletUtilities from '../operations/utils';

describe('Testing wallet primitives', () => {
  let primaryMnemonic, walletShell, wallet;

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
});
