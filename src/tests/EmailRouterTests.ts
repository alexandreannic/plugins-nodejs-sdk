import {expect} from 'chai';
import 'mocha';
import {core} from '../';
import {newGatewaySdkMock} from '../mediarithmics/api/sdk/GatewaySdkMock';
import {IEmailRouterSdk} from '../mediarithmics/api/sdk/GatewaySdk';
import {EmailRouterApiTester} from '../helper';

class MyFakeEmailRouterPlugin extends core.EmailRouterPlugin {
  protected onEmailRouting(
    request: core.EmailRoutingRequest,
    instanceContext: core.EmailRouterBaseInstanceContext
  ) {
    const response: core.EmailRoutingPluginResponse = {
      result: true
    };

    return Promise.resolve(response);
  }

  protected onEmailCheck(
    request: core.CheckEmailsRequest,
    instanceContext: core.EmailRouterBaseInstanceContext
  ): Promise<core.CheckEmailsPluginResponse> {
    const response: core.CheckEmailsPluginResponse = {
      result: true
    };

    return Promise.resolve(response);
  }
}


describe('Fetch Email Router API', () => {

  const gatewayMock = newGatewaySdkMock<IEmailRouterSdk>({
    fetchEmailRouterProperties: Promise.resolve({} as any),
    sendEmail: Promise.resolve({} as any),
  });
  const plugin = new MyFakeEmailRouterPlugin({gatewaySdk: gatewayMock});

  it('Check that email_router_id is passed correctly in fetchEmailRouterProperties', async function () {
    const fakeId = '42000000';
    await plugin.gatewaySdk.fetchEmailRouterProperties(fakeId);
    expect(gatewayMock.calledMethods.fetchEmailRouterProperties.getArgs(0)?.[0] === fakeId);
  });
});

describe('Email Router API test', function () {

  const gatewayMock = newGatewaySdkMock<IEmailRouterSdk>({
    fetchEmailRouterProperties: Promise.resolve([
      {
        technical_name: 'hello_world',
        value: {value: 'Yay'},
        property_type: 'STRING',
        origin: 'PLUGIN',
        writable: true,
        deletable: false
      }
    ]),
    sendEmail: Promise.resolve({} as any),
  });
  const plugin = new MyFakeEmailRouterPlugin({gatewaySdk: gatewayMock});

  it('Check that the plugin is giving good results with a simple onEmailRouting handler', async function () {
    const tester = new EmailRouterApiTester(plugin);
    await tester.init();

    const requestBody = JSON.parse(`{
      "email_router_id": "2",
      "call_id": "ba568918-2f06-4f16-bd0e-f50e04b92d34",
      "context": "LIVE",
      "creative_id": "7197",
      "campaign_id": "1896",
      "blast_id": "1993",
      "datamart_id": "1090",
      "user_identifiers": [
        {
          "type": "USER_POINT",
          "user_point_id": "26340584-f777-404c-82c5-56220667464b"
        },
        {
          "type": "USER_ACCOUNT",
          "user_account_id": "914eb2aa50cef7f3a8705b6bb54e50bb",
          "creation_ts": null
        },
        {
          "type": "USER_EMAIL",
          "hash": "e2749f6f4d8104ec385a75490b587c86",
          "email": null,
          "operator": null,
          "creation_ts": 1493118667529,
          "last_activity_ts": 1493127642622,
          "providers": []
        },
        {
          "type": "USER_AGENT",
          "vector_id": "vec:886742516",
          "device": {
            "form_factor": "PERSONAL_COMPUTER",
            "os_family": "MAC_OS",
            "browser_family": "CHROME",
            "brand": null,
            "model": null,
            "os_version": null,
            "carrier": null
          },
          "creation_ts": 1493118667529,
          "last_activity_ts": 1493126966889,
          "providers": [],
          "mappings": []
        }
      ],
      "meta": {
        "from_email": "news@info.velvetconsulting.paris",
        "from_name": "Velvet Consulting",
        "to_email": null,
        "to_name": null,
        "reply_to": "no-reply@vlvt1.com",
        "subject_line": "Engagez-vous assez vos shoppers avec votre marque ?"
      },
      "content": {
        "html": "<html><head></head><body><h1>Hello World!</h1></body></html>",
        "text": "Hello World!"
      },
      "data": {}
    }`);

    const resCheck = await tester.postEmailCheck(requestBody);
    expect(resCheck.parsedText.result).to.be.true;
    const resRouting = await tester.postEmailRouting(requestBody);
    expect(resRouting.parsedText.result).to.be.true;
  });

  afterEach(() => {
    // We clear the cache so that we don't have any processing still running in the background
    plugin.pluginCache.clear();
  });
});
