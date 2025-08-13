import axios from 'axios';
import config from 'src/utils/service-utilities/config';

export const swapApi = axios.create({
  baseURL: config.LETS_EXCHANGE_BASE_URL,
});

swapApi.interceptors.request.use(
  (req) => {
    req.headers.Authorization = `Bearer ${config.LETS_EXCHANGE_API_KEY}`;
    if (req.method === 'post') {
      req.data = {
        ...req.data,
        affiliate_id: config.LETS_EXCHANGE_AFFILIATE_ID,
      };
    }

    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const swapEndpoints = {
  coins: 'v1/coins',
  coinsInfo: 'v1/info/bulk',
  quote: '/v1/info',
  tnx: 'v1/transaction',
};
