/* eslint-disable consistent-return */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
import { DerivationPurpose, NetworkType, WalletType } from 'src/core/wallets/enums';
import { generateWallet } from 'src/core/wallets/factories/WalletFactory';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletOperations from 'src/core/wallets/operations';
import WalletUtilities from 'src/core/wallets/operations/utils';
import * as bitcoinJS from 'bitcoinjs-lib';
import WhirlpoolClient, { TOR_CONFIG } from './client';
import { BitcoinRustInput, Info, Network, OutputTemplate, Step } from './interface';

const generateWhirlpoolAccounts = async () => {
  // sample:
  // primaryMnemonic: 'achieve blue dish mule rate evil arrange sound round cannon battle stereo',
  // tx0: https://mempool.space/testnet/tx/807ca16cf68f7aacd5f8ec940b33a2feadd26e8a053a2c3ae57af60f47da63c5
  // mixing-tx(premix to postmix): https://mempool.space/testnet/tx/339977dea3d0801c96e3dbaaca4d4a76a18b0f8f95ee1b14a03e45fe013e7f69

  const deposit = await generateWallet({
    type: WalletType.DEFAULT,
    instanceNum: 0,
    walletName: 'Whirlpool:Deposit',
    walletDescription: 'Whirlpool Deposit Account',
    primaryMnemonic: 'copy flat any grace have spread shove hair dynamic organ filter wage',
    networkType: NetworkType.TESTNET,
    transferPolicy: {
      id: '1238dsfh',
      threshold: 5000,
    },
  });

  const premixDerivationPath = "m/84'/0'/2147483645'";
  const premix = await generateWallet({
    type: WalletType.DEFAULT,
    instanceNum: 0,
    walletName: 'Whirlpool:Premix',
    walletDescription: 'Whirlpool Premix Account',
    mnemonic: deposit.derivationDetails.mnemonic,
    derivationConfig: {
      purpose: DerivationPurpose.BIP84,
      path: premixDerivationPath,
    },
    networkType: NetworkType.TESTNET,
    transferPolicy: {
      id: '1238dsfh',
      threshold: 5000,
    },
  });

  const postMixDerivationPath = "m/84'/0'/2147483646'";
  const postmix = await generateWallet({
    type: WalletType.DEFAULT,
    instanceNum: 0,
    walletName: 'Whirlpool:Premix',
    walletDescription: 'Whirlpool Premix Account',
    mnemonic: deposit.derivationDetails.mnemonic,
    derivationConfig: {
      purpose: DerivationPurpose.BIP84,
      path: postMixDerivationPath,
    },
    networkType: NetworkType.TESTNET,
    transferPolicy: {
      id: 'dsfh1238',
      threshold: 5000,
    },
  });

  const badBankDerivationPath = "m/84'/0'/2147483644'";
  const badBank = await generateWallet({
    type: WalletType.DEFAULT,
    instanceNum: 0,
    walletName: 'Whirlpool:Premix',
    walletDescription: 'Whirlpool Premix Account',
    mnemonic: deposit.derivationDetails.mnemonic,
    derivationConfig: {
      purpose: DerivationPurpose.BIP84,
      path: badBankDerivationPath,
    },
    networkType: NetworkType.TESTNET,
    transferPolicy: {
      id: 'dsfh1238',
      threshold: 5000,
    },
  });

  return { deposit, premix, postmix, badBank };
};

const syncWallet = async (wallet: Wallet) => {
  const network = WalletUtilities.getNetworkByType(wallet.networkType);
  const { synchedWallets } = await WalletOperations.syncWalletsViaElectrumClient([wallet], network);
  return synchedWallets[0] as Wallet;
};

const executeWhirlpoolFlow = async (
  deposit: Wallet,
  premix: Wallet,
  postmix: Wallet,
  badBank: Wallet
) => {
  const whirlpoolAPI = WhirlpoolClient.initiateAPI(TOR_CONFIG, Network.Testnet);
  console.log({ whirlpoolAPI });

  const poolsData = await WhirlpoolClient.getPools(whirlpoolAPI);
  console.log({ poolsData });

  const tx0Data = await WhirlpoolClient.getTx0Data(whirlpoolAPI);
  console.log({ tx0Data });

  const selectedPoolId = '0.001btc';
  const selectedPool = poolsData.filter((pool) => pool.id === selectedPoolId)[0];
  const correspondingTx0Data = tx0Data.filter((data) => data.pool_id === selectedPoolId)[0];

  deposit = await syncWallet(deposit);
  const premix_fee_per_byte = 20;
  const miner_fee_per_byte = 10;
  const inputsForTx0 = [...deposit.specs.confirmedUTXOs, ...deposit.specs.unconfirmedUTXOs];
  console.log({ inputsForTx0 });

  const preview = WhirlpoolClient.getTx0Preview(
    correspondingTx0Data,
    selectedPool,
    premix_fee_per_byte,
    miner_fee_per_byte,
    inputsForTx0
  );
  console.log({ preview });

  const network = WalletUtilities.getNetworkByType(deposit.networkType);
  const premixAddresses = [];
  for (let i = 0; i < preview.n_premix_outputs; i++) {
    premixAddresses.push(WalletUtilities.getAddressByIndex(premix.specs.xpub, false, i, network));
  }
  const outputProvider = {
    premix: premixAddresses,
    badbank: badBank.specs.receivingAddress,
  };
  console.log({ outputProvider });

  const PSBT = WhirlpoolClient.getTx0FromPreview(
    preview,
    correspondingTx0Data,
    inputsForTx0,
    outputProvider,
    deposit
  );
  console.log({ PSBT });

  // const bitcoinRustInputs: BitcoinRustInput[] = inputsForTx0.map((input) => {
  //   const rustInput: BitcoinRustInput = {
  //     outpoint: {
  //       txid: input.txId, // use
  //       vout: input.vout,
  //     },
  //     prev_txout: {
  //       value: input.value,
  //       script_pubkey: bitcoinJS.address.toOutputScript(input.address, network).toString('hex'),
  //     },
  //     fields: {},
  //   };
  //   return rustInput;
  // });

  // const output_supplier_addresses = {
  //   address_bank: premixAddresses,
  //   change_addr: badBank.specs.receivingAddress,
  // };
  // let nextFreePremixAddressIndex = 0;
  // const output_supplier = (change: Boolean): OutputTemplate => {
  //   // If `true` is passed to `output_supplier`,
  //   // it is supposed to return a change output template.
  //   // otherwise premix output template.
  //   if (change) {
  //     return {
  //       address: output_supplier_addresses.change_addr, // use Address::from_str to convert to bitcoin_rust's Address
  //       fields: {},
  //     };
  //   }

  //   const address = output_supplier_addresses[nextFreePremixAddressIndex];
  //   nextFreePremixAddressIndex++;
  //   return {
  //     address, // use from_str to convert to bitcoin_rust's Address
  //     fields: {},
  //   };
  // };

  // console.log(
  //   JSON.stringify(
  //     {
  //       preview,
  //       tx0_data: correspondingTx0Data,
  //       inputs: bitcoinRustInputs,
  //       output_supplier_addresses,
  //     },
  //     null,
  //     4
  //   )
  // );

  const tx0 = WhirlpoolClient.signTx0(deposit, inputsForTx0, PSBT);
  console.log({ tx0 });

  const txid = await WhirlpoolClient.broadcastTx0(tx0, selectedPool.id);
  console.log({ txid });

  badBank = await syncWallet(badBank);
  console.log({
    badBankChange: [...badBank.specs.confirmedUTXOs, ...badBank.specs.unconfirmedUTXOs],
  });

  premix = await syncWallet(premix);

  const inputToMix = premix.specs?.confirmedUTXOs[0];
  const destination = postmix.specs.receivingAddress;
  const pool_denomination = selectedPool.denomination;

  const notify = (info: Info, step?: Step) => {
    console.log({ info, step }); // capture step updates
  };

  const mixingTxid = await WhirlpoolClient.premixToPostmix(
    inputToMix,
    destination,
    pool_denomination,
    premix,
    notify
  );
  console.log({ mixingTxid });
};

export const runMockWhirlpool = async () => {
  try {
    const { deposit, premix, postmix, badBank } = await generateWhirlpoolAccounts(); // works only w/ mnemonic modification in wallet factory method
    return executeWhirlpoolFlow(deposit, premix, postmix, badBank);
  } catch (err) {
    console.log({ err });
  }
};
