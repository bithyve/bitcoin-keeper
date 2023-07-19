import { AxiosResponse } from 'axios';
import config from '../../config';
import {
  InheritanceConfiguration,
  InheritanceNotification,
  InheritancePolicy,
} from '../interfaces';
import RestClient from '../rest/RestClient';

const { HEXA_ID, SIGNING_SERVER } = config;

export default class InheritanceKeyServer {
  /**
   * @param  {string} vaultId
   * @param  {InheritancePolicy} policy
   * @returns Promise
   */
  static setupIK = async (
    vaultId: string,
    configuration: InheritanceConfiguration,
    policy: InheritancePolicy
  ): Promise<{
    setupData: {
      configuration: InheritanceConfiguration;
      policy: InheritancePolicy;
      inheritanceXpub: string;
      masterFingerprint: string;
      derivationPath: string;
    };
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/setupInheritanceKey`, {
        HEXA_ID,
        vaultId,
        configuration,
        policy,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { setupSuccessful, setupData } = res.data;
    if (!setupSuccessful) throw new Error('Inheritance Key setup failed');
    return {
      setupData,
    };
  };

  /**
   * @param  {string} vaultId
   * @param  {string[]} existingThresholdIDescriptors
   * @param  {InheritanceConfiguration} newConfiguration
   * @returns {Promise<boolean>} updated
   */
  static updateInheritanceConfig = async (
    vaultId: string,
    existingThresholdIDescriptors: string[],
    newConfiguration: InheritanceConfiguration
  ): Promise<{
    updated: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/updateInheritancePolicy`, {
        HEXA_ID,
        vaultId,
        existingThresholdIDescriptors,
        newConfiguration,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { updated } = res.data;
    if (!updated) throw new Error('Inheritance config update failed');
    return {
      updated,
    };
  };

  /**
   * @param  {string} vaultId
   * @param  {any} updates
   * @param {string[]} thresholdDescriptors
   * @returns {Promise<boolean>} updated
   */
  static updateInheritancePolicy = async (
    vaultId: string,
    updates: {
      notification?: InheritanceNotification;
    },
    thresholdDescriptors: string[]
  ): Promise<{
    updated: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/updateInheritancePolicy`, {
        HEXA_ID,
        vaultId,
        updates,
        thresholdDescriptors,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { updated } = res.data;
    if (!updated) throw new Error('Inheritance policy update failed');
    return {
      updated,
    };
  };

  static signPSBT = async (
    vaultId: string,
    serializedPSBT: string,
    childIndexArray: Array<{
      subPath: number[];
      inputIdentifier: {
        txId: string;
        vout: number;
        value: number;
      };
    }>,
    thresholdDescriptors: string[]
  ): Promise<{
    signedPSBT: string;
  }> => {
    let res: AxiosResponse;

    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/signTransactionViaInheritanceKey`, {
        HEXA_ID,
        vaultId,
        serializedPSBT,
        childIndexArray,
        thresholdDescriptors,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { signedPSBT } = res.data;
    return {
      signedPSBT,
    };
  };

  static requestInheritanceKey = async (
    requestId: string,
    vaultId: string,
    thresholdDescriptors: string[]
  ): Promise<{
    isRequestApproved: boolean;
    isRequestDeclined: boolean;
    setupInfo?: {
      inheritanceXpub: string;
      masterFingerprint: string;
      derivationPath: string;
      configuration: InheritanceConfiguration;
      policy: InheritancePolicy;
    };
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/requestInheritanceKey`, {
        HEXA_ID,
        requestId,
        vaultId,
        thresholdDescriptors,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { isRequestApproved, isRequestDeclined, setupInfo } = res.data;

    return {
      isRequestApproved,
      isRequestDeclined,
      setupInfo,
    };
  };

  static declineInheritanceKeyRequest = async (
    requestId: string
  ): Promise<{
    declined: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/declineInheritanceKeyRequest`, {
        HEXA_ID,
        requestId,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { declined } = res.data;

    return {
      declined,
    };
  };
}
