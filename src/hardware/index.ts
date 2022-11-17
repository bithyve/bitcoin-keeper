import { SignerType } from 'src/core/wallets/enums';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import WalletUtilities from 'src/core/wallets/operations/utils';
import config from 'src/core/config';

export const generateSignerFromMetaData = ({
  xpub,
  derivationPath,
  xfp,
  signerType,
  storageType,
  xpriv = null,
  isMock = false,
}) => {
  const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
  const signerId = WalletUtilities.getFingerprintFromExtendedKey(xpub, network);
  const signer: VaultSigner = {
    signerId,
    type: signerType,
    signerName: getSignerNameFromType(signerType, isMock),
    xpub,
    xpriv,
    xpubInfo: {
      derivationPath,
      xfp,
    },
    isMock,
    lastHealthCheck: new Date(),
    addedOn: new Date(),
    storageType,
  };
  return signer;
};

const getSignerNameFromType = (type: SignerType, isMock = false) => {
  let name: string;
  switch (type) {
    case SignerType.COLDCARD:
      name = 'Mk4';
      break;
    case SignerType.JADE:
      name = type;
      break;
    case SignerType.KEEPER:
      name = 'Keeper';
      break;
    case SignerType.KEYSTONE:
      name = type;
      break;
    case SignerType.LEDGER:
      name = 'Nano X';
      break;
    case SignerType.MOBILE_KEY:
      name = 'Mobile Key';
      break;
    case SignerType.PASSPORT:
      name = type;
      break;
    case SignerType.POLICY_SERVER:
      name = 'Signing Server';
      break;
    case SignerType.SEED_WORDS:
      name = 'Seed Words';
      break;
    case SignerType.TAPSIGNER:
      name = type;
      break;
    case SignerType.TREZOR:
      name = type;
      break;
    default:
      name = type;
      break;
  }
  return isMock ? name + '**' : name;
};
