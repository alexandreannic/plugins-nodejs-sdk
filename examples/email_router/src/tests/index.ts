import {expect} from 'chai';
import 'mocha';
import {PluginApiTester} from '@mediarithmics/plugins-nodejs-sdk/lib/helper';
import {
  EmailRoutingPluginResponse,
  EmailRoutingRequest,
  IEmailRouterSdk,
  newGatewaySdkMock,
  PluginProperty,
  UserAccountIdentifierInfo,
  UserAgentIdentifierInfo,
  UserEmailIdentifierInfo,
  UserPointIdentifierInfo
} from '@mediarithmics/plugins-nodejs-sdk/lib/mediarithmics';
import {MailjetSentResponse, MySimpleEmailRouter} from '../MyPluginImpl';

const emailRouterProperties: PluginProperty[] = [
  {
    technical_name: 'authentication_token',
    value: {
      value: 'asd'
    },
    property_type: 'STRING',
    origin: 'PLUGIN',
    writable: true,
    deletable: false
  }
];

const mjResponse: MailjetSentResponse = {
  Sent: [
    {
      Email: 'caroline_maier@bd.com',
      MessageID: 16888659454515816
    }
  ]
};

describe('Test Example Email Router', function () {

  it('Check behavior of dummy Email Router', async function () {

    const gatewayMock = newGatewaySdkMock<IEmailRouterSdk>({
      sendEmail: Promise.resolve(mjResponse),
      fetchEmailRouterProperties: Promise.resolve(emailRouterProperties),
    });

    const plugin = new MySimpleEmailRouter({gatewaySdk: gatewayMock});
    const emailRoutingRequest: EmailRoutingRequest = {
      email_router_id: '2',
      call_id: 'ba568918-2f06-4f16-bd0e-f50e04b92d34',
      context: 'LIVE',
      creative_id: '7197',
      campaign_id: '1896',
      blast_id: '1993',
      datamart_id: '1090',
      user_identifiers: [
        {
          type: 'USER_POINT',
          user_point_id: '26340584-f777-404c-82c5-56220667464b'
        } as UserPointIdentifierInfo,
        {
          type: 'USER_ACCOUNT',
          user_account_id: '914eb2aa50cef7f3a8705b6bb54e50bb',
          creation_ts: 123456
        } as UserAccountIdentifierInfo,
        {
          type: 'USER_EMAIL',
          hash: 'e2749f6f4d8104ec385a75490b587c86',
          email: 'wow@hello.com',
          operator: undefined,
          creation_ts: 1493118667529,
          last_activity_ts: 1493127642622,
          providers: []
        } as UserEmailIdentifierInfo,
        {
          type: 'USER_AGENT',
          vector_id: 'vec:886742516',
          device: {
            form_factor: 'PERSONAL_COMPUTER',
            os_family: 'MAC_OS',
            browser_family: 'CHROME',
            brand: null,
            model: null,
            os_version: null,
            carrier: null
          },
          creation_ts: 1493118667529,
          last_activity_ts: 1493126966889,
          providers: [],
          mappings: []
        } as UserAgentIdentifierInfo
      ],
      meta: {
        from_email: 'news@info.velvetconsulting.paris',
        from_name: 'Velvet Consulting',
        to_email: 'hello@yolo.com',
        to_name: 'Hello',
        reply_to: 'no-reply@vlvt1.com',
        subject_line: 'Engagez-vous assez vos shoppers avec votre marque ?'
      },
      content: {
        html: '<html><head></head><body><h1>Hello World!</h1></body></html>',
        text: 'Hello World!'
      },
      data: '{}'
    };

    const tester = new PluginApiTester(plugin);
    await tester.initPlugin('debug');
    const res = await tester.post('/v1/email_routing', emailRoutingRequest);
    expect(res.status).to.eq(200);
    expect((JSON.parse(res.text) as EmailRoutingPluginResponse).result).to.be.true;
  });

  it('Check the Email Routeur retry', async function () {

    this.timeout(50000);
    const gatewayMock = newGatewaySdkMock<IEmailRouterSdk>({
      sendEmail: [
        Promise.reject('Fake error'),
        Promise.resolve({Sent: []}),
        Promise.resolve(mjResponse),
      ],
      fetchEmailRouterProperties: Promise.resolve(emailRouterProperties),
    });
    const plugin = new MySimpleEmailRouter({gatewaySdk: gatewayMock});

    const emailRoutingRequest: EmailRoutingRequest = {
      email_router_id: '2',
      call_id: 'ba568918-2f06-4f16-bd0e-f50e04b92d34',
      context: 'LIVE',
      creative_id: '7197',
      campaign_id: '1896',
      blast_id: '1993',
      datamart_id: '1090',
      user_identifiers: [
        {
          type: 'USER_POINT',
          user_point_id: '26340584-f777-404c-82c5-56220667464b'
        } as UserPointIdentifierInfo,
        {
          type: 'USER_ACCOUNT',
          user_account_id: '914eb2aa50cef7f3a8705b6bb54e50bb',
          creation_ts: 123456
        } as UserAccountIdentifierInfo,
        {
          type: 'USER_EMAIL',
          hash: 'e2749f6f4d8104ec385a75490b587c86',
          email: 'wow@hello.com',
          operator: undefined,
          creation_ts: 1493118667529,
          last_activity_ts: 1493127642622,
          providers: []
        } as UserEmailIdentifierInfo,
        {
          type: 'USER_AGENT',
          vector_id: 'vec:886742516',
          device: {
            form_factor: 'PERSONAL_COMPUTER',
            os_family: 'MAC_OS',
            browser_family: 'CHROME',
            brand: null,
            model: null,
            os_version: null,
            carrier: null
          },
          creation_ts: 1493118667529,
          last_activity_ts: 1493126966889,
          providers: [],
          mappings: []
        } as UserAgentIdentifierInfo
      ],
      meta: {
        from_email: 'news@info.velvetconsulting.paris',
        from_name: 'Velvet Consulting',
        to_email: 'hello@yolo.com',
        to_name: 'Hello',
        reply_to: 'no-reply@vlvt1.com',
        subject_line: 'Engagez-vous assez vos shoppers avec votre marque ?'
      },
      content: {
        html: '<html><head></head><body><h1>Hello World!</h1></body></html>',
        text: 'Hello World!'
      },
      data: '{}'
    };

    const tester = new PluginApiTester(plugin);
    await tester.initPlugin('debug');
    const res = await tester.post('/v1/email_routing', emailRoutingRequest);
    expect(res.status).to.eq(200);
    expect((JSON.parse(res.text) as EmailRoutingPluginResponse).result).to.be.true;
  });
});
