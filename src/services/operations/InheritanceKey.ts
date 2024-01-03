import { AxiosResponse } from 'axios';
import config from 'src/core/config';
import {
  EncryptedInheritancePolicy,
  IKSCosignersMapUpdate,
  InheritanceConfiguration,
  InheritancePolicy,
} from '../interfaces';
import RestClient from '../rest/RestClient';
import { asymmetricEncrypt } from '../operations/encryption/index';

const { HEXA_ID, SIGNING_SERVER, SIGNING_SERVER_RSA_PUBKEY } = config;

export default class InheritanceKeyServer {
  static getEncryptedInheritancePolicy = async (
    policy: InheritancePolicy
  ): Promise<EncryptedInheritancePolicy> => {
    let encryptedPolicy: EncryptedInheritancePolicy;
    if (policy) {
      encryptedPolicy = {
        ...policy,
        alert: policy.alert
          ? await asymmetricEncrypt(JSON.stringify(policy.alert), SIGNING_SERVER_RSA_PUBKEY)
          : undefined,
      };
    }
    return encryptedPolicy;
  };

  /**
   * @returns Promise
   */
  static initializeIKSetup = async (): Promise<{
    setupData: {
      id: string;
      inheritanceXpub: string;
      masterFingerprint: string;
      derivationPath: string;
    };
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/initializeIKSetup`, {
        HEXA_ID,
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
   * @param  {string} id
   * @param  {InheritanceConfiguration} configuration
   * @param  {InheritancePolicy} policy
   * @returns Promise
   */
  static finalizeIKSetup = async (
    id: string,
    configuration: InheritanceConfiguration,
    policy: InheritancePolicy
  ): Promise<{
    setupSuccessful: boolean;
  }> => {
    let res: AxiosResponse;
    const updatedEncryptedPolicy = await this.getEncryptedInheritancePolicy(policy);

    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/finalizeIKSetup`, {
        HEXA_ID,
        id,
        configuration,
        updatedEncryptedPolicy,
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
   * @param  {string} id
   * @param  {string[]} existingThresholdIDescriptors
   * @param  {InheritanceConfiguration} newConfiguration
   * @returns {Promise<boolean>} updated
   */
  static updateInheritanceConfig = async (
    id: string,
    existingThresholdDescriptors: string[],
    newConfiguration: InheritanceConfiguration
  ): Promise<{
    updated: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/updateInheritanceConfig`, {
        HEXA_ID,
        id,
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
   * @param  {string} id
   * @param  {any} updates
   * @param {string[]} thresholdDescriptors
   * @returns {Promise<boolean>} updated
   */
  static updateInheritancePolicy = async (
    id: string,
    updatedPolicy: InheritancePolicy,
    thresholdDescriptors: string[]
  ): Promise<{
    updated: boolean;
  }> => {
    let res: AxiosResponse;
    const updatedEncryptedPolicy = await this.getEncryptedInheritancePolicy(updatedPolicy);
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/updateInheritancePolicy`, {
        HEXA_ID,
        id,
        updatedEncryptedPolicy,
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
    id: string,
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
      res = await RestClient.post(`${SIGNING_SERVER}v3/signTransactionViaInheritanceKey`, {
        HEXA_ID,
        id,
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
    cosignersId: string,
    thresholdDescriptors: string[]
  ): Promise<{
    requestStatus: {
      approvesIn: number;
      isApproved: boolean;
      isDeclined: boolean;
    };
    setupInfo?: {
      id: string;
      inheritanceXpub: string;
      masterFingerprint: string;
      derivationPath: string;
      configuration: InheritanceConfiguration;
    };
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/requestInheritanceKey`, {
        HEXA_ID,
        requestId,
        cosignersId,
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
      res = await RestClient.post(`${SIGNING_SERVER}v3/declineInheritanceKeyRequest`, {
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

  static updateCosignersToSignerMapIKS = async (
    id: string,
    cosignersMapIKSUpdates: IKSCosignersMapUpdate[]
  ): Promise<{
    updated: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/updateCosignersToSignerMapIKS`, {
        HEXA_ID,
        id,
        cosignersMapIKSUpdates,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { updated } = res.data;
    if (!updated) throw new Error('Failed to update cosigners to signer map');
    return {
      updated,
    };
  };

  static findIKSSetup = async (
    ids: string[],
    thresholdDescriptors: string[]
  ): Promise<{
    setupInfo: {
      id: string;
      inheritanceXpub: string;
      masterFingerprint: string;
      derivationPath: string;
      configuration: InheritanceConfiguration;
      policy: InheritancePolicy;
    };
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/findIKSSetup`, {
        HEXA_ID,
        ids,
        thresholdDescriptors,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { setupInfo } = res.data;
    return {
      setupInfo,
    };
  };

  static migrateSignersV2ToV3 = async (
    vaultId: string,
    cosignersMapIKSUpdates: IKSCosignersMapUpdate[]
  ): Promise<{
    migrationSuccessful: boolean;
    setupData: {
      id: string;
      inheritanceXpub: any;
      masterFingerprint: any;
      derivationPath: string;
      policy;
      configuration;
    };
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/migrateIKSSignersV2ToV3`, {
        HEXA_ID,
        vaultId,
        cosignersMapIKSUpdates,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { migrationSuccessful, setupData } = res.data;
    return {
      migrationSuccessful,
      setupData,
    };
  };
}
