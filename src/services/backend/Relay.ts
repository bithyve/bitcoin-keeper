import { NetworkType } from 'src/services/wallets/enums';
import { SATOSHIS_IN_BTC } from 'src/constants/Bitcoin';
import { SubScriptionPlan } from 'src/models/interfaces/Subscription';
import { AxiosResponse } from 'axios';
import { AverageTxFeesByNetwork, UTXOInfo } from 'src/services/wallets/interfaces';
import config from 'src/utils/service-utilities/config';
import { INotification } from '../../models/interfaces/AssistedKeys';
import RestClient from '../rest/RestClient';
import { captureError } from '../sentry';

const { HEXA_ID, RELAY } = config;
const TOR_ENDPOINT = 'https://check.torproject.org/api/ip';
const MEMPOOL_ENDPOINT = 'https://mempool.space';

interface SignerChange {
  oldSignerId: string;
  newSignerId: string;
  newSignerDetails: string;
}

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
      const data = res.data || res.json;
      return data;
    } catch (err) {
      if (err.response) console.log(err.response.data.err);
      if (err.code) console.log(err.code);
    }
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
        res = await RestClient.post(`${RELAY}fetchFeeAndExchangeRates`, {
          HEXA_ID,
        });
      } catch (err) {
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
      try {
        res = await RestClient.post(`${RELAY}sendKeeperNotifications`, {
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

  public static updateSubscription = async (
    id: string,
    appID: string,
    data: object
  ): Promise<{
    updated: boolean;
    level: number;
    error?: string;
    productId?: string;
  }> => {
    let res;
    try {
      res = await RestClient.post(`${RELAY}updateSubscription`, {
        appID,
        id,
        data,
        newPlans: true,
      });
    } catch (err) {
      return err.response.data;
    }
    return res.data || res.json;
  };

  public static verifyReceipt = async (id: string, appID: string): Promise<any> => {
    let res;
    try {
      res = await RestClient.post(`${RELAY}verifyReceipt`, {
        appID,
        id,
      });
    } catch (err) {
      console.log('err', err);
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }
    return res.data || res.json;
  };

  public static getSubscriptionDetails = async (
    id: string,
    appID: string
  ): Promise<{ plans: SubScriptionPlan[] }> => {
    let res;
    try {
      res = await RestClient.post(`${RELAY}getSubscriptionDetails`, {
        appID,
        id,
        newPlans: true,
      });
    } catch (err) {
      console.log('err', err);
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }
    return res.data || res.json;
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
    status: string;
    updated: boolean;
    err?: string;
    message?: string;
  }> => {
    try {
      const res = await RestClient.post(`${RELAY}updateAppImage`, appImage);
      const data = res.data || res.json;
      return data;
    } catch (err) {
      captureError(err);
      throw new Error('Failed to update app backup. Check your internet connection and try again.');
    }
  };

  public static migrateXfp = async (
    appId: string,
    signerChanges: SignerChange[]
  ): Promise<{
    updated: boolean;
    err?: string;
  }> => {
    try {
      const res = await RestClient.post(`${RELAY}migrateXfps`, { appId, signerChanges });
      const data = res.data || res.json;
      return data;
    } catch (err) {
      captureError(err);
      throw new Error('Failed to do migrate the xfp');
    }
  };

  public static deleteAppImageEntity = async (
    entityList
  ): Promise<{
    status: string;
    updated: boolean;
    err?: string;
    message?: string;
  }> => {
    try {
      const res = await RestClient.post(`${RELAY}deleteAppImageEntity`, entityList);
      const data = res.data || res.json;
      return data;
    } catch (err) {
      captureError(err);
      throw new Error('Failed to update App Image');
    }
  };

  public static deleteVaultImage = async (
    entityList
  ): Promise<{
    status: string;
    updated: boolean;
    err?: string;
    message?: string;
  }> => {
    try {
      const res = await RestClient.post(`${RELAY}deleteVaults`, entityList);
      const data = res.data || res.json;
      return data;
    } catch (err) {
      captureError(err);
      throw new Error('Failed to update Vault Image');
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
      const res = await RestClient.post(`${RELAY}updateVaultImage`, vaultData);
      const data = res.data || res.json;
      return data;
    } catch (err) {
      captureError(err);
      throw new Error('Failed to update app backup. Check your internet connection and try again.');
    }
  };

  public static getAppImage = async (appId): Promise<any> => {
    try {
      const res = await RestClient.post(`${RELAY}getAppImage`, {
        appId,
      });
      const data = res.data || res.json;
      return data;
    } catch (err) {
      captureError(err);
      if (err?.code == 'ERR_NETWORK') throw new Error('Network Error');
      throw new Error('Failed get App Image');
    }
  };

  public static getVaultMetaData = async (xfpHash: String, signerId?: String): Promise<any> => {
    try {
      const res: any = await RestClient.post(`${RELAY}getVaultMetaData`, {
        xfpHash,
        signerId,
      });
      const data = res.data || res.json;
      return data;
    } catch (err) {
      captureError(err);
      throw new Error('Failed get vault Meta Data');
    }
  };

  public static getSignerIdInfo = async (signerId): Promise<any> => {
    try {
      const res: any = await RestClient.post(`${RELAY}getSignerIdInfo`, {
        signerId,
      });
      const data = res.data || res.json;
      return data.exsists;
    } catch (err) {
      captureError(err);
      throw new Error('Failed get SignerId Info');
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

    try {
      const res = await RestClient.post(`${config.RELAY}testnetFaucet`, {
        recipientAddress,
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

  public static createNewApp = async (
    publicId: string,
    appID: string,
    fcmToken: string
  ): Promise<{
    created: boolean;
  }> => {
    let res;
    try {
      res = await RestClient.post(`${RELAY}createNewApp`, {
        appID,
        publicId,
        fcmToken,
      });
    } catch (err) {
      console.log('err', err);
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }
    const { created } = res.data || res.json;
    return {
      created,
    };
  };

  public static addUTXOinfos = async (
    appId: string,
    UTXOinfos: UTXOInfo[]
  ): Promise<{
    added: boolean;
  }> => {
    let res;
    try {
      res = await RestClient.post(`${RELAY}addUTXOinfos`, {
        appId,
        UTXOinfos,
      });
      const { added } = res.data || res.json;
      return {
        added,
      };
    } catch (err) {
      console.log('err', err);
      if (err.code) throw new Error(err.code);
    }
  };

  public static modifyUTXOinfo = async (
    appId: string,
    updatedUTXOobject: object,
    UTXOid: string
  ): Promise<{
    updated: boolean;
  }> => {
    try {
      const res = (await RestClient.post(`${RELAY}modifyUTXOinfo`, {
        appId,
        updatedUTXOobject,
        UTXOid,
      })) as AxiosResponse;
      const { updated } = res.data || res.json;
      return {
        updated,
      };
    } catch (err) {
      console.log('err', err);
      if (err.code) throw new Error(err.code);
    }
  };

  public static modifyLabels = async (
    appId: string,
    addLabels: any[],
    deleteLabels: any[]
  ): Promise<{
    updated: boolean;
  }> => {
    try {
      const res = (await RestClient.post(`${RELAY}modifyLabels`, {
        appId,
        addLabels,
        deleteLabels,
      })) as AxiosResponse;
      const { updated } = res.data || res.json;
      return {
        updated,
      };
    } catch (err) {
      console.log('err', err);
      if (err.code) throw new Error(err.code);
    }
  };

  public static checkTorStatus = async () => {
    try {
      const response = await RestClient.get(TOR_ENDPOINT, { timeout: 20000 });
      const data = (response as AxiosResponse).data || (response as any).json;
      return data.IsTor;
    } catch (error) {
      captureError(error);
      throw error;
    }
  };

  public static fetchOneDayHistoricalFee = async (): Promise<any> => {
    try {
      const response = await RestClient.get(`${RELAY}onedayGraphData`);
      const data = (response as AxiosResponse).data || (response as any).json;
      if (data && data.graph_data.data) {
        return data.graph_data.data;
      } else {
        return [];
      }
    } catch (error) {
      captureError(error);
      throw error;
    }
  };

  public static fetchOneWeekHistoricalFee = async (): Promise<any> => {
    try {
      const response = await RestClient.get(`${RELAY}oneweekGraphData`);
      const data = (response as AxiosResponse).data || (response as any).json;
      if (data && data.graph_data.data) {
        return data.graph_data.data;
      } else {
        return [];
      }
    } catch (error) {
      captureError(error);
      throw error;
    }
  };

  public static fetchFeeInsightData = async (): Promise<any> => {
    try {
      const response = await RestClient.get(`${RELAY}feeInsighData`);
      const data = (response as AxiosResponse).data || (response as any).json;
      if (data && data.insightData) {
        return data.insightData;
      } else {
        return {};
      }
    } catch (error) {
      captureError(error);
      throw error;
    }
  };

  public static getOffer = async (productId: string, promoCode: string): Promise<any> => {
    try {
      const response = await RestClient.post(`${RELAY}offer`, { productId, promoCode });
      const data = (response as AxiosResponse).data || (response as any).json;
      if (data) {
        return data;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  public static createRemoteKey = async (data: string, hash: string) => {
    try {
      const response = await RestClient.post(`${RELAY}createRemoteKey`, { data, hash });
      const res = (response as AxiosResponse).data || (response as any).json;
      if (res) {
        return res;
      } else {
        return null;
      }
    } catch (error) {
      console.log('🚀 ~ Relay ~ createRemoteKey= ~ error:', error);
    }
  };

  public static getRemoteKey = async (hash: string) => {
    try {
      const response = await RestClient.get(`${RELAY}getRemoteKey?hash=${hash}`);
      const res = (response as AxiosResponse).data || (response as any).json;
      if (res) {
        return res;
      } else {
        return null;
      }
    } catch (error) {
      console.log('🚀 ~ Relay ~ getRemoteKey= ~ error:', error);
    }
  };
  public static fetchHardwareReferralLinks = async (appId: string): Promise<any> => {
    try {
      const response = await RestClient.get(`${RELAY}getHardwareReferralLinks?appId=${appId}`);

      const data = (response as AxiosResponse).data || (response as any).json;

      if (data) {
        return data;
      } else {
        return [];
      }
    } catch (error) {
      captureError(error);
      throw error;
    }
  };

  public static sendSingleNotification = async (data) => {
    try {
      const response = await RestClient.post(`${RELAY}sendSingleNotification`, data);
      const res = (response as AxiosResponse).data || (response as any).json;
      if (res) {
        return res;
      } else {
        return null;
      }
    } catch (error) {
      console.log('🚀 ~ Relay ~ sendSingleNotification= ~ error:', { error });
    }
  };

  public static updateZendeskExternalId = async (data) => {
    try {
      const response = await RestClient.post(`${RELAY}updateZendeskExternalId`, data);
      const res = (response as AxiosResponse).data || (response as any).json;
      if (res) {
        return res;
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  };

  public static updateCollaborativeChannel = async (channelId: string, encryptedData: string) => {
    try {
      const res = await RestClient.post(`${RELAY}updateCollaborativeChannel`, {
        channelId,
        encryptedData,
      });
      return res.data;
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }
  };

  public static fetchCollaborativeChannel = async (channelId: string) => {
    try {
      const res = await RestClient.post(`${RELAY}fetchCollaborativeChannel`, {
        channelId,
      });
      return res.data;
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }
  };

  public static backupAllSignersAndVaults = async (
    allData
  ): Promise<{
    status?: number;
    data?: {
      updated: boolean;
    };
    err?: string;
    message?: string;
  }> => {
    try {
      const res = await RestClient.post(`${RELAY}backupAllSignersAndVaults`, allData);
      const data = res.data || res.json;
      return data;
    } catch (err) {
      captureError(err);
      throw new Error('Failed to update app backup. Check your internet connection and try again.');
    }
  };

  public static checkEligibilityForBtcPay = async (body): Promise<any> => {
    try {
      const res = await RestClient.post(`${RELAY}eligibleForBtcPay`, body);
      const data = res?.data;
      return data;
    } catch (err) {
      captureError(err);
      if (err?.code == 'ERR_NETWORK') throw new Error('Network Error');
      throw new Error('Error while create BTCPay Order');
    }
  };

  public static restoreBtcPurchase = async (appId): Promise<any> => {
    try {
      const res = await RestClient.get(`${RELAY}restoreBtcPurchase?appId=${appId}`);
      const data = res?.data;
      return data;
    } catch (err) {
      console.log('🚀 ~ Relay ~ restoreBtcPurchase= ~ err:', err);
      captureError(err);
      if (err?.code == 'ERR_NETWORK') throw new Error('Network Error');
      throw new Error(err.message);
    }
  };
}
