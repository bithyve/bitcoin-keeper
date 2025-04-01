import { AxiosResponse } from 'axios';
import config from 'src/utils/service-utilities/config';
import { asymmetricDecrypt, generateRSAKeypair } from 'src/utils/service-utilities/encryption';
import {
  DelayedPolicyUpdate,
  DelayedTransaction,
  SignerException,
  SignerPolicy,
  SignerRestriction,
  SingerVerification,
} from '../../models/interfaces/AssistedKeys';
import RestClient from '../rest/RestClient';

const { HEXA_ID, SIGNING_SERVER } = config;

export default class SigningServer {
  /**
   * @param  {SignerPolicy} policy
   * @returns Promise
   */
  static register = async (
    policy: SignerPolicy
  ): Promise<{
    setupData: {
      id: string;
      isBIP85: boolean;
      bhXpub: any;
      masterFingerprint: any;
      derivationPath: string;
      verification: SingerVerification;
    };
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/setupSigner`, {
        HEXA_ID,
        policy,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { setupSuccessful, setupData } = res.data;
    if (!setupSuccessful) throw new Error('Signer setup failed');
    return {
      setupData,
    };
  };

  static validate = async (
    id: string,
    verificationToken: number
  ): Promise<{
    valid: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/validateSingerSetup`, {
        HEXA_ID,
        id,
        verificationToken,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { valid } = res.data;
    if (!valid) throw new Error('Signer validation failed');

    return {
      valid,
    };
  };

  static fetchSignerSetup = async (
    id: string,
    verificationToken: number
  ): Promise<{
    valid: boolean;
    id?: string;
    isBIP85?: boolean;
    xpub?: string;
    masterFingerprint?: string;
    derivationPath?: string;
    policy?: SignerPolicy;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/fetchSignerSetup`, {
        HEXA_ID,
        id,
        verificationToken,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { valid } = res.data;
    if (!valid) throw new Error('Signer validation failed');

    const { isBIP85, xpub, masterFingerprint, derivationPath, policy } = res.data;

    return {
      valid,
      id,
      isBIP85,
      xpub,
      masterFingerprint,
      derivationPath,
      policy,
    };
  };

  static updateBackupSetting = async (
    id: string,
    verifierDigest: string,
    disable: boolean
  ): Promise<{
    updated: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/updateBackupSetting`, {
        HEXA_ID,
        id,
        verifierDigest,
        disable,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { updated } = res.data;
    return { updated };
  };

  static fetchBackup = async (
    id: string,
    verificationToken: number
  ): Promise<{
    mnemonic: string;
    derivationPath: string;
  }> => {
    let res: AxiosResponse;
    const { privateKey, publicKey } = await generateRSAKeypair();

    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/fetchBackup`, {
        HEXA_ID,
        id,
        verificationToken,
        publicKey,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { encryptedBackup } = res.data;
    const decryptedData = asymmetricDecrypt(encryptedBackup, privateKey);
    const { mnemonic, derivationPath } = JSON.parse(decryptedData);

    return { mnemonic, derivationPath };
  };

  static updatePolicy = async (
    id: string,
    verificationToken: number,
    updates: {
      restrictions: SignerRestriction;
      exceptions: SignerException;
      signingDelay: number;
    },
    FCM?: string
  ): Promise<{
    updated: boolean;
    delayedPolicyUpdate: DelayedPolicyUpdate;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/updateSignerPolicy`, {
        HEXA_ID,
        id,
        verificationToken,
        updates,
        FCM,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { updated, delayedPolicyUpdate } = res.data;

    return {
      updated,
      delayedPolicyUpdate,
    };
  };

  static signPSBT = async (
    id: string,
    serializedPSBT: string,
    verificationToken: number,
    change: { address: string; index: number },
    descriptor: string,
    FCM?: string
  ): Promise<{
    signedPSBT: string;
    delayed: boolean;
    delayedTransaction: DelayedTransaction;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/signTransaction`, {
        HEXA_ID,
        id,
        serializedPSBT,
        verificationToken,
        change,
        descriptor,
        FCM,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { signedPSBT, delayed, delayedTransaction } = res.data;
    return {
      signedPSBT,
      delayed,
      delayedTransaction,
    };
  };

  static fetchSignedDelayedTransaction = async (
    txid: string,
    verificationToken: string
  ): Promise<{
    delayedTransaction: DelayedTransaction;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/fetchSignedDelayedTransaction`, {
        HEXA_ID,
        txid,
        verificationToken,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { delayedTransaction } = res.data;

    return {
      delayedTransaction,
    };
  };

  static cancelDelayedTransaction = async (
    signerId: string,
    txid: string,
    verificationToken: string
  ): Promise<{
    canceled: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/cancelDelayedTransaction`, {
        HEXA_ID,
        signerId,
        txid,
        verificationToken,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { canceled } = res.data;

    return {
      canceled,
    };
  };

  static fetchDelayedPolicyUpdate = async (
    policyId: string,
    verificationToken: string
  ): Promise<{
    delayedPolicy: DelayedPolicyUpdate;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/fetchDelayedPolicyUpdate`, {
        HEXA_ID,
        policyId,
        verificationToken,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { delayedPolicy } = res.data;

    return {
      delayedPolicy,
    };
  };

  static checkSignerHealth = async (
    id: string,
    verificationToken: number
  ): Promise<{
    isSignerAvailable: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/checkSignerHealth`, {
        HEXA_ID,
        id,
        verificationToken,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { isSignerAvailable } = res.data;
    return {
      isSignerAvailable,
    };
  };

  static migrateSignerPolicy = async (
    id: string,
    oldPolicy: SignerPolicy
  ): Promise<{
    newPolicy: SignerPolicy;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/migrateSignerPolicy`, {
        HEXA_ID,
        id,
        oldPolicy,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { newPolicy } = res.data;
    return { newPolicy };
  };
}
