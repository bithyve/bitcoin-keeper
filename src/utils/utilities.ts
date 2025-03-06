import config, { APP_STAGE } from 'src/utils/service-utilities/config';
import { Alert, Platform } from 'react-native';
import moment from 'moment';
import idx from 'idx';

import { TxPriority, VaultType, WalletType, XpubTypes } from 'src/services/wallets/enums';
import { Wallet } from 'src/services/wallets/interfaces/wallet';

import { Signer, VaultSigner } from 'src/services/wallets/interfaces/vault';
import * as bitcoin from 'bitcoinjs-lib';
import { isTestnet } from 'src/constants/Bitcoin';

import ecc from 'src/services/wallets/operations/taproot-utils/noble_ecc';
import BIP32Factory from 'bip32';
import { detectFileType, splitQRs } from 'src/services/qr/bbqr/split';
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

export function calculateMonthlyCost(yearlyPrice) {
  const numericValue = parseFloat(yearlyPrice.replace(/[^0-9.]/g, ''));
  if (isNaN(numericValue)) {
    throw new Error('Invalid yearly price format');
  }
  const monthlyCost = numericValue / 12;
  const currencySymbol = yearlyPrice.match(/^\D+/)?.[0]?.trim() || '';
  const formattedMonthlyCost = `${currencySymbol} ${monthlyCost.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  return formattedMonthlyCost;
}

// Format number with comma
// Example: 1000000 => 1,000,000
export const formatNumber = (value: string) =>
  value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const isOdd = (num: number) => num % 2 !== 0;

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
    return ['Collaborative', '2 of 3'];
  } else if (walletType === VaultType.ASSISTED) {
    return ['Assisted', '2 of 3'];
  } else {
    let walletKind;
    if (walletType === WalletType.DEFAULT) walletKind = 'Hot Wallet';
    else if (walletType === WalletType.IMPORTED) {
      const isWatchOnly = !idx(walletType, (_) => _.specs.xpriv);
      if (isWatchOnly) walletKind = 'Watch Only';
      else walletKind = 'Imported Wallet';
    }

    return [walletKind, 'Single-Key'];
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

export const capitalizeEachWord = (text: string): string => {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const timeFromTimeStamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const today = new Date();

  const inputYear = date.getFullYear();
  const inputMonth = date.toLocaleString('default', { month: 'long' });
  const inputDay = date.getDate();

  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  if (inputYear === todayYear && date.getMonth() === todayMonth && inputDay === todayDay) {
    const hours = date.getHours() % 12 || 12; // Handle 12-hour format
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `${hours}:${minutes} ${ampm}`;
  }

  if (inputYear === todayYear) {
    return `${inputDay} ${inputMonth}`;
  }

  return `${inputDay} ${inputMonth} ${inputYear}`;
};

export const generateDataFromPSBT = (base64Str: string, signer: Signer) => {
  try {
    const psbt = bitcoin.Psbt.fromBase64(base64Str);
    let vBytes = null;
    try {
      vBytes = estimateVByteFromPSBT(base64Str);
    } catch {
      // TODO: Need to support for Miniscript
      console.log('Failed to estimate transaction size');
    }
    const signersList = [];
    let signerMatched = false;

    const changeAddressIndex = psbt?.data?.outputs
      ?.find((output) => output?.bip32Derivation?.[0]?.path)
      ?.bip32Derivation?.[0]?.path?.split('/')
      ?.pop();

    psbt.data.inputs.forEach((input) => {
      if (input.bip32Derivation) {
        // Loop through all derivations (in case there are multiple keys)
        input.bip32Derivation.forEach((derivation) => {
          const data = {
            derivationPath: derivation.path,
            masterFingerprint: derivation.masterFingerprint.toString('hex'),
            pubKey: derivation.pubkey.toString('hex'),
          };
          signersList.push(data);
          if (data.masterFingerprint.toLowerCase() === signer.masterFingerprint.toLowerCase()) {
            // validating further by matching public key
            const xPub = signer.signerXpubs[XpubTypes.P2WSH][0].xpub; // to enable for taproot in future
            const pubkey = getPubKeyFromXpub(xPub, data.derivationPath);
            if (data.pubKey == pubkey) signerMatched = true;
          }
        });
      }
    });
    const inputs = psbt.data.inputs.map((input) => {
      const p2wsh = bitcoin.payments.p2wsh({
        redeem: { output: Buffer.from(input.witnessScript) },
        network: isTestnet() ? bitcoin.networks.testnet : bitcoin.networks.bitcoin,
      });
      return {
        address: p2wsh.address,
        amount: input.witnessUtxo.value,
        path: input.bip32Derivation[0].path,
      };
    });

    // Extract outputs (receiver information)
    const outputs = psbt.txOutputs.map((output) => {
      return {
        address: bitcoin.address.fromOutputScript(
          output.script,
          isTestnet() ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
        ), // Receiver address
        amount: output.value, // Amount in satoshis
        isChange: false,
      };
    });

    // Calculate the total input and output amounts
    let totalInput = 0;
    let totalOutput = 0;

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

    // Calculate transaction fees
    const fees = totalInput - totalOutput;
    let feeRate = null;
    if (vBytes) {
      feeRate = (fees / vBytes).toFixed(2);
    }
    return {
      senderAddresses: inputs,
      receiverAddresses: outputs,
      fees,
      sendAmount: totalOutput,
      signerMatched,
      feeRate,
      vBytes,
      signersList,
      changeAddressIndex,
    };
  } catch (error) {
    console.log('🚀 ~ dataFromPSBT ~ error:', error);
    throw new Error('Something went wrong');
  }
};

export const getPubKeyFromXpub = (xPub: string, derivationPath: string) => {
  const node = bip32.fromBase58(
    xPub,
    isTestnet() ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
  );
  const receiveAddPath = derivationPath.split('/').slice(-2).join('/');
  const childNode = node.derivePath(receiveAddPath);
  const pubkey = childNode.publicKey.toString('hex');
  return pubkey;
};

export const estimateVByteFromPSBT = (base64Str: string) => {
  const psbt = bitcoin.Psbt.fromBase64(base64Str);
  const unsignedTxHex =
    psbt.txInputs.length > 0 && psbt.txOutputs.length > 0 ? psbt.__CACHE.__TX.toHex() : null;
  if (!unsignedTxHex) {
    throw new Error('Invalid PSBT: No inputs or outputs.');
  }
  const tx = bitcoin.Transaction.fromHex(unsignedTxHex);
  // Base size (transaction size without witness data)
  const baseSize = tx.toBuffer().length;
  // Initialize total size with base size
  let totalSize = baseSize;
  // Iterate through inputs to calculate witness size
  psbt.data.inputs.forEach((input) => {
    if (!input.witnessScript) {
      throw new Error('Input is missing witness script for P2WSH.');
    }
    // Decode the witness script (redeem script)
    const witnessScript = bitcoin.script.decompile(input.witnessScript);
    if (!witnessScript) {
      throw new Error('Invalid witness script.');
    }
    // Determine `m` from the script
    const m = witnessScript[0] - bitcoin.opcodes.OP_1 + 1; // OP_m
    // Placeholder (1 byte) for null signature
    const nullPlaceholderSize = 1;
    // Each signature: 73 bytes (1-byte opcode + ~72-byte DER-encoded signature)
    const signaturesSize = m * (1 + 72);
    // Redeem script size (serialized size of the witness script)
    const redeemScriptSize = input.witnessScript.length;
    // Push opcode size for redeem script (1 byte if script < 76 bytes)
    const redeemScriptPushSize = 1;
    // Total witness size for this input
    const witnessSize =
      nullPlaceholderSize + signaturesSize + redeemScriptPushSize + redeemScriptSize;
    // Add witness size to total transaction size
    totalSize += witnessSize;
  });
  // Calculate vBytes using the formula
  const vBytes = Math.ceil((baseSize * 3 + totalSize) / 4);
  return vBytes;
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

export const getInputsToSignFromPSBT = (base64Str: string, signer: Signer) => {
  const psbtObject = bitcoin.Psbt.fromBase64(base64Str);
  const ips = psbtObject.data.inputs;
  const inputsToSign = [];
  ips.forEach((input, inputIndex) => {
    input.bip32Derivation.forEach((derivation) => {
      const masterFingerprint = derivation.masterFingerprint.toString('hex');
      if (masterFingerprint.toLowerCase() === signer.masterFingerprint.toLowerCase()) {
        const publicKey = derivation.pubkey;
        const subPath = derivation.path.split('/').slice(-2).join('/');
        const { hash, sighashType } = psbtObject.getDigestToSign(inputIndex, publicKey);
        inputsToSign.push({
          digest: hash.toString('hex'),
          subPath,
          inputIndex,
          sighashType,
          publicKey: publicKey.toString('hex'),
        });
      }
    });
  });
  return inputsToSign;
};

export const calculateTicketsLeft = (tickets, planDetails) => {
  const PLEB_RESTRICTION = 1;
  const HODLER_RESTRICTION = 3;

  const { isOnL1, isOnL2, isOnL3 } = planDetails;
  if (isOnL1) {
    // Pleb - once for life time
    return tickets.length < PLEB_RESTRICTION;
  }
  if (isOnL2) {
    if (config.ENVIRONMENT === APP_STAGE.DEVELOPMENT) {
      const oneHourAgo = Date.now() - 60 * 60 * 1000; // 1 hour in milliseconds
      const ticketsInLastHour = tickets.filter((ticket) => {
        const ticketTimestamp = new Date(ticket.created_at).getTime();
        return ticketTimestamp >= oneHourAgo;
      });
      return ticketsInLastHour.length < HODLER_RESTRICTION;
    }
    // PROD
    // Hodler 3 per month
    const currentMonth = new Date().getMonth();
    const monthlyTickets = tickets.filter((ticket) => {
      const ticketMonth = new Date(ticket.created_at).getMonth();
      return ticketMonth === currentMonth;
    });
    return monthlyTickets.length < HODLER_RESTRICTION;
  }
  if (isOnL3) return true;
};

export const getAccountFromSigner = (signer: Signer | VaultSigner): number | null => {
  if ('derivationPath' in signer) {
    // VaultSigner case
    return parseInt(signer.derivationPath.replace(/[h']/g, '').split('/')[3]) ?? null;
  }

  // Regular Signer case
  for (const type of Object.values(XpubTypes)) {
    const xpubs = signer.signerXpubs[type];
    if (xpubs?.[0]?.derivationPath) {
      return parseInt(xpubs[0].derivationPath.replace(/[h']/g, '').split('/')[3]) ?? null;
    }
  }

  return null;
};

export const getKeyUID = (signer: Signer | VaultSigner | null): string => {
  if (!signer) {
    return '';
  }
  return signer.masterFingerprint + (getAccountFromSigner(signer) ?? '');
};

export const checkSignerAccountsMatch = (signer: Signer): boolean => {
  const accountNumbers = Object.values(signer.signerXpubs).flatMap((xpubs) =>
    xpubs.map((x) => parseInt(x.derivationPath.replace(/[h']/g, '').split('/')[3]))
  );

  if (!accountNumbers.length) return true;

  const firstAccount = accountNumbers[0];
  return accountNumbers.every((num) => num === firstAccount);
};

export const extractBBQRIndex = (data) => {
  if (!data.startsWith('B$')) {
    throw new Error("Invalid string format. Must start with 'B$'.");
  }
  const total = data.substring(4, 6);
  if (isNaN(total)) {
    throw new Error('Invalid total. Must be numeric.');
  }
  const index = data.substring(6, 8);
  if (isNaN(index)) {
    throw new Error('Invalid index. Must be numeric.');
  }
  return {
    total: parseInt(total, 10),
    index: parseInt(index, 10),
  };
};

export const psbtToBBQR = async (psbt, min = 1, max = 4) => {
  try {
    const { raw, fileType } = await detectFileType(psbt); // requires uint8array
    const qrData = splitQRs(raw, fileType, { encoding: 'Z', minSplit: min, maxSplit: max });
    return qrData.parts;
  } catch (error) {
    console.log('🚀 ~ psbtToBBQR ~ error:', error);
    return [''];
  }
};

export function isHexadecimal(str) {
  return /^[0-9a-fA-F]+$/.test(str);
}

export function interpolateBBQR(input) {
  const points = [
    { x: 10, y: 4 },
    { x: 50, y: 3 },
    { x: 150, y: 2 },
    { x: 200, y: 1 },
  ];
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (input >= p1.x && input <= p2.x) {
      const t = (input - p1.x) / (p2.x - p1.x);
      const interpolatedValue = p1.y + t * (p2.y - p1.y);
      return Math.round(interpolatedValue);
    }
  }
  if (input < points[0].x) return points[0].y;
  if (input > points[points.length - 1].x) return points[points.length - 1].y;
}

export const sanitizeFileName = (fileName: string) => {
  const sanitized = fileName.trim().replace(/[^a-zA-Z0-9]/g, '-');
  return sanitized.replace(/^-+|-+$/g, '').length === 0 ? 'untitled' : sanitized;
};

export const manipulateIosProdProductId = (productId: string) => {
  if (Platform.OS === 'ios' && !config.isDevMode()) return productId.replace('.', '_'); // Replace "." with "_"
  return productId;
};