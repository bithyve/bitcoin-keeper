import { AxiosResponse } from 'axios';
import config from '../../config';
import idx from 'idx';
import { INotification } from '../interfaces';
import { AverageTxFeesByNetwork } from '../../wallets/interfaces';
import { getAppImage } from 'src/store/sagaActions/bhr';
import RestClient from '../rest/RestClient';

const { AUTH_ID, HEXA_ID } = config;
export default class Relay {
  public static checkCompatibility = async (
    method: string,
    version: string
  ): Promise<{
    compatible: boolean;
    alternatives: {
      update: boolean;
      message: string;
    };
  }> => {
    let res;
    try {
      res = await RestClient.post('checkCompatibility', {
        AUTH_ID,
        method,
        version,
      });
    } catch (err) {
      if (err.response) console.log(err.response.data.err);
      if (err.code) console.log(err.code);
    }
    const { compatible, alternatives } = res.data || res.json;
    return {
      compatible,
      alternatives,
    };
  };

  public static fetchReleaseNotes = async (version: string): Promise<any> => {
    let res;
    try {
      res = await RestClient.get(`releasesNotes?version=${version}`);
    } catch (err) {
      if (err.response) console.log(err.response.data.err);
      if (err.code) console.log(err.code);
    }
    return res.data || res.json;
  };

  public static updateFCMTokens = async (
    appId: string,
    FCMs: string[]
  ): Promise<{
    updated: boolean;
  }> => {
    try {
      let res;
      try {
        res = await RestClient.post('updateFCMTokens', {
          appID: appId,
          FCMs,
        })
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      return res.data || res.json;
    } catch (err) {
      console.log('err', err)
      throw new Error('Failed to update FCM token');
    }
  };

  public static fetchNotifications = async (
    appID: string
  ): Promise<{
    notifications: INotification[];
    DHInfos: [{ address: string; publicKey: string }];
  }> => {
    let res
    try {
      res = await RestClient.post('fetchNotifications', {
        AUTH_ID,
        appID,
      });
    } catch (err) {
      console.log({
        err,
      });
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { notifications, DHInfos } = res.data || res.json
    return {
      notifications,
      DHInfos,
    };
  };

  public static sendNotifications = async (
    receivers: { appId: string; FCMs?: string[] }[],
    notification: INotification
  ): Promise<{
    sent: boolean;
  }> => {
    try {
      let res

      if (!receivers.length) throw new Error('Failed to deliver notification: receivers missing');

      try {
        res = await RestClient.post('sendNotifications', {
          AUTH_ID,
          receivers,
          notification,
        });
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { sent } = res.data || res.json
      if (!sent) throw new Error();

      return {
        sent,
      };
    } catch (err) {
      throw new Error('Failed to deliver notification');
    }
  };

  public static fetchFeeAndExchangeRates = async (): Promise<{
    exchangeRates: any;
    averageTxFees: AverageTxFeesByNetwork;
  }> => {
    try {
      let res
      try {
        // TODO: re-route fee/exchange-rates fetch from legacy relay to keeper-relay
        res = await RestClient.post('fetchFeeAndExchangeRates', {
          HEXA_ID,
        });
      } catch (err) {
        // console.log({ err });
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { exchangeRates, averageTxFees } = res.data || res.json

      return {
        exchangeRates,
        averageTxFees,
      };
    } catch (err) {
      throw new Error('Failed fetch fee and exchange rates');
    }
  };

  public static sendKeeperNotifications = async (
    receivers: string[],
    notification: INotification
  ) => {
    try {
      let res
      const obj = {
        AUTH_ID,
        receivers,
        notification,
      };
      try {
        res = await RestClient.post('sendKeeperNotifications', {
          AUTH_ID,
          receivers,
          notification,
        });
        const { sent } = res.data || res.json
        if (!sent) throw new Error();
        return {
          sent,
        };
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
    } catch (err) {
      throw new Error('Failed to deliver notification');
    }
  };

  public static getMessages = async (
    appID: string,
    timeStamp: Date
  ): Promise<{
    messages: [];
  }> => {
    let res;
    try {
      res = await RestClient.post('getMessages', {
        AUTH_ID,
        appID,
        timeStamp,
      });

    } catch (err) {
      console.log({
        err,
      });
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }
    const { messages } = res.data || res.json;
    return {
      messages,
    };
  };

  public static updateMessageStatus = async (
    appId: string,
    data: []
  ): Promise<{
    updated: boolean;
  }> => {
    try {
      let res
      try {
        res = await RestClient.post('updateMessages', {
          AUTH_ID,
          appId,
          data,
        });
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { updated } = res.data || res.json
      return {
        updated,
      };
    } catch (err) {
      throw new Error('Failed to fetch GetBittr Details');
    }
  };

  public static fetchAppImage = async (
    appId: string
  ): Promise<{
    appImage: any;
  }> => {
    try {
      let res
      try {
        res = await RestClient.post('v2/fetchappImage', {
          AUTH_ID,
          appId: appId,
        });
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { appImage } = res.data || res.json
      return {
        appImage,
      };
    } catch (err) {
      throw new Error('Failed to fetch App Image');
    }
  };

  public static updateAppImage = async (
    appImage
  ): Promise<{
    status?: number;
    data?: {
      updated: boolean;
    };
    err?: undefined;
    message?: undefined;
  }> => {
    try {
      let res
      res = await RestClient.post('updateAppImage', appImage);
      res = res.json || res.data
      return {
        status: res.status,
      };
    } catch (err) {
      throw new Error('Failed to update App Image');
    }
  };

  public static getAppImage = async (appId): Promise<any> => {
    try {
      let res
      res = await RestClient.post('getAppImage', {
        id: appId,
      });
      const { appImageData } = res.data || res.json
      return appImageData;
    } catch (err) {
      throw new Error('Failed get App Image');
    }
  };
}
