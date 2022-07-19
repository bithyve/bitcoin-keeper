import { AxiosResponse } from 'axios';
import config from '../../config';
import idx from 'idx';
import { INotification } from '../interfaces';
import { AverageTxFeesByNetwork } from '../../wallets/interfaces';

const { AUTH_ID, HEXA_ID, RELAY_AXIOS } = config;
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
    let res: AxiosResponse;
    try {
      res = await RELAY_AXIOS.post('checkCompatibility', {
        AUTH_ID,
        method,
        version,
      });
    } catch (err) {
      if (err.response) console.log(err.response.data.err);
      if (err.code) console.log(err.code);
    }
    const { compatible, alternatives } = res.data;
    return {
      compatible,
      alternatives,
    };
  };

  public static fetchReleaseNotes = async (version: string): Promise<any> => {
    let res: AxiosResponse;
    try {
      res = await RELAY_AXIOS.get(`releasesNotes?version=${version}`);
    } catch (err) {
      if (err.response) console.log(err.response.data.err);
      if (err.code) console.log(err.code);
    }
    return res.data;
  };

  public static updateFCMTokens = async (
    appId: string,
    FCMs: string[]
  ): Promise<{
    updated: boolean;
  }> => {
    try {
      let res: AxiosResponse;
      try {
        res = await RELAY_AXIOS.post('updateFCMTokens', {
          appID: appId,
          FCMs,
        });
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      return res.data;
    } catch (err) {
      throw new Error('Failed to fetch GetBittr Details');
    }
  };

  public static fetchNotifications = async (
    appID: string
  ): Promise<{
    notifications: INotification[];
    DHInfos: [{ address: string; publicKey: string }];
  }> => {
    let res: AxiosResponse;
    try {
      res = await RELAY_AXIOS.post('fetchNotifications', {
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

    const { notifications, DHInfos } = res.data;
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
      let res: AxiosResponse;

      if (!receivers.length) throw new Error('Failed to deliver notification: receivers missing');

      try {
        res = await RELAY_AXIOS.post('sendNotifications', {
          AUTH_ID,
          receivers,
          notification,
        });
        console.log('sendNotifications', {
          res,
        });
      } catch (err) {
        // console.log({ err });
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { sent } = res.data;
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
      let res: AxiosResponse;
      try {
        // TODO: re-route fee/exchange-rates fetch from legacy relay to keeper-relay
        res = await RELAY_AXIOS.post('fetchFeeAndExchangeRates', {
          HEXA_ID,
        });
      } catch (err) {
        // console.log({ err });
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { exchangeRates, averageTxFees } = res.data;

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
      let res: AxiosResponse;
      const obj = {
        AUTH_ID,
        receivers,
        notification,
      };
      try {
        res = await RELAY_AXIOS.post('sendKeeperNotifications', {
          AUTH_ID,
          receivers,
          notification,
        });
        const { sent } = res.data;
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
    let res: AxiosResponse;
    try {
      res = await RELAY_AXIOS.post('getMessages', {
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

    const { messages } = res.data;
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
      let res: AxiosResponse;
      try {
        res = await RELAY_AXIOS.post('updateMessages', {
          AUTH_ID,
          appId,
          data,
        });
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { updated } = res.data;
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
      let res: AxiosResponse;
      try {
        res = await RELAY_AXIOS.post('v2/fetchappImage', {
          AUTH_ID,
          appId: appId,
        });
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { appImage } = res.data;
      return {
        appImage,
      };
    } catch (err) {
      throw new Error('Failed to fetch App Image');
    }
  };

  public static updateAppImage = async (
    walletImage
  ): Promise<{
    status?: number;
    data?: {
      updated: boolean;
    };
    err?: undefined;
    message?: undefined;
  }> => {
    try {
      const res: AxiosResponse = await RELAY_AXIOS.post('updateAppImage', walletImage);
      return {
        status: res.status,
      };
    } catch (err) {
      throw new Error('Failed to update App Image');
    }
  };
}
