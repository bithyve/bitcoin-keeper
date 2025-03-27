import * as Keychain from 'react-native-keychain';
import NodeRSA from 'node-rsa';
import config from '../utils/service-utilities/config';

export const store = async (hash: string, enc_key: string) => {
  try {
    await Keychain.setGenericPassword(
      config.ENC_KEY_STORAGE_IDENTIFIER,
      JSON.stringify({
        hash,
        enc_key,
      }),
      {
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      }
    );
    return true;
  } catch (error) {
    return false;
  }
};

export const fetch = async (hash_current: string) => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      const password = JSON.parse(credentials.password);
      if (hash_current === '') {
        return password.enc_key;
      }
      if (hash_current !== password.hash) {
        throw new Error('Incorrect Passcode');
      } else {
        return password.enc_key;
      }
    } else {
      throw new Error('Password not found');
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const hasPin = async () => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      const password = JSON.parse(credentials.password);
      if (password) {
        return true;
      }
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

export const remove = async (key) => {
  try {
    //
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
};

export const storeBiometricPubKey = async (pubKey: string) => {
  try {
    const credentials = await Keychain.getGenericPassword();
    const password = JSON.parse(credentials.password);
    const reset = await Keychain.resetGenericPassword();
    if (reset) {
      const pass = {
        ...password,
        pubKey,
      };
      await Keychain.setGenericPassword(config.ENC_KEY_STORAGE_IDENTIFIER, JSON.stringify(pass), {
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const verifyBiometricAuth = async (signature: string, payload: string) => {
  try {
    const keychain = await Keychain.getGenericPassword();
    if (!keychain) {
      throw Error('Failed to get keychain');
    }
    const credentials = JSON.parse(keychain.password);
    const publicKeyBuffer = Buffer.from(credentials.pubKey, 'base64');
    const key = new NodeRSA();
    const signer = key.importKey(publicKeyBuffer, 'public-der');
    const isVerified = signer.verify(Buffer.from(payload), signature, 'utf8', 'base64');
    if (isVerified) {
      return {
        success: true,
        encryptedKey: credentials.enc_key,
        hash: credentials.hash,
      };
    }
    return {
      success: false,
    };
  } catch (error) {
    return {
      success: false,
    };
  }
};
