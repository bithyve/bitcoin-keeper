import { AxiosResponse } from 'axios';
import config from '../../config';
import {
  SignerException,
  SignerPolicy,
  SignerRestriction,
  SingerVerification,
} from '../interfaces';
import RestClient from '../rest/RestClient';

const { HEXA_ID, SIGNING_SERVER } = config;

export default class SigningServer {
  /**
   * @param  {string} vaultId: for versions > 1.0.1, signer is registered against vaultId
   * @param  {string} appId: for versions <= 1.0.1, signer is registered against appId
   * @param  {SignerPolicy} policy
   * @returns Promise
   */
  static register = async (
    vaultId: string,
    appId: string,
    policy: SignerPolicy
  ): Promise<{
    setupData: {
      verification: SingerVerification;
      bhXpub: string;
      derivationPath: string;
      masterFingerprint: string;
    };
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/setupSigner`, {
        HEXA_ID,
        vaultId,
        appId,
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
    vaultId: string,
    appId: string,
    verificationToken
  ): Promise<{
    valid: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/validateSingerSetup`, {
        HEXA_ID,
        vaultId,
        appId,
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
    vaultId: string,
    appId: string,
    verificationToken
  ): Promise<{
    valid: boolean;
    xpub: string;
    masterFingerprint: string;
    derivationPath: string;
    policy: SignerPolicy;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/fetchSignerSetup`, {
        HEXA_ID,
        vaultId,
        appId,
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
      xpub,
      masterFingerprint,
      derivationPath,
      policy,
    };
  };

  static updatePolicy = async (
    vaultId: string,
    appId: string,
    updates: {
      restrictions?: SignerRestriction;
      exceptions?: SignerException;
    }
  ): Promise<{
    updated: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/updateSignerPolicy`, {
        HEXA_ID,
        vaultId,
        appId,
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
    vaultId: string,
    appId: string,
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
      res = await RestClient.post(`${SIGNING_SERVER}v2/signTransaction`, {
        HEXA_ID,
        vaultId,
        appId,
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
}
