import WalletOperations from 'src/services/wallets/operations';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { WalletType, NetworkType, TxPriority } from 'src/services/wallets/enums';
import { generateWallet } from 'src/services/wallets/factories/WalletFactory';
import ElectrumClient from 'src/services/electrum/client';
import { predefinedTestnetNodes } from 'src/services/electrum/predefinedNodes';
import * as bitcoinJS from 'bitcoinjs-lib';
import {
  AverageTxFeesByNetwork,
  InputUTXOs,
  Transaction,
  TransactionPrerequisite,
} from 'src/services/wallets/interfaces';
import { Wallet } from 'src/services/wallets/interfaces/wallet';

jest.mock('src/store/store', () => ({
  store: {
    getState: () => ({
      settings: {
        bitcoinNetworkType: 'MAINNET',
      },
    }),
  },
}));

jest.mock('realm', () => ({}));

describe('Wallet Functionality Tests', () => {
  let primaryMnemonic: string;
  let wallet: Wallet;
  let childMnemonic: string; // BIP85 mnemonic for child wallet
  let averageTxFees: AverageTxFeesByNetwork;
  let txPrerequisites: TransactionPrerequisite;
  let txnPriority: TxPriority;
  let PSBT: bitcoinJS.Psbt;

  beforeAll(async () => {
    primaryMnemonic =
      'midnight auction hello stereo such fault legal outdoor manual recycle derive like';
    childMnemonic = 'penalty indoor upset digital panther dwarf wealth kind stem guilt tiny police';
    try {
      ElectrumClient.setActivePeer(predefinedTestnetNodes);
      await ElectrumClient.connect();
    } catch (err) {
      console.error('Failed to connect to Electrum:', err);
      process.exit(1);
    }
  });

  afterAll(async () => {
    ElectrumClient.forceDisconnect();
  });

  describe('Wallet Creation', () => {
    test('should create a wallet with valid parameters', async () => {
      const walletName = 'Mobile Wallet';
      const walletDescription = 'Bitcoin Wallet';
      wallet = await generateWallet({
        type: WalletType.DEFAULT,
        instanceNum: 0,
        walletName,
        walletDescription,
        derivationPath: "m/84'/1'/0'",
        primaryMnemonic,
        networkType: NetworkType.TESTNET,
        wallets: [],
      });
      expect(wallet.derivationDetails.mnemonic).toEqual(childMnemonic);
      expect(wallet.presentationData.name).toEqual(walletName);
      expect(wallet.presentationData.description).toEqual(walletDescription);
    });
  });

  describe('Wallet Operations', () => {
    test('should generate a valid receiving address', () => {
      const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(wallet);
      expect(receivingAddress).toMatch(/^tb1[a-z0-9]{39}$/);
    });

    test('should fetch balances, UTXOs and transactions', async () => {
      const network = WalletUtilities.getNetworkByType(wallet.networkType);
      const { synchedWallets } = await WalletOperations.syncWalletsViaElectrumClient(
        [wallet],
        network
      );
      wallet = synchedWallets[0].synchedWallet as Wallet;

      const {
        balances,
        confirmedUTXOs,
        unconfirmedUTXOs,
        transactions,
      }: {
        balances: any;
        confirmedUTXOs: InputUTXOs[];
        unconfirmedUTXOs: InputUTXOs[];
        transactions: Transaction[];
      } = wallet.specs;

      const checkUTXO = (utxo: InputUTXOs) => {
        expect(utxo).toEqual(
          expect.objectContaining({
            height: expect.any(Number),
            value: expect.any(Number),
            txId: expect.any(String),
            vout: expect.any(Number),
            address: expect.any(String),
          })
        );
      };

      confirmedUTXOs.forEach(checkUTXO);
      unconfirmedUTXOs.forEach(checkUTXO);

      const netBalance = [...confirmedUTXOs, ...unconfirmedUTXOs].reduce(
        (sum, utxo) => sum + utxo.value,
        0
      );

      expect(balances.confirmed + balances.unconfirmed).toEqual(netBalance);

      const optionalFields: Record<string, (value: any) => void> = {
        address: (v) => expect(typeof v).toBe('string'),
        confirmations: (v) => expect(typeof v).toBe('number'),
        fee: (v) => expect(typeof v).toBe('number'),
        date: (v) => expect(typeof v).toBe('string'),
        transactionType: (v) => expect(typeof v).toBe('string'),
        recipientAddresses: (v) => expect(Array.isArray(v)).toBe(true),
        senderAddresses: (v) => expect(Array.isArray(v)).toBe(true),
        blockTime: (v) => expect(typeof v).toBe('number'),
        tags: (v) => expect(Array.isArray(v)).toBe(true),
      };

      transactions.forEach((transaction) => {
        expect(transaction).toEqual(
          expect.objectContaining({
            txid: expect.any(String),
            amount: expect.any(Number),
          })
        );
        Object.entries(optionalFields).forEach(([key, check]) => {
          if (transaction[key] !== undefined) {
            check(transaction[key]);
          }
        });
      });

      expect(transactions.length).toBeGreaterThan(0);
    });

    test('should calculate average transaction fees', async () => {
      averageTxFees = await WalletOperations.calculateAverageTxFee();
      expect(typeof averageTxFees).toBe('object');
      Object.values(NetworkType).forEach((network) => {
        const fees = averageTxFees[network];
        expect(fees).toBeDefined();
        expect(typeof fees).toBe('object');
        [TxPriority.LOW, TxPriority.MEDIUM, TxPriority.HIGH].forEach((priority) => {
          expect(fees[priority]).toEqual({
            estimatedBlocks: expect.any(Number),
            feePerByte: expect.any(Number),
          });
        });
      });
    });

    test('should calculate transaction prerequisites', async () => {
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
  });
});
