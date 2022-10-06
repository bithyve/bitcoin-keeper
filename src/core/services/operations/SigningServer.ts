import { AxiosResponse } from 'axios';
import config from '../../config';
import { SignerPolicy, SingerVerification } from '../interfaces';
import RestClient from '../rest/RestClient';
const { HEXA_ID, SIGNING_SERVER } = config;

export default class SigningServer {
  static register = async (
    appId: string,
    policy: SignerPolicy
  ): Promise<{
    setupData: {
      verification: SingerVerification;
      bhXpub: string;
    };
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/setupSigner`, {
        HEXA_ID,
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
    appId: string,
    verificationToken
  ): Promise<{
    valid: Boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/validateSingerSetup`, {
        HEXA_ID,
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

  static signPSBT = async (
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
    }>
  ): Promise<{
    signedPSBT: string;
  }> => {
    let res: AxiosResponse;

    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/signTransaction`, {
        HEXA_ID: config.HEXA_ID,
        appId,
        verificationToken,
        serializedPSBT,
        childIndexArray,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const signedPSBT = res.data.signedPSBT;
    return {
      signedPSBT,
    };
  };
}
