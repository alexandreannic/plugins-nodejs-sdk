import {expect} from 'chai';
import 'mocha';
import {core} from '../';
import * as request from 'supertest';
import {newGatewaySdkMock} from '../mediarithmics/api/sdk/GatewaySdkMock';
import {GatewaySdk, IBaseSdk} from '../mediarithmics/api/sdk/GatewaySdk';

describe('Plugin Status API Tests', function () {
  class MyFakePlugin extends core.BasePlugin {
  }

  const gatewayMock = newGatewaySdkMock<IBaseSdk>({
    fetchDataFile: Promise.resolve({} as any),
    fetchConfigurationFile: Promise.resolve({} as any),
  });

  it('should return plugin status (200) if the plugin is OK', function (done) {
    const plugin = new MyFakePlugin({gatewaySdk: gatewayMock});

    request(plugin.app)
      .post('/v1/init')
      .send({authentication_token: 'Manny', worker_id: 'Calavera'})
      .end((err, res) => {
        expect(res.status).to.equal(200);
      });

    request(plugin.app)
      .get('/v1/status')
      .end(function (err, res) {
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('should return (503) if the plugin is not initialized yet', function (done) {
    const plugin = new MyFakePlugin({gatewaySdk: gatewayMock});
    request(plugin.app)
      .get('/v1/status')
      .end(function (err, res) {
        expect(res.status).to.equal(503);
        done();
      });
  });
});

describe('Plugin log level API tests', function () {
  class MyFakePlugin extends core.BasePlugin {
  }

  const gatewayMock = newGatewaySdkMock<IBaseSdk>({
    fetchDataFile: Promise.resolve({} as any),
    fetchConfigurationFile: Promise.resolve({} as any),
  });

  it('Log Level update should return 200', function (done) {
    const plugin = new MyFakePlugin({gatewaySdk: gatewayMock});

    const requestBody = {
      level: 'debug'
    };

    request(plugin.app)
      .put('/v1/log_level')
      .send(requestBody)
      .end(function (err, res) {
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('Malformed Log level update should return 400', function (done) {
    const plugin = new MyFakePlugin({gatewaySdk: gatewayMock});

    const requestBody = {
      hector: 'debug'
    };

    request(plugin.app)
      .put('/v1/log_level')
      .send(requestBody)
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        done();
      });
  });

  it('Should return WARN when getting Log Level', function (done) {
    const plugin = new MyFakePlugin({gatewaySdk: gatewayMock});

    const requestBody = {
      level: 'WARN'
    };

    request(plugin.app)
      .put('/v1/log_level')
      .send(requestBody)
      .end(function (err, res) {
        expect(res.status).to.equal(200);
      });

    request(plugin.app)
      .get('/v1/log_level')
      .end(function (err, res) {
        expect(res.status).to.equal(200);
        expect(res.body.level).to.equal(requestBody.level);
        done();
      });
  });
});

describe('Request Gateway helper API tests', function () {

  class MyFakePlugin extends core.BasePlugin {
  }

  it('Authentification token should be passed from values passed in /v1/init', function (done) {
    const plugin = new MyFakePlugin();

    const authenticationToken = 'Manny';
    const workerId = 'Calavera';

    // We init the plugin
    request(plugin.app)
      .post('/v1/init')
      .send({authentication_token: authenticationToken, worker_id: workerId})
      .end((err, res) => {
        expect(res.status).to.equal(200);

        // We try a call to the Gateway
        // @ts-ignore
        const sdkHeader = (plugin.gatewaySdk as GatewaySdk).client.options?.().headers;
        expect(sdkHeader.auth.pass).to.be.eq(authenticationToken);
        expect(sdkHeader.auth.user).to.be.eq(workerId);
        done();
      });
  });
});

describe('Data File helper Tests', function () {
  class MyFakePlugin extends core.BasePlugin {
  }

  const authenticationToken = 'Manny';
  const workerId = 'Calavera';
  const fakeDataFile = new Buffer('Hello');
  const gatewayMock = newGatewaySdkMock<IBaseSdk>({
    fetchDataFile: Promise.resolve(fakeDataFile),
    fetchConfigurationFile: Promise.resolve(fakeDataFile),
  });

  const plugin = new MyFakePlugin({gatewaySdk: gatewayMock});

  it('DataFile: Should call the proper gateway URL', function (done) {
    // We init the plugin
    request(plugin.app)
      .post('/v1/init')
      .send({authentication_token: authenticationToken, worker_id: workerId})
      .end((err, res) => {
        // We try a call to the Gateway
        plugin.gatewaySdk.fetchDataFile('mics://fake_dir/fake_file').then(file => {
          expect(file).to.be.eq(fakeDataFile);
          done();
        });
      });
  });

  it('ConfigurationFile: Should call the proper gateway URL', function (done) {
    // We init the plugin
    request(plugin.app)
      .post('/v1/init')
      .send({authentication_token: authenticationToken, worker_id: workerId})
      .end((err, res) => {
        // We try a call to the Gateway
        plugin.gatewaySdk.fetchConfigurationFile('toto').then(file => {
          expect(file).to.be.eq(fakeDataFile);
          done();
        });
      });
  });
});

describe('Instance Context Expiration Tests', function () {

  class MyFakePlugin extends core.BasePlugin {
  }

  it('InstanceContextExpiration: Check Instance Context variability: should be less than 10%', function () {
    const plugin = new MyFakePlugin();
    const refreshInterval = plugin.getInstanceContextCacheExpiration();
    expect(refreshInterval).to.be.gte(plugin.INSTANCE_CONTEXT_CACHE_EXPIRATION);
    expect(refreshInterval).to.be.lte(plugin.INSTANCE_CONTEXT_CACHE_EXPIRATION * 1.1);
  });
});