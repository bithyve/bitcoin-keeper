import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';

import { SignerType } from 'src/core/wallets/enums';
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

export const getSignerNameFromType = (type: SignerType, isMock = false, isAmf = false) => {
  let name: string;
  switch (type) {
    case SignerType.COLDCARD:
      name = 'Mk4';
      break;
    case SignerType.JADE:
      name = 'Jade';
      break;
    case SignerType.KEEPER:
      name = 'Keeper';
      break;
    case SignerType.KEYSTONE:
      name = 'Keystone';
      break;
    case SignerType.LEDGER:
      name = 'Nano X';
      break;
    case SignerType.MOBILE_KEY:
      name = 'Mobile Key';
      break;
    case SignerType.PASSPORT:
      name = 'Passport';
      break;
    case SignerType.POLICY_SERVER:
      name = 'Signing Server';
      break;
    case SignerType.SEED_WORDS:
      name = 'Soft Key';
      break;
    case SignerType.TAPSIGNER:
      name = 'TAPSIGNER';
      break;
    case SignerType.TREZOR:
      name = type;
      break;
    case SignerType.SEEDSIGNER:
      name = 'SeedSigner';
      break;
    default:
      name = type;
      break;
  }
  if (isMock) {
    return `${name}**`;
  } if (isAmf) {
    return `${name}*`;
  }
  return name;

};

export const getWalletConfig = ({ vault }: { vault: Vault }) => {
  let line = '# Coldcard Multisig setup file (exported from Keeper)\n';
  line += `Name: Keeper Vault\n`;
  line += `Policy: ${vault.scheme.m} of ${vault.scheme.n}\n`;
  line += `Format: P2WSH\n`;
  line += `\n`;
  vault.signers.forEach((signer) => {
    line += `Derivation: ${signer.xpubInfo.derivationPath}\n`;
    line += `${signer.xpubInfo.xfp}: ${signer.xpub}\n\n`;
  });
  return line;
};
