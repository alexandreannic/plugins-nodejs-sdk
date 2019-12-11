import {BasePlugin, Credentials} from '../mediarithmics/plugins/common';
import {agent, Response, SuperTest, Test} from 'supertest';
import {expect} from 'chai';

type LogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly'

export class PluginApiTester {
  constructor(private plugin: BasePlugin) {
    this.request = agent(plugin.app);
  }

  readonly request: SuperTest<Test>;

  readonly post = (uri: string, body?: any): Promise<Response> => this.request.post(uri).send(body);

  readonly put = (uri: string, body?: any): Promise<Response> => this.request.put(uri).send(body);

  readonly initPlugin = async (logLevel: LogLevel = 'info', credentials: Credentials = {authentication_token: 'Manny', worker_id: 'Calavera'}): Promise<[Response, Response]> => {
    const initRes = await this.request.post('/v1/init').send(credentials);
    expect(initRes.status).to.eq(200);
    const logLevelRes = await this.request.put('/v1/log_level').send({level: 'debug'});
    expect(logLevelRes.status).to.eq(200);
    return [initRes, logLevelRes];
  };
}