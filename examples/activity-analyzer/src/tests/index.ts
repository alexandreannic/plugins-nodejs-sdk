import 'mocha';
import {core} from '@mediarithmics/plugins-nodejs-sdk';
import {MyActivityAnalyzerPlugin} from '../MyPluginImpl';
import {IActivityAnalyzerSdk, newGatewaySdkMock, PluginProperty} from '@mediarithmics/plugins-nodejs-sdk/lib/mediarithmics';
import * as request from 'supertest';
import {expect} from 'chai';

describe('Test Example Activity Analyzer', function () {
  it('Check behavior of dummy activity analyzer', function (done) {
    const activityAnalyzerProperties: PluginProperty[] = [
      {
        technical_name: 'analyzer_rules',
        value: {
          uri:
            'mics://data_file/tenants/10001/plugins_conf/activity_analyzer.conf',
          last_modified: 123456
        },
        property_type: 'DATA_FILE',
        origin: 'PLUGIN',
        writable: true,
        deletable: true
      }
    ];

    const activityAnalyzer: core.ActivityAnalyzer = {
      id: '1000',
      name: 'my analyzer',
      organisation_id: '1000',
      visit_analyzer_plugin_id: 1001,
      group_id: 'com.mediarithmics.visit-analyzer',
      artifact_id: 'default'
    };

    const gatewayMock = newGatewaySdkMock<IActivityAnalyzerSdk>({
      fetchActivityAnalyzer: Promise.resolve(activityAnalyzer),
      fetchActivityAnalyzerProperties: Promise.resolve(activityAnalyzerProperties),
    });

    const plugin = new MyActivityAnalyzerPlugin({gatewaySdk: gatewayMock});

    const input = require(`${process.cwd()}/src/tests/activity_input`);
    const output = require(`${process.cwd()}/src/tests/activity_output`);

    request(plugin.app)
      .post('/v1/init')
      .send({authentication_token: 'Manny', worker_id: 'Calavera'})
      .end((err, res) => {
        expect(res.status).to.equal(200);

        request(plugin.app)
          .put('/v1/log_level')
          .send({level: 'info'})
          .end((err, res) => {
            expect(res.status).to.equal(200);

            request(plugin.app)
              .post('/v1/activity_analysis')
              .send(input)
              .end((err, res) => {
                expect(res.status).to.eq(200);
                expect(JSON.parse(res.text)).to.be.deep.equal(output);
                done();
                plugin.pluginCache.clear();
              });
          });
      });
  });
});
