import { AxiosResponse } from 'axios';
import { getAppImage } from 'src/store/sagaActions/bhr';
import idx from 'idx';
import { NetworkType } from 'src/core/wallets/enums';
import { SATOSHIS_IN_BTC } from 'src/common/constants/Bitcoin';
import { AverageTxFeesByNetwork } from '../../wallets/interfaces';
import { INotification } from '../interfaces';
import RestClient from '../rest/RestClient';
import { captureError } from '../sentry';
import config from '../../config';

const { AUTH_ID, HEXA_ID, RELAY } = config;
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
      res = await RestClient.post(`${RELAY}checkCompatibility`, {
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
      res = await RestClient.get(`${RELAY}releasesNotes?version=${version}`);
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
        res = await RestClient.post(`${RELAY}updateFCMTokens`, {
          appID: appId,
          FCMs,
        });
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      return res.data || res.json;
    } catch (err) {
      console.log('err', err);
      throw new Error('Failed to update FCM token');
    }
  };

  public static fetchNotifications = async (
    appID: string
  ): Promise<{
    notifications: INotification[];
    DHInfos: [{ address: string; publicKey: string }];
  }> => {
    let res;
    try {
      res = await RestClient.post(`${RELAY}fetchNotifications`, {
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

    const { notifications, DHInfos } = res.data || res.json;
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
      let res;

      if (!receivers.length) throw new Error('Failed to deliver notification: receivers missing');

      try {
        res = await RestClient.post(`${RELAY}sendNotifications`, {
          AUTH_ID,
          receivers,
          notification,
        });
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { sent } = res.data || res.json;
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
      let res;
      try {
        // TODO: re-route fee/exchange-rates fetch from legacy relay to keeper-relay
        res = await RestClient.post(`${RELAY}fetchFeeAndExchangeRates`, {
          HEXA_ID,
        });
      } catch (err) {
        // console.log({ err });
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { exchangeRates, averageTxFees } = res.data || res.json;

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
      let res;
      const obj = {
        AUTH_ID,
        receivers,
        notification,
      };
      try {
        res = await RestClient.post(`${RELAY}sendKeeperNotifications`, {
          AUTH_ID,
          receivers,
          notification,
        });
        const { sent } = res.data || res.json;
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
      res = await RestClient.post(`${RELAY}getMessages`, {
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
      let res;
      try {
        res = await RestClient.post(`${RELAY}updateMessages`, {
          AUTH_ID,
          appId,
          data,
        });
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { updated } = res.data || res.json;
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
      let res;
      try {
        res = await RestClient.post(`${RELAY}v2/fetchappImage`, {
          AUTH_ID,
          appId,
        });
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { appImage } = res.data || res.json;
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
    err?: string;
    message?: string;
  }> => {
    try {
      let res = await RestClient.post(`${RELAY}updateAppImage`, appImage);
      res = res.data;
      return {
        status: res.status,
      };
    } catch (err) {
      captureError(err);
      throw new Error('Failed to update App Image');
    }
  };

  public static updateVaultImage = async (
    vaultData
  ): Promise<{
    status?: number;
    data?: {
      updated: boolean;
    };
    err?: string;
    message?: string;
  }> => {
    try {
      let res;

      res = await RestClient.post(`${RELAY}updateVaultImage`, vaultData);

      res = res.json || res.data;
      return {
        status: res.status,
      };
    } catch (err) {
      captureError(err);
      throw new Error('Failed to update Vault Image');
    }
  };

  public static getAppImage = async (appId): Promise<any> => {
    try {
      const res = await RestClient.post(`${RELAY}getAppImage`, {
        id: appId,
      });
      const {data} = res;
      return data;
    } catch (err) {
      captureError(err);
      throw new Error('Failed get App Image');
    }
  };

  public static getVaultMetaData = async (signerId): Promise<any> => {
    try {
      let res;
      res = await RestClient.post(`${RELAY}getVaultMetaData`, {
        signerId,
      });
      const data = res.data || res.json;
      return data;
    } catch (err) {
      captureError(err);
      throw new Error('Failed get Vault Meta Data');
    }
  };

  public static getSignerIdInfo = async (signerId): Promise<any> => {
    try {
      const res = await RestClient.post(`${RELAY}getSignerIdInfo`, {
        signerId,
      });
      const data = res.data || res.json;
      return data.exsists;
    } catch (err) {
      captureError(err);
      throw new Error('Failed get SignerId Info');
    }
  };

  public static getVac = async (signerIdsHash): Promise<any> => {
    try {
      const res = await RestClient.post(`${RELAY}getVac`, {
        signerIdsHash,
      });
      const data = res.data || res.json;
      return data.encryptedVac;
    } catch (err) {
      captureError(err);
      throw new Error('Failed get Vac');
    }
  };

  public static getTestcoins = async (
    recipientAddress: string,
    network: any
  ): Promise<{
    txid: any;
    funded: any;
  }> => {
    if (network === NetworkType.MAINNET) {
      throw new Error('Invalid network: failed to fund via testnet');
    }
    const amount = 5000 / SATOSHIS_IN_BTC;
    try {
      const res = await RestClient.post(`${config.RELAY}testnetFaucet`, {
        recipientAddress,
        amount,
      });
      const { txid, funded } = res.data;
      return {
        txid,
        funded,
      };
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }
  };
}
