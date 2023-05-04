import { AxiosResponse } from 'axios';
import config from '../../config';
import { InheritancePolicy } from '../interfaces';
import RestClient from '../rest/RestClient';

const { HEXA_ID, SIGNING_SERVER } = config;

export default class InheritanceKeyServer {
  /**
   * @param  {string} vaultId
   * @param  {InheritancePolicy} policy
   * @returns Promise
   */
  static setupIK = async (
    vaultId: string,
    policy: InheritancePolicy
  ): Promise<{
    setupData: {
      policy: InheritancePolicy;
      inheritanceXpub: string;
      masterFingerprint: string;
      derivationPath: string;
    };
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/setupInheritanceKey`, {
        HEXA_ID,
        vaultId,
        policy,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { setupSuccessful, setupData } = res.data;
    if (!setupSuccessful) throw new Error('Inheritance Key setup failed');
    return {
      setupData,
    };
  };

  /**
   * @param  {string} vaultId
   * @param  {InheritancePolicy} policy
   * @returns {Promise<boolean>} updated
   */
  static updatePolicy = async (
    vaultId: string,
    policy: InheritancePolicy
  ): Promise<{
    updated: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/updateInheritancePolicy`, {
        HEXA_ID,
        vaultId,
        policy,
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
    vaultId: string,
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
      res = await RestClient.post(`${SIGNING_SERVER}v2/signTransactionViaInheritanceKey`, {
        HEXA_ID,
        vaultId,
        serializedPSBT,
        childIndexArray,
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

  static fetchInheritanceKey = async (
    vaultId: string
  ): Promise<{
    policy: InheritancePolicy;
    inheritanceXpub: string;
    masterFingerprint: string;
    derivationPath: string;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RestClient.post(`${SIGNING_SERVER}v2/fetchInheritanceKey`, {
        HEXA_ID,
        vaultId,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { inheritanceXpub, masterFingerprint, derivationPath, policy } = res.data;
    return {
      policy,
      inheritanceXpub,
      masterFingerprint,
      derivationPath,
    };
  };
}
