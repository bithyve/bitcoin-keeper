import { AxiosResponse } from 'axios';
import RestClient from '../rest/RestClient';
import { config } from '../../config';

export default class SigningServer {
  static register = async (
    walletID: string
  ): Promise<{
    setupData: {
      secret: string;
      bhXpub: string;
    };
  }> => {
    let res: AxiosResponse;
    try {
      await RestClient.post(`${config().SIGNING_SERVER}setup2FA`, {
        HEXA_ID: config().HEXA_ID,
        walletID,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { setupSuccessful, setupData } = res.data;
    if (!setupSuccessful) throw new Error('2FA setup failed');
    return {
      setupData,
    };
  };

  static validate = async (
    walletID: string,
    token: number
  ): Promise<{
    valid: Boolean;
  }> => {
    let res: AxiosResponse;
    try {
      await RestClient.post(`${config().SIGNING_SERVER}validate2FASetup`, {
        HEXA_ID: config().HEXA_ID,
        walletID,
        token,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { valid } = res.data;
    if (!valid) throw new Error('2FA validation failed');

    return {
      valid,
    };
  };

  static signPSBT = async (
    walletId: string,
    token: number,
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
      await RestClient.post(`${config().SIGNING_SERVER}securePSBTTransaction`, {
        HEXA_ID: config().HEXA_ID,
        walletID: walletId,
        token,
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
