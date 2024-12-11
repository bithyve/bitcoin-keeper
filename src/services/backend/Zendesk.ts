import { Platform } from 'react-native';
import { zendeskApi, zendeskEndpoints } from '../rest/ZendeskClient';
import RNFS from 'react-native-fs';
import { conciergeUser } from 'src/store/reducers/concierge';

export type createZendeskTicketProps = {
  desc: string;
  imageToken?: string;
  conciergeUser: conciergeUser;
};

export default class Zendesk {
  public static fetchZendeskTickets = async (conciergeUserId: string): Promise<any> => {
    try {
      const res = await zendeskApi.get(zendeskEndpoints.getTickets, {
        params: {
          external_id: conciergeUserId,
          include: 'comment_count',
          sort_by: 'created_at',
          sort_order: 'desc',
        },
      });
      return { data: res.data, status: res.status };
    } catch (error) {
      console.log('🚀 ~ getTickets ~ error:', error);
      throw new Error('Something went wrong');
    }
  };

  public static fetchZendeskUser = async (userExternalId: string): Promise<any> => {
    try {
      const res = await zendeskApi.get(zendeskEndpoints.getUsers, {
        params: {
          external_id: userExternalId,
        },
      });
      return { data: res.data, status: res.status };
    } catch (error) {
      console.log('🚀 ~fetchZendeskUser ~ error:', error);
      throw new Error('Something went wrong');
    }
  };

  public static createZendeskUser = async (userExternalId: string): Promise<any> => {
    try {
      const body = {
        user: {
          name: `${Platform.OS} User ${userExternalId}`,
          email: null,
          role: 'end-user',
          external_id: userExternalId,
        },
      };
      const res = await zendeskApi.post(zendeskEndpoints.createUser, body);
      return { data: res.data, status: res.status };
    } catch (error) {
      console.log('🚀 ~ Zendesk ~ createZendeskUser= ~ error:', error);
      throw new Error('Something went wrong');
    }
  };

  public static loadTicketComments = async (ticketId: string): Promise<any> => {
    try {
      const res = await zendeskApi.get(`/tickets/${ticketId}/comments`);
      return { data: res.data, status: res.status };
    } catch (error) {
      console.log('🚀loadTicketComments ~ error:', error);
      throw new Error('Something went wrong');
    }
  };

  public static uploadMedia = async (uri: string): Promise<any> => {
    try {
      const fileName = uri.split('/').pop();
      const file = await RNFS.readFile(uri.replace('file:', ''), 'base64');
      const fileData = Buffer.from(file, 'base64');
      const headers = {
        'Content-Type': 'image/png',
      };
      const res = await zendeskApi.post(
        `${zendeskEndpoints.uploadFile}?filename=${fileName}`,
        fileData,
        { headers }
      );
      return { data: res.data, status: res.status };
    } catch (error) {
      console.log('🚀 uploadMedia ~ error:', error);
      throw new Error('Something went wrong');
    }
  };

  public static createZendeskTicket = async ({
    desc,
    imageToken,
    conciergeUser,
  }: createZendeskTicketProps): Promise<any> => {
    try {
      const body = {
        ticket: {
          comment: {
            body: desc,
            uploads: [imageToken],
          },
          priority: 'normal',
          subject: `Conversation with ${conciergeUser.name}`,
          external_id: conciergeUser.id,
          submitter_id: conciergeUser.id,
        },
      };
      const res = await zendeskApi.post(zendeskEndpoints.createTicket, body);
      return { data: res.data, status: res.status };
    } catch (error) {
      console.log('🚀 ~ Zendesk ~ createZendeskUser= ~ error:', error);
      throw new Error('Something went wrong');
    }
  };
}