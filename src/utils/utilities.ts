import config, { APP_STAGE } from 'src/utils/service-utilities/config';
import { Alert } from 'react-native';
import moment from 'moment';
import idx from 'idx';

import { TxPriority, VaultType, WalletType, XpubTypes } from 'src/services/wallets/enums';
import { Wallet } from 'src/services/wallets/interfaces/wallet';

import { Signer } from 'src/services/wallets/interfaces/vault';
import * as bitcoin from 'bitcoinjs-lib';
import { isTestnet } from 'src/constants/Bitcoin';

import ecc from 'src/services/wallets/operations/taproot-utils/noble_ecc';
import BIP32Factory from 'bip32';
const bip32 = BIP32Factory(ecc);

export const UsNumberFormat = (amount, decimalCount = 0, decimal = '.', thousands = ',') => {
  try {
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
    const negativeSign = amount < 0 ? '-' : '';
    const i = parseInt(Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
    const j = i.length > 3 ? i.length % 3 : 0;
    return (
      negativeSign +
      (j ? i.substring(0, j) + thousands : '') +
      i.substring(j).replace(/(\d{3})(?=\d)/g, `$1${thousands}`) +
      (decimalCount
        ? decimal +
          Math.abs(amount - i)
            .toFixed(decimalCount)
            .slice(2)
        : '')
    );
  } catch (e) {
    // console.log(e)
  }
};

export const timeConvert = (valueInMinutes) => {
  const num = valueInMinutes;
  const hours = Math.round(num / 60);
  const days = Math.round(hours / 24);
  if (valueInMinutes < 60) {
    return `${valueInMinutes} minutes`;
  }
  if (hours < 24) {
    return `${hours} hours`;
  }
  if (days > 0) {
    return days === 1 ? `${days} day` : `${days} days`;
  }
};

export const timeConvertNear30 = (valueInMinutes) => {
  if (valueInMinutes < 60) {
    return '.5 hours';
  }
  const num = Math.ceil(valueInMinutes / 30) * 30;
  const hours = num / 60;
  const rhours = Math.floor(hours);
  const minutes = (hours - rhours) * 60;
  const rminutes = Math.round(minutes);
  if (rhours > 0 && rminutes <= 0) {
    return `${rhours} hours`;
  }
  if (rhours > 0 && rminutes > 0) {
    return `${rhours}.5 hours`;
  }
  return `${rminutes} minutes`;
};

export const getVersions = (versionHistory, restoreVersions) => {
  let versions = [];
  const versionHistoryArray = [];
  const restoreVersionsArray = [];
  if (versionHistory) {
    for (const item of versionHistory) {
      versionHistoryArray.push(item);
    }
  }

  if (restoreVersions) {
    for (const item of restoreVersions) {
      restoreVersionsArray.push(item);
    }
  }

  if (versionHistoryArray.length && restoreVersionsArray.length) {
    versions = [...versionHistoryArray, ...restoreVersionsArray];
  } else if (versionHistoryArray.length) {
    versions = [...versionHistoryArray];
  } else if (restoreVersionsArray.length) {
    versions = [...restoreVersionsArray];
  }

  return versions;
};

// Health Modification and calculation methods

export const arrayChunks = (arr, size) =>
  Array.from(
    {
      length: Math.ceil(arr.length / size),
    },
    (v, i) => arr.slice(i * size, i * size + size)
  );

export function numberWithCommas(x: string) {
  const parts = x.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export const getPlaceholder = (index: number) => {
  const mainIndex = index + 1;
  if (mainIndex === 1) return `${mainIndex}st`;
  if (mainIndex === 2) return `${mainIndex}nd`;
  if (mainIndex === 3) return `${mainIndex}rd`;
  return `${mainIndex}th`;
};

export const getPlaceholderSuperScripted = (index: number) => {
  const mainIndex = index + 1;
  if (mainIndex === 1) return `${mainIndex}ˢᵗ`;
  if (mainIndex === 2) return `${mainIndex}ⁿᵈ`;
  if (mainIndex === 3) return `${mainIndex}ʳᵈ`;
  return `${mainIndex}ᵗʰ`;
};

/**
 * handles inter-Keeper interactions
 * @param  {} error
 * @returns string
 */
export const crossInteractionHandler = (error): string => {
  // check via UAI whether the app is on latest version or not and alert accordingly
  Alert.alert('Something went wrong', 'Please ensure that you & KSD are on the latest version');
  return error.message;
};

export const getBackupDuration = () =>
  config.ENVIRONMENT === APP_STAGE.PRODUCTION ? 1.555e7 : 1800;

export const emailCheck = (email) => {
  const reg = /^\w+([.\-+]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
  return reg.test(email);
};

export function numberToOrdinal(cardinal) {
  const ordinals = [
    'Zeroth',
    'First',
    'Second',
    'Third',
    'Fourth',
    'Fifth',
    'Sixth',
    'Seventh',
    'Eighth',
    'Ninth',
    'Tenth',
    'Eleventh',
    'Twelfth',
    'Thirteenth',
    'Fourteenth',
    'Fifteenth',
    'Sixteenth',
    'Seventeenth',
    'Eighteenth',
    'Nineteenth',
    'Twentieth',
  ];

  if (cardinal < 0 || cardinal >= ordinals.length) {
    return '';
  }

  return ordinals[cardinal];
}

// Format number with comma
// Example: 1000000 => 1,000,000
export const formatNumber = (value: string) =>
  value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const getTimeDifferenceInWords = (pastTime) => {
  const timeDifference = moment(pastTime).fromNow();
  if (timeDifference === 'Invalid date' || pastTime === undefined) {
    return 'Never accessed';
  } else {
    return timeDifference.charAt(0).toUpperCase() + timeDifference.slice(1);
  }
};

export const getWalletTags = (walletType) => {
  if (walletType === VaultType.COLLABORATIVE) {
    return [`${walletType === VaultType.COLLABORATIVE ? 'COLLABORATIVE' : 'VAULT'}`, `2 of 3`];
  } else {
    let walletKind;
    if (walletType === WalletType.DEFAULT) walletKind = 'HOT WALLET';
    else if (walletType === WalletType.IMPORTED) {
      const isWatchOnly = !idx(walletType as Wallet, (_) => _.specs.xpriv);
      if (isWatchOnly) walletKind = 'WATCH ONLY';
      else walletKind = 'IMPORTED WALLET';
    }

    return ['SINGLE-KEY', walletKind];
  }
};

export const trimCWDefaultName = (wallet) => {
  // To convert "Collaborative Wallet" to "Collab. Wallet" when editing
  if (wallet.presentationData.name.length > 18) {
    const tempWallet = JSON.parse(JSON.stringify(wallet));
    tempWallet.presentationData.name = tempWallet.presentationData.name.replace(
      'Collaborative Wallet',
      'Collab. Wallet'
    );
    return tempWallet;
  }
  return wallet;
};

export const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function (...args) {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};
export const calculateTimeLeft = (createdAt: string) => {
  const targetTime = new Date(new Date(createdAt).getTime() + 5 * 60000); // Add 5 minutes
  const currentTime = new Date();
  // @ts-ignore
  return Math.max(0, Math.floor((targetTime - currentTime) / 1000));
};

export const generateDataFromPSBT = (base64Str: string, signer: Signer) => {
  try {
    const psbt = bitcoin.Psbt.fromBase64(base64Str);
    const vBytes = estimateVByteFromPSBT(base64Str);

    let signerMatched = false;

    psbt.data.inputs.forEach((input) => {
      if (input.bip32Derivation) {
        // Loop through all derivations (in case there are multiple keys)
        input.bip32Derivation.forEach((derivation) => {
          const data = {
            derivationPath: derivation.path,
            masterFingerprint: derivation.masterFingerprint.toString('hex'),
            pubKey: derivation.pubkey.toString('hex'),
          };
          if (data.masterFingerprint.toLowerCase() === signer.masterFingerprint.toLowerCase()) {
            // validating further by matching public key
            const xPub = signer.signerXpubs[XpubTypes.P2WSH][0].xpub; // to enable for taproot in future
            const node = bip32.fromBase58(
              xPub,
              isTestnet() ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
            );
            const receiveAddPath = data.derivationPath.split('/').slice(-2).join('/');
            const childNode = node.derivePath(receiveAddPath);
            const pubkey = childNode.publicKey.toString('hex');
            if (data.pubKey == pubkey) signerMatched = true;
          }
        });
      }
    });

    // Extract input addresses
    const senderAddresses = psbt.txInputs.map((input) => input.hash.toString('hex'));

    // Extract outputs (receiver information)
    const outputs = psbt.txOutputs.map((output) => {
      return {
        address: bitcoin.address.fromOutputScript(
          output.script,
          isTestnet() ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
        ), // Receiver address
        amount: output.value, // Amount in satoshis
      };
    });

    // Calculate the total input and output amounts
    let totalInput = 0;
    let totalOutput = 0;
    let totalAmount = 0;

    psbt.data.inputs.forEach((input, index) => {
      if (input.witnessUtxo) {
        totalInput += input.witnessUtxo.value;
      } else if (input.nonWitnessUtxo) {
        const tx = bitcoin.Transaction.fromBuffer(input.nonWitnessUtxo);
        const voutIndex = psbt.txInputs[index].index;
        totalInput += tx.outs[voutIndex].value;
      }
    });

    outputs.forEach((output) => {
      totalOutput += output.amount;
    });

    const receiverAddresses = outputs.map((op) => op.address);

    // Calculate transaction fees
    const fees = totalInput - totalOutput;
    const feeRate = (fees / vBytes).toFixed(2);
    return {
      senderAddresses: senderAddresses,
      receiverAddresses: receiverAddresses,
      fees,
      sendAmount: totalOutput,
      signerMatched,
      feeRate,
      vBytes,
    };
  } catch (error) {
    console.log('🚀 ~ dataFromPSBT ~ error:', error);
    throw 'Something went wrong';
  }
};

export const estimateVByteFromPSBT = (base64Str: string) => {
  const psbt = bitcoin.Psbt.fromBase64(base64Str);
  const unsignedTxHex =
    psbt.txInputs.length > 0 && psbt.txOutputs.length > 0 ? psbt.__CACHE.__TX.toHex() : null;
  const tx = bitcoin.Transaction.fromHex(unsignedTxHex);

  // Calculate the base size (without witness data)
  const baseSize = tx.toBuffer().length;

  // Check if there is witness data and calculate the total size accordingly
  const totalSize = tx.hasWitnesses() ? tx.virtualSize() : baseSize;

  // Calculate vBytes using the formula
  return Math.ceil((baseSize * 3 + totalSize) / 4);
};

export const getInputsFromPSBT = (base64Str: string) => {
  try {
    const psbt = bitcoin.Psbt.fromBase64(base64Str);
    return psbt.data.inputs;
  } catch (error) {
    console.log('🚀 ~ getInputsFromPSBT ~ error:', error);
    throw `Something went wrong ${error.message}`;
  }
};


export const getTnxDetailsPSBT = (averageTxFees, feeRate: string) => {
  let estimatedBlocksBeforeConfirmation = 0;
  let tnxPriority = TxPriority.LOW;
  if (averageTxFees && averageTxFees[config.NETWORK_TYPE]) {
    const { high, medium, low } = averageTxFees[config.NETWORK_TYPE];
    const customFeeRatePerByte = parseInt(feeRate);
    if (customFeeRatePerByte >= high.feePerByte) {
      estimatedBlocksBeforeConfirmation = high.estimatedBlocks;
      tnxPriority = TxPriority.HIGH;
    } else if (customFeeRatePerByte <= low.feePerByte) {
      estimatedBlocksBeforeConfirmation = low.estimatedBlocks;
    } else {
      estimatedBlocksBeforeConfirmation = medium.estimatedBlocks;
      tnxPriority = TxPriority.MEDIUM;
    }
  }
  return { estimatedBlocksBeforeConfirmation, tnxPriority };
};