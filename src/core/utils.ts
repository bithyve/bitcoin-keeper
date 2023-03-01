import { Vault, VaultScheme, VaultSigner } from './wallets/interfaces/vault';
import WalletOperations from './wallets/operations';

// GENRATOR

export const getDerivationPath = (derivationPath: string) =>
  derivationPath.substring(2).split("'").join('h');

export const getMultiKeyExpressions = (signers: VaultSigner[]) => {
  const keyExpressions = signers.map((signer: VaultSigner) =>
    getKeyExpression(signer.masterFingerprint, signer.derivationPath, signer.xpub)
  );
  return keyExpressions.join();
};

export const getKeyExpression = (masterFingerprint: string, derivationPath: string, xpub: string) =>
  `[${masterFingerprint}/${getDerivationPath(derivationPath)}]${xpub}/**`;

export const genrateOutputDescriptors = (
  isMultisig: boolean,
  signers: VaultSigner[],
  scheme: VaultScheme,
  vault: Vault
) => {
  const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(vault);

  if (!isMultisig) {
    const signer: VaultSigner = signers[0];
    // eslint-disable-next-line no-use-before-define
    const des = `wpkh(${getKeyExpression(
      signer.masterFingerprint,
      signer.derivationPath,
      signer.xpub
    )})\nNo path restrictions\n${receivingAddress}`;
    return des;
  }
  return `wsh(sortedmulti(${scheme.m},${getMultiKeyExpressions(
    signers
  )})\nNo path restrictions\n${receivingAddress}`;
};

// PASRER
export interface ParsedSignersDetails {
  xpub: String;
  masterFingerprint: String;
  path: String;
  isMultisig: Boolean;
}
export interface ParsedVauleText {
  signersDetails: ParsedSignersDetails[] | null;
  isMultisig: Boolean | null;
  scheme: VaultScheme;
}

const allowedScehemes = {
  1: 1,
  2: 3,
  3: 5,
};

function removeEmptyLines(data) {
  const lines = data.split('\n');
  const nonEmptyLines = lines.filter((line) => line.trim() !== '');
  const output = nonEmptyLines.join('\n');
  return output;
}

const parseKeyExpression = (expression) => {
  const re = /\[([^\]]+)\](.*)/;
  const expressionSplit = expression.match(re);
  if (expressionSplit && expressionSplit.length === 3) {
    let hexFingerprint = expressionSplit[1].split('/')[0];
    if (hexFingerprint.length === 8) {
      hexFingerprint = Buffer.from(hexFingerprint, 'hex').toString('hex');
    }
    const path = `m/${expressionSplit[1].split('/').slice(1).join('/').replace(/[h]/g, "'")}`;
    let xpub = expressionSplit[2];
    if (xpub.indexOf('/') !== -1) {
      xpub = xpub.substr(0, xpub.indexOf('/'));
    }
    if (xpub.indexOf(')') !== -1) {
      xpub = xpub.substr(0, xpub.indexOf(')'));
    }
    return {
      xpub,
      masterFingerprint: hexFingerprint.toUpperCase(),
      path,
    };
  }
};

export const parseTextforVaultConfig = (secret: string) => {
  let config;
  if (secret.includes('wpkh(')) {
    config = { descriptor: secret, label: 'Singlesig vault' };
    const keyExpressions = config.descriptor
      .substr(config.descriptor.indexOf('wpkh(') + 5)
      .split(',');

    const signersDetailsList = keyExpressions.map((expression) => parseKeyExpression(expression));
    const parsedResponse: ParsedVauleText = {
      signersDetails: signersDetailsList,
      isMultisig: true,
      scheme: {
        m: 1,
        n: 1,
      },
    };
    return parsedResponse;
  }
  if (!config && secret.indexOf('sortedmulti(')) {
    config = { descriptor: secret, label: 'Multisig vault' };
  }
  if (secret.indexOf('sortedmulti(') !== -1 && config.descriptor) {
    if (config.descriptor.includes('sh(wsh(')) {
      throw Error('Unsuportted Script type');
    }

    const keyExpressions = config.descriptor
      .substr(config.descriptor.indexOf('sortedmulti(') + 12)
      .split(',');

    const m = parseInt(keyExpressions.splice(0, 1)[0]);
    const n = keyExpressions.length;

    if (allowedScehemes[m] !== n) {
      throw Error('Unsupported schemes');
    }
    const scheme: VaultScheme = {
      m,
      n,
    };
    const signersDetailsList = keyExpressions.map((expression) => parseKeyExpression(expression));
    const parsedResponse: ParsedVauleText = {
      signersDetails: signersDetailsList,
      isMultisig: true,
      scheme,
    };
    return parsedResponse;
  }
  if (secret.includes('Derivation')) {
    const text = removeEmptyLines(secret);
    const lines = text.split('\n');
    const signersDetailsList = [];
    let scheme;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('Policy')) {
        let [m, n] = line.split('Policy:')[1].split('of');
        scheme = { m: parseInt(m), n: parseInt(n) };
        if (allowedScehemes[scheme.m] !== scheme.n) {
          throw Error('Unsupported scheme');
        }
      }
      if (line.startsWith('Derivation:')) {
        const path = line.split(':')[1].trim();
        const masterFingerprintLine = lines[i + 1].trim();
        const masterFingerprint = masterFingerprintLine.split(':')[0].trim();
        const xpub = lines[i + 1].split(':')[1].trim();
        signersDetailsList.push({ xpub, masterFingerprint: masterFingerprint.toUpperCase(), path });
      }
    }
    const parsedResponse: ParsedVauleText = {
      signersDetails: signersDetailsList,
      isMultisig: true,
      scheme,
    };
    return parsedResponse;
  }
  throw Error('Something went wrong!');
};

export const urlParamsToObj = (url: string): object => {
  try {
    const regex = /[?&]([^=#]+)=([^&#]*)/g;
    const params = {};
    let match;
    while ((match = regex.exec(url))) {
      // eslint-disable-next-line prefer-destructuring
      params[match[1]] = match[2];
    }
    return params;
  } catch (err) {
    return {};
  }
};
