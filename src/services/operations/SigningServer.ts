import { AxiosResponse } from 'axios';
import config from 'src/core/config';
import {
  CosignersMapUpdate,
  SignerException,
  SignerPolicy,
  SignerRestriction,
  SingerVerification,
} from '../interfaces';
import RestClient from '../rest/RestClient';

const { HEXA_ID, SIGNING_SERVER } = config;

export default class SigningServer {
  /**
   * @param  {SignerPolicy} policy
   * @returns Promise
   */
  static register = async (
    policy: SignerPolicy,
    cosignersMapUpdates?: CosignersMapUpdate
  ): Promise<{
    setupData: {
      id: string;
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
        cosignersMapUpdates,
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
    verificationToken
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
    verificationToken
  ): Promise<{
    valid: boolean;
    id?: string;
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

    const { xpub, masterFingerprint, derivationPath, policy } = res.data;

    return {
      valid,
      id,
      xpub,
      masterFingerprint,
      derivationPath,
      policy,
    };
  };

  static updatePolicy = async (
    id: string,
    verificationToken,
    updates: {
      restrictions?: SignerRestriction;
      exceptions?: SignerException;
    }
  ): Promise<{
    updated: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/updateSignerPolicy`, {
        HEXA_ID,
        id,
        verificationToken,
        updates,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { updated } = res.data;
    if (!updated) throw new Error('Signer setup failed');
    return {
      updated,
    };
  };

  static signPSBT = async (
    id: string,
    verificationToken: number,
    serializedPSBT: string,
    childIndexArray: Array<{
      subPath: number[];
      inputIdentifier: {
        txId: string;
        vout: number;
        value: number;
      };
    }>,
    outgoing: number
  ): Promise<{
    signedPSBT: string;
  }> => {
    let res: AxiosResponse;

    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/signTransaction`, {
        HEXA_ID,
        id,
        verificationToken,
        serializedPSBT,
        childIndexArray,
        outgoing,
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

  static checkSignerHealth = async (
    id: string
  ): Promise<{
    isSignerAvailable: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v3/checkSignerHealth`, {
        HEXA_ID,
        id,
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
}
