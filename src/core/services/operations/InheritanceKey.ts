import { AxiosResponse } from 'axios';
import config from '../../config';
import {
  InheritanceAlert,
  InheritanceConfiguration,
  InheritanceNotification,
  InheritancePolicy,
} from '../interfaces';
import RestClient from '../rest/RestClient';

const { HEXA_ID, SIGNING_SERVER } = config;

export default class InheritanceKeyServer {
  /**
   * @param  {string} vaultShellId
   * @param  {InheritancePolicy} policy
   * @returns Promise
   */
  static initializeIKSetup = async (
    vaultShellId: string
  ): Promise<{
    setupData: {
      inheritanceXpub: string;
      masterFingerprint: string;
      derivationPath: string;
    };
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/initializeIKSetup`, {
        HEXA_ID,
        vaultId: vaultShellId,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { setupData } = res.data;
    return {
      setupData,
    };
  };

  /**
   * @param  {string} vaultShellId
   * @param  {InheritanceConfiguration} configuration
   * @param  {InheritancePolicy} policy
   * @returns Promise
   */
  static finalizeIKSetup = async (
    vaultShellId: string,
    configuration: InheritanceConfiguration,
    policy: InheritancePolicy
  ): Promise<{
    setupSuccessful: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/finalizeIKSetup`, {
        HEXA_ID,
        vaultId: vaultShellId,
        configuration,
        policy,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { setupSuccessful } = res.data;
    return {
      setupSuccessful,
    };
  };

  /**
   * @param  {string} vaultShellId
   * @param  {string[]} existingThresholdIDescriptors
   * @param  {InheritanceConfiguration} newConfiguration
   * @returns {Promise<boolean>} updated
   */
  static updateInheritanceConfig = async (
    vaultShellId: string,
    existingThresholdDescriptors: string[],
    newConfiguration: InheritanceConfiguration
  ): Promise<{
    updated: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/updateInheritanceConfig`, {
        HEXA_ID,
        vaultId: vaultShellId,
        existingThresholdDescriptors,
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
   * @param  {string} vaultShellId
   * @param  {any} updates
   * @param {string[]} thresholdDescriptors
   * @returns {Promise<boolean>} updated
   */
  static updateInheritancePolicy = async (
    vaultShellId: string,
    updates: {
      notification?: InheritanceNotification;
      alert?: InheritanceAlert;
    },
    thresholdDescriptors: string[]
  ): Promise<{
    updated: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/updateInheritancePolicy`, {
        HEXA_ID,
        vaultId: vaultShellId,
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
    vaultShellId: string,
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
        vaultId: vaultShellId,
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
    vaultShellId: string,
    thresholdDescriptors: string[]
  ): Promise<{
    requestStatus: {
      approvesIn: number;
      isApproved: boolean;
      isDeclined: boolean;
    };
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
        vaultId: vaultShellId,
        thresholdDescriptors,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { requestStatus, setupInfo } = res.data;
    return {
      requestStatus,
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
