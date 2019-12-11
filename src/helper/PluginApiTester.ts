import {BasePlugin, Credentials} from '../mediarithmics/plugins/common';
import {agent, Response, SuperTest, Test} from 'supertest';
import {
  ActivityAnalyzerPluginResponse,
  AudienceFeedConnectorPluginResponse,
  BidOptimizerPluginResponse,
  CheckEmailsPluginResponse,
  EmailRendererPluginResponse,
  EmailRoutingPluginResponse,
  ExternalSegmentConnectionPluginResponse,
  RecommenderPluginResponse
} from '../mediarithmics';

type LogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly'

export interface PluginApiResponse<T> extends Response {
  parsedText: T
}

export class PluginApiTester {
  constructor(private plugin: BasePlugin) {
    this.request = agent(plugin.app);
  }

  protected readonly request: SuperTest<Test>;

  readonly post = <T>(uri: string, body?: any): Promise<Response> => this.request.post(uri)
    .send(body)
    .then(this.throwIfNotOk);

  readonly put = <T>(uri: string, body?: any): Promise<Response> => this.request.put(uri)
    .send(body)
    .then(this.throwIfNotOk);

  protected readonly throwIfNotOk = (res: Response): Response | Promise<never> => {
    return res.status !== 200
      ? Promise.reject(res.status)
      : res;
  };

  protected readonly parseText = <T>(res: Response): PluginApiResponse<T> => {
    return {...res, parsedText: JSON.parse(res.text)} as PluginApiResponse<T>;
  };

  readonly initInit = async (credentials: Credentials = {authentication_token: 'Manny', worker_id: 'Calavera'}): Promise<Response> => {
    return this.request.post('/v1/init').send(credentials);
  };

  readonly initLog = async (logLevel: LogLevel = 'info'): Promise<Response> => {
    return this.request.post('/v1/log_level').send({level: logLevel});
  };

  readonly init = async (logLevel?: LogLevel, credentials?: Credentials): Promise<[Response, Response]> => {
    const initRes = await this.initInit(credentials);
    const logLevelRes = await this.initLog(logLevel);
    return [initRes, logLevelRes];
  };
}

export class ActivityAnalyzerApiTester extends PluginApiTester {
  initActivityAnalysis = (body: any) => this.post('/v1/activity_analysis', body).then(_ => this.parseText<ActivityAnalyzerPluginResponse>(_));
}

export class AdRendererApiTester extends PluginApiTester {
  initAdContents = (body: any) => this.post('/v1/ad_contents', body);
}

export class AudienceFeedApiTester extends PluginApiTester {
  initExternalSegmentCreation = () => this.post('/v1/external_segment_creation').then(_ => this.parseText<AudienceFeedConnectorPluginResponse>(_));
  initExternalSegmentConnection = () => this.post('/v1/external_segment_connection').then(_ => this.parseText<ExternalSegmentConnectionPluginResponse>(_));
  initUserSegmentUpdate = () => this.post('/v1/user_segment_update').then(_ => this.parseText<AudienceFeedConnectorPluginResponse>(_));
}

export class BidOptimizerApiTester extends PluginApiTester {
  initBidDecisions = (body: any) => this.post('/v1/bid_decisions', body).then(_ => this.parseText<BidOptimizerPluginResponse>(_));
}

export class EmailRendererApiTester extends PluginApiTester {
  initEmailContents = () => this.post('/v1/email_contents').then(_ => this.parseText<EmailRendererPluginResponse>(_));
}

export class EmailRouterApiTester extends PluginApiTester {
  initEmailRouting = (body: any) => this.post('/v1/email_routing', body).then(_ => this.parseText<EmailRoutingPluginResponse>(_));
  initEmailCheck = () => this.post('/v1/email_router_check').then(_ => this.parseText<CheckEmailsPluginResponse>(_));
}

export class RecommenderApiTester extends PluginApiTester {
  initRecommendation = () => this.post('/v1/recommendations').then(_ => this.parseText<RecommenderPluginResponse>(_));
}
