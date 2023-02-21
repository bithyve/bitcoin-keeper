import { AxiosResponse } from 'axios';
import config from '../../config';
import {
  SignerException,
  SignerPolicy,
  SignerRestriction,
  SingerVerification,
} from '../interfaces';
import RestClient from '../rest/RestClient';

const { SIGNING_SERVER } = config;

export default class SigningServer {
  static register = async (
    vaultId: string,
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
        vaultId,
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
    verificationToken
  ): Promise<{
    valid: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/validateSingerSetup`, {
        vaultId,
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
        vaultId,
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
        vaultId,
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
        vaultId,
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
