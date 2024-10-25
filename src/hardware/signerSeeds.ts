import { WalletType } from 'src/services/wallets/enums';
import { BIP85Config } from 'src/services/wallets/interfaces';
import BIP85 from 'src/services/wallets/operations/BIP85';

const generateMobileKeySeeds = async (mobileKeyInstanceNo: number, primaryMnemonic: string) => {
  let bip85Config: BIP85Config;
  bip85Config = BIP85.generateBIP85Configuration(WalletType.DEFAULT, mobileKeyInstanceNo);
  const entropy = await BIP85.bip39MnemonicToEntropy(bip85Config.derivationPath, primaryMnemonic);
  const mnemonic = BIP85.entropyToBIP39(entropy, bip85Config.words);
  return mnemonic;
};

export { generateMobileKeySeeds };
