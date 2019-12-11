import {expect} from 'chai';
import 'mocha';
import {core} from '../';
import * as request from 'supertest';
import {newGatewaySdkMock} from '../mediarithmics/api/sdk/GatewaySdkMock';
import {IRecommenderSdk} from '../mediarithmics/api/sdk/GatewaySdk';

describe('Fetch recommender API', () => {
  class MyFakeRecommenderPlugin extends core.RecommenderPlugin {
    protected onRecommendationRequest(
      request: core.RecommenderRequest,
      instanceContext: core.RecommenderBaseInstanceContext
    ) {
      const proposal: core.ItemProposal = {
        $type: 'ITEM_PROPOSAL',
        $id: '42'
      };

      const response: core.RecommenderPluginResponse = {
        ts: Date.now(),
        proposals: [proposal],
        recommendation_log: 'yolo'
      };

      return Promise.resolve(response);
    }
  }

  const gatewaySdk = newGatewaySdkMock<IRecommenderSdk>({
    fetchRecommenderCatalogs: Promise.resolve({} as any),
    fetchRecommenderProperties: Promise.resolve({} as any),
  });
  const plugin = new MyFakeRecommenderPlugin({gatewaySdk: gatewaySdk});

  it('Check that recommenderId is passed correctly in fetchRecommenderProperties', async function () {
    const fakeRecommenderId = '42000000';
    await plugin.gatewaySdk.fetchRecommenderProperties(fakeRecommenderId);
    expect(gatewaySdk.calledMethods.fetchRecommenderProperties.getArgs(0)?.[0] === fakeRecommenderId);
  });

  it('Check that RecommenderId is passed correctly in fetchRecommenderCatalogs', async function () {
    const fakeRecommenderId = '4255';
    await plugin.gatewaySdk.fetchRecommenderCatalogs(fakeRecommenderId);
    expect(gatewaySdk.calledMethods.fetchRecommenderCatalogs.getArgs(0)?.[0] === fakeRecommenderId);
  });
});

describe('Recommender API test', function () {
  class MyFakeSimpleRecommenderPlugin extends core.RecommenderPlugin {
    protected onRecommendationRequest(
      request: core.RecommenderRequest,
      instanceContext: core.RecommenderBaseInstanceContext
    ) {
      const response: core.RecommenderPluginResponse = {
        ts: Date.now(),
        recommendation_log: '',
        proposals: []
      };
      return Promise.resolve(response);
    }
  }

  const gatewaySdk = newGatewaySdkMock<IRecommenderSdk>({
    fetchRecommenderCatalogs: Promise.resolve({}) as any,
    fetchRecommenderProperties: Promise.resolve([
      {
        technical_name: 'hello_world',
        value: {value: 'Yay'},
        property_type: 'STRING',
        origin: 'PLUGIN',
        writable: true,
        deletable: false
      }
    ]),
  });
  const plugin = new MyFakeSimpleRecommenderPlugin({gatewaySdk: gatewaySdk});

  it('Check that the plugin is giving good results with a simple onRecommendationRequest handler', function (done) {
    request(plugin.app)
      .post('/v1/init')
      .send({authentication_token: 'Manny', worker_id: 'Calavera'})
      .end((err, res) => {
        expect(res.status).to.equal(200);
      });

    const requestBody = {
      recommender_id: '5',
      datamart_id: '1089',
      user_identifiers: [],
      input_data: {
        user_agent_id: 'vec:971677694'
      }
    };

    request(plugin.app)
      .post('/v1/recommendations')
      .send(requestBody)
      .end(function (err, res) {
        expect(res.status).to.equal(200);
        done();
      });
  });

  afterEach(() => {
    // We clear the cache so that we don't have any processing still running in the background
    plugin.pluginCache.clear();
  });
});
