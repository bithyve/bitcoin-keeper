import { NetworkType } from 'src/services/wallets/enums';
import { SubScriptionPlan } from 'src/models/interfaces/Subscription';
import { AxiosResponse } from 'axios';
import { AverageTxFeesByNetwork } from 'src/services/wallets/interfaces';
import config from 'src/utils/service-utilities/config';
import RestClient from '../rest/RestClient';
import { captureError } from '../sentry';

const { HEXA_ID, RELAY } = config;
const TOR_ENDPOINT = 'https://check.torproject.org/api/ip';

interface SignerChange {
  oldSignerId: string;
  newSignerId: string;
  newSignerDetails: string;
}

export default class Relay {
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

  public static deleteBackup = async (
    body
  ): Promise<{
    status?: number;
    data?: {
      updated: boolean;
    };
    err?: string;
    message?: string;
  }> => {
    try {
      const res = await RestClient.post(`${RELAY}deleteBackup`, body);
      const data = res.data || res.json;
      return data;
    } catch (err) {
      captureError(err);
      throw new Error(
        'Failed to delete assisted server backup. Check your internet connection and try again.'
      );
    }
  };

  public static redeemKeeperPrivate = async (body): Promise<any> => {
    try {
      const res = await RestClient.post(`${RELAY}redeemKeeperPrivate`, body);
      const data = res?.data;
      return data;
    } catch (err) {
      console.log('🚀 redeemKeeperPrivate err:', err);
      captureError(err);
      if (err?.code == 'ERR_NETWORK') throw new Error('Network Error');
      throw new Error(err.message);
    }
  };

  public static getAccountManagerDetails = async (appId): Promise<any> => {
    try {
      const res = await RestClient.get(`${RELAY}getAccountManagerDetails?appId=${appId}`);
      const data = res?.data;
      return data;
    } catch (err) {
      console.log('🚀 ~ Relay ~ getAccountManagerDetails ~ err:', err);
      captureError(err);
      if (err?.code == 'ERR_NETWORK') throw new Error('Network Error');
      throw new Error(err.message);
    }
  };

  public static getActiveCampaign = async (appId): Promise<any> => {
    return undefined; // To be enabled after successful implementation
    let res;
    try {
      res = await RestClient.get(`${RELAY}getActiveCampaign?appId=${appId}`);
    } catch (err) {
      console.log('err', err);
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }
    return res ? res.data || res.json : null;
  };
}
