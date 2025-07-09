import { swapApi, swapEndpoints } from '../rest/SwapClient';

export default class Swap {
  public static getCoins = async (): Promise<any> => {
    try {
      const res = await swapApi.get(swapEndpoints.coins);
      return { data: res.data, status: res.status };
    } catch (error) {
      console.log('🚀 ~ Swap ~ getCoins= ~ error:', error);
      throw new Error('Something went wrong');
    }
  };
  public static getCoinsInfo = async (coins: string[]): Promise<any> => {
    try {
      const res = await swapApi.post(swapEndpoints.coinsInfo, { coins });
      return { data: res.data, status: res.status };
    } catch (error) {
      console.log('🚀 ~ Swap ~ getCoinsInfo= ~ error:', error);
      throw new Error('Something went wrong');
    }
  };
  public static getQuote = async (body: any): Promise<any> => {
    try {
      const res = await swapApi.post(swapEndpoints.quote, body);
      return { data: res.data, status: res.status };
    } catch (error) {
      console.log('🚀 ~ Swap ~ getQuote= ~ error:', error);
      throw new Error('Something went wrong');
    }
  };
  public static createTnx = async (body: any): Promise<any> => {
    let res;
    try {
      body.withdrawal_extra_id = ''; // required field
      res = await swapApi.post(swapEndpoints.createTnx, body);
    } catch (err) {
      console.log('🚀 ~ Swap ~ createTnx= ~ err:', err);
      throw handleError(err);
    }
    return res.data || res.json;
  };
}

const handleError = (err: any) => {
  const errorStrings = {
    withdrawalField: 'The withdrawal field is required.',
    returnField: 'Invalid return address.',
  };

  let error = null;
  for (const key in err.response.data?.error?.validation) {
    if (!Object.prototype.hasOwnProperty.call(err.response.data?.error?.validation, key)) continue;
    const value = err.response.data?.error?.validation[key];
    if (value.length) {
      error = value[0];
      break;
    }
  }

  if (error == errorStrings.withdrawalField)
    return new Error('Please enter a valid receive address');

  if (error == errorStrings.returnField) return new Error('Please enter a valid refund address');

  throw new Error(error);
};
