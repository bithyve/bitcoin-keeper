import { NativeModules, Platform } from 'react-native';
import moment from 'moment';

const Cloud = Platform.select({
  android: NativeModules.GoogleDrive,
  ios: NativeModules.iCloud,
});

const readFile = async ({ payload }) => {
  const { result, data, appID } = payload;
  const metaData = {
    id: result.id,
  };

  try {
    const result1 = await Cloud.readFile(JSON.stringify(metaData));
    console.log('result1result1', result1);
    const readResult = result1.data;
    const updateStatus = await uplaodFile({
      payload: {
        readResult,
        googleData: result,
        data,
        appID,
      },
    });
    return updateStatus;
  } catch (error) {
    console.log('error', error);
    throw new Error(error);
  }
};

const uplaodFile = async ({ payload }) => {
  try {
    const { readResult, googleData, appID, data } = payload;
    let arr = [];
    const newArray = [];
    if (readResult) {
      arr = JSON.parse(readResult);
      if (arr && arr.length) {
        for (let i = 0; i < arr.length; i++) {
          newArray.push(arr[i]);
        }
      }
      const index = newArray.findIndex((x) => x.appID == appID);
      if (index === -1) {
        const tempData = {
          data: data,
          dateTime: moment(new Date()),
        };
        newArray.push(tempData);
      } else {
        newArray[index] = { appID, ...data };
        newArray[index].dateTime = moment(new Date());
      }
      // console.log('ARR', newArray);
      if (Platform.OS == 'ios') {
        if (newArray.length) {
          const result = await Cloud.startBackup(JSON.stringify(newArray));
          return result;
        }
      } else {
        const metaData = {
          name: googleData.name,
          mimeType: googleData.mimeType,
          data: JSON.stringify(newArray),
          id: googleData.id,
        };
        const result = await Cloud.updateFile(JSON.stringify(metaData));
        if (result.eventName == 'successFullyUpdate') {
          return { status: true };
        } else if (result.eventName == 'failure') {
          return result;
        }
      }
    }
  } catch (error) {
    throw new Error(error);
  }
};

const checkFileIsAvailable = async ({ payload }) => {
  try {
    const { checkDataIsBackedup, data, appID } = payload;
    const metaData = {
      name: 'BitcoinKeeperBackup.json',
      description: 'Backup data for my app',
      mimeType: 'application/json',
    };
    const result = await Cloud.checkIfFileExist(JSON.stringify(metaData));

    console.log('result checkFileIsAvailable', result);
    if (!result) return null;
    if (!checkDataIsBackedup) {
      if (result && result.eventName == 'listEmpty') {
        console.log('createFile');
        const createFileStatus = await createFile({
          payload: {
            data,
            appID,
          },
        });
        return createFileStatus;
      } else if (result.eventName == 'failure') {
        console.log('FAILURE');
        throw new Error(result.eventName);
      } else if (result.eventName === 'UseUserRecoverableAuthIOException') {
        console.log('UseUserRecoverableAuthIOException Failure');
        const fileAvailabelStatus = await checkFileIsAvailable({
          payload: {
            data,
            appID,
          },
        });
        return fileAvailabelStatus;
      } else {
        const readStatus = await readFile({
          payload: {
            result,
            data,
            appID,
          },
        });
        return readStatus;
      }
    } else {
      const readStatus = await readFile({
        payload: {
          result,
          checkDataIsBackedup,
          data,
          appID,
        },
      });
      console.log('readStatus', readStatus);
      return readStatus;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const createFile = async ({ payload }) => {
  try {
    const { data, appID } = payload;
    const WalletData = [];
    const tempData = { ...data, appID, dateTime: moment(new Date()) };
    WalletData.push(tempData);
    if (Platform.OS === 'ios') {
      const result = await Cloud.startBackup(JSON.stringify(WalletData));
      return result;
    } else {
      const metaData = {
        name: 'BitcoinKeeperBackup.json',
        description: 'Backup data for my app',
        mimeType: 'application/json',
        data: JSON.stringify(WalletData),
      };
      const result = await Cloud.uploadFile(JSON.stringify(metaData));
      if (result && result.eventName == 'successFullyUpload') {
        return { status: true };
        // this.callBack( share )
      } else if (result && result.eventName === 'UseUserRecoverableAuthIOException') {
        const fileAvailabelStatus = await checkFileIsAvailable({
          payload: {
            data,
            appID,
          },
        });
        return fileAvailabelStatus;
      }
    }
  } catch (error) {
    throw new Error(error);
  }
};

const updateData = async ({ payload }) => {
  try {
    const { result1, googleData, appID, data } = payload;
    let arr = [];
    const newArray = [];
    if (result1) {
      arr = JSON.parse(result1);
      if (arr && arr.length) {
        for (let i = 0; i < arr.length; i++) {
          newArray.push(arr[i]);
        }
      }
      const index = newArray.findIndex((x) => x.appID == appID);
      if (index === -1) {
        const tempData = {
          appID,
          ...data,
          dateTime: moment(new Date()),
        };
        newArray.push(tempData);
      } else {
        newArray[index] = { appID, ...data };
        newArray[index].dateTime = moment(new Date());
      }
      if (Platform.OS == 'ios') {
        console.log('newaww', newArray);
        if (newArray.length) {
          const result = await Cloud.startBackup(JSON.stringify(newArray));
          console.log('startBackup result', result);
          return result;
        }
      }
    } else {
      const metaData = {
        name: googleData.name,
        mimeType: googleData.mimeType,
        data: JSON.stringify(newArray),
        id: googleData.id,
      };
      const result = await Cloud.updateFile(JSON.stringify(metaData));
      if (result.eventName == 'successFullyUpdate') {
        return { status: true };
      } else if (result.eventName == 'failure') {
        throw new Error(result.eventName);
      }
      console.log('Google Drive.updateFile', result);
    }
  } catch (error) {
    throw error;
  }
};

export const uploadData = async (appID: string, data: object) => {
  try {
    if (Platform.OS === 'android') {
      const setup = await Cloud.setup();
      if (setup) {
        const googleLoginResult = await Cloud.login();
        if (googleLoginResult) {
          const result = googleLoginResult;
          if (result.eventName == 'onLogin') {
            const fileAvailabelStatus = await checkFileIsAvailable({
              payload: {
                data,
                appID,
              },
            });
            return fileAvailabelStatus;
          } else {
            return {
              status: false,
              ...result,
            };
          }
        }
      }
    } else {
      const backedJson = await Cloud.downloadBackup();
      const json = backedJson ? JSON.parse(backedJson) : null;
      if (backedJson && json && json.status) {
        return json;
      }
      if (backedJson) {
        const isCloudBackupUpdated = await updateData({
          payload: {
            result1: backedJson,
            googleData: '',
            data,
            appID,
          },
        });
        const res = JSON.parse(isCloudBackupUpdated);
        return res;
      } else {
        const isCloudBackupSuccess = await createFile({
          payload: {
            data,
            appID,
          },
        });
        return isCloudBackupSuccess;
      }
    }
  } catch (error) {
    throw error;
  }
};

export const getCloudBackupData = async () => {
  try {
    if (Platform.OS == 'ios') {
      const backed = await Cloud.downloadBackup();
      const backedJson = backed !== '' ? JSON.parse(backed) : [];
      return {
        status: true,
        data: backedJson,
      };
    } else {
      const setup = await Cloud.setup();
      if (setup) {
        const googleLoginResult = await Cloud.login();
        if (googleLoginResult.eventName == 'onLogin') {
          const metaData = {
            name: 'BitcoinKeeperBackup.json',
            description: 'Backup data for my app',
            mimeType: 'application/json',
          };
          const result = await Cloud.checkIfFileExist(JSON.stringify(metaData));
          if (result) {
            const result1 = await Cloud.readFile(
              JSON.stringify({
                id: result.id,
              })
            );
            return {
              status: true,
              data: result1.data,
            };
          }
          return {
            status: true,
            data: [],
          };
        } else {
          return {
            status: false,
            ...googleLoginResult,
          };
        }
      }
    }
  } catch (error) {
    throw new Error(error);
  }
};
