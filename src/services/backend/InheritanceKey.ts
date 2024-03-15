import { AxiosResponse } from 'axios';
import config from 'src/utils/service-utilities/config';
import { genrateOutputDescriptors } from 'src/utils/service-utilities/utils';
import {
  EncryptedInheritancePolicy,
  IKSCosignersMapUpdate,
  InheritanceConfiguration,
  InheritancePolicy,
} from '../../models/interfaces/AssistedKeys';
import RestClient from '../rest/RestClient';
import { asymmetricEncrypt, hash256 } from '../../utils/service-utilities/encryption';
import { Vault } from '../wallets/interfaces/vault';

const { HEXA_ID, SIGNING_SERVER, SIGNING_SERVER_RSA_PUBKEY } = config;

export default class InheritanceKeyServer {
  static getThresholdDescriptors = (
    existingConfiguration: InheritanceConfiguration,
    omitDesc: string
  ): string[] => {
    const validDescriptors = [];
    existingConfiguration.descriptors.forEach((desc) => {
      // omit the one for which the threshold is being set
      if (desc !== omitDesc) validDescriptors.push(desc);
    });

    if (validDescriptors.length < existingConfiguration.m) {
      // threshold should be achievable w/o the assisted keys(otherwise the user funds would get locked as backend goes down)
      throw new Error('Insufficient threshold descriptors');
    }

    const thresholdDescriptors = validDescriptors.slice(0, existingConfiguration.m);
    return thresholdDescriptors; // they are hashed and checked against the stored ones; on the backend
  };

  static generateInheritanceConfiguration = (
    vault: Vault,
    backupBSMSForIKS = false
  ): InheritanceConfiguration => {
    const descriptors = vault.signers.map((signer) => signer.xfp);

    // const bsms = backupBSMSForIKS ? genrateOutputDescriptors(vault) : null;
    const bsms = null; // disabled BSMS backup

    return {
      id: vault.id,
      m: vault.scheme.m,
      n: vault.scheme.n,
      descriptors,
      bsms,
    };
  };

  static getEncryptedInheritanceConfiguration = async (
    inheritanceConfiguration: InheritanceConfiguration
  ): Promise<InheritanceConfiguration> => {
    const hashedDescriptor = inheritanceConfiguration.descriptors.map((desc) => hash256(desc));
    const encryptedBSMS = inheritanceConfiguration.bsms // TODO: encryption for BSMS is not working(to be fixed)
      ? await asymmetricEncrypt(inheritanceConfiguration.bsms, SIGNING_SERVER_RSA_PUBKEY)
      : null;

    return {
      id: inheritanceConfiguration.id,
      m: inheritanceConfiguration.m,
      n: inheritanceConfiguration.n,
      descriptors: hashedDescriptor,
      bsms: encryptedBSMS,
    };
  };

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

    const encryptedConfiguration = await this.getEncryptedInheritanceConfiguration(configuration);
    const updatedEncryptedPolicy = await this.getEncryptedInheritancePolicy(policy);

    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/finalizeIKSetup`, {
        HEXA_ID,
        id,
        configuration: encryptedConfiguration,
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
    existingConfiguration: InheritanceConfiguration,
    newConfiguration: InheritanceConfiguration
  ): Promise<{
    updated: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      const encryptedNewConfiguration = await this.getEncryptedInheritanceConfiguration(
        newConfiguration
      );
      const existingThresholdDescriptors = InheritanceKeyServer.getThresholdDescriptors(
        existingConfiguration,
        id
      );

      res = await RestClient.post(`${SIGNING_SERVER}v3/updateInheritanceConfig`, {
        HEXA_ID,
        id,
        existingThresholdDescriptors,
        newConfiguration: encryptedNewConfiguration,
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
   * @param {InheritanceConfiguration} inheritanceConfiguration
   * @returns {Promise<boolean>} updated
   */
  static updateInheritancePolicy = async (
    id: string,
    updatedPolicy: InheritancePolicy,
    inheritanceConfiguration: InheritanceConfiguration
  ): Promise<{
    updated: boolean;
  }> => {
    let res: AxiosResponse;
    const updatedEncryptedPolicy = await this.getEncryptedInheritancePolicy(updatedPolicy);

    const thresholdDescriptors = InheritanceKeyServer.getThresholdDescriptors(
      inheritanceConfiguration,
      id
    );
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
    }>
    // thresholdDescriptors: string[]
  ): Promise<{
    signedPSBT: string;
  }> => {
    let res: AxiosResponse;

    // const thresholdDescriptors = InheritanceKeyServer.getThresholdDescriptors(
    //   inheritanceConfiguration,
    //   id
    // );

    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/signTransactionViaInheritanceKey`, {
        HEXA_ID,
        id,
        serializedPSBT,
        childIndexArray,
        // thresholdDescriptors,
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
      configurations: InheritanceConfiguration[];
      policy: InheritancePolicy;
    };
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/requestInheritanceKey`, {
        HEXA_ID,
        requestId,
        cosignersId,
        thresholdDescriptors, // don't need to construct using InheritanceKeyServer.getThresholdDescriptors, as there's nothing to omit(IKS is being requested, its descriptor isn't known)
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
    };
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/findIKSSetup`, {
        HEXA_ID,
        ids,
        thresholdDescriptors, // don't need to construct using InheritanceKeyServer.getThresholdDescriptors, as we don't know which id to omit(of all the ids) during findIKSSetup
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
