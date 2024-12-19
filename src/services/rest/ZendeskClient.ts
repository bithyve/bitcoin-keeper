import axios from 'axios';
import config from 'src/utils/service-utilities/config';

const credentials = Buffer.from(`${config.ZENDESK_USERNAME}:${config.ZENDESK_PASSWORD}`).toString(
  'base64'
);

export const zendeskApi = axios.create({
  baseURL: config.ZENDESK_BASE_URL,
});

zendeskApi.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `Basic ${credentials}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const zendeskEndpoints = {
  // POST
  createUser: '/users',
  createTicket: '/tickets',
  uploadFile: '/uploads.json',
  //   GET
  getTickets: '/tickets', // external_id=test001&include=comment_count
  getComments: '/tickets', // /:ticket_id/comments
  getUsers: '/users',
  //   PUT
  updateTicket: '/tickets', // /:ticket_id
};
