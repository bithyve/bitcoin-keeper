import config, { APP_STAGE } from 'src/core/config';
import { Alert } from 'react-native';

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
  return x.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export const getPlaceholder = (index: number) => {
  const mainIndex = index + 1;
  if (mainIndex === 1) return `${mainIndex}st`;
  if (mainIndex === 2) return `${mainIndex}nd`;
  if (mainIndex === 3) return `${mainIndex}rd`;
  return `${mainIndex}th`;
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
  let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
  return reg.test(email);
};
