import { AxiosResponse } from 'axios';
import config from '../../config';
import RestClient from '../rest/RestClient';
const { HEXA_ID, SIGNING_SERVER } = config;

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
      res = await RestClient.post(`${SIGNING_SERVER}setup2FA`, {
        HEXA_ID,
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
      res = await RestClient.post(`${SIGNING_SERVER}validate2FASetup`, {
        HEXA_ID,
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
}
