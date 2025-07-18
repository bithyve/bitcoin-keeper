import { zendeskApi, zendeskEndpoints } from '../rest/ZendeskClient';
import { conciergeUser } from 'src/store/reducers/concierge';
import config, { APP_STAGE } from 'src/utils/service-utilities/config';

export type createZendeskTicketProps = {
  desc?: string;
  imageToken?: string;
  conciergeUser?: conciergeUser;
  onboardEmail?: string;
};

const isDev = config.ENVIRONMENT === APP_STAGE.DEVELOPMENT;
const zendeskSupport = 16685599304861;

export default class Zendesk {
  public static createZendeskTicket = async ({
    desc,
    imageToken,
    conciergeUser,
    onboardEmail,
  }: createZendeskTicketProps): Promise<any> => {
    let body;
    try {
      if (onboardEmail) {
        body = {
          ticket: {
            comment: {
              body: `User Onboarded\nEmail:${onboardEmail}`,
            },
            subject: `${isDev ? 'DEV ' : ''}Onboarding Call - ${onboardEmail}`,
            requester: {
              email: onboardEmail,
              name: onboardEmail,
            },
            custom_fields: [
              {
                id: 24479112842269,
                value: onboardEmail,
              },
            ],
          },
        };
      } else {
        body = {
          ticket: {
            comment: {
              body: desc,
              uploads: imageToken,
            },
            subject: `${isDev ? 'DEV ' : ''}Conversation with ${conciergeUser.name}`,
            external_id: conciergeUser.id,
            submitter_id: conciergeUser.id,
          },
        };
      }

      body.ticket.priority = `${isDev ? 'normal' : 'urgent'}`;
      body.ticket.assignee_id = `${isDev ? null : zendeskSupport}`;
      body.ticket.custom_fields = [
        ...(body?.ticket?.custom_fields ?? []),
        { id: 24752059256477, value: config.ENVIRONMENT },
      ];
      body.ticket.email_ccs = isDev ? [] : [{ user_id: zendeskSupport, action: 'put' }];
      const res = await zendeskApi.post(zendeskEndpoints.createTicket, body);
      return { data: res.data, status: res.status };
    } catch (error) {
      console.log('🚀 error ~ createZendeskTicket: ', error);
      throw new Error('Something went wrong');
    }
  };
}
