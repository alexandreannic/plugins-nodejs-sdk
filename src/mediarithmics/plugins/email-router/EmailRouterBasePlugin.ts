import * as express from 'express';
import * as _ from 'lodash';
import {BasePlugin, BasePluginProps, PropertiesWrapper} from '../common/BasePlugin';
import {CheckEmailsRequest, EmailRoutingRequest} from '../../api/plugin/emailtemplaterouter/EmailRouterRequestInterface';


export interface EmailRouterBaseInstanceContext {
  properties: PropertiesWrapper;
}

export interface EmailRoutingPluginResponse {
  result: boolean;
}

export interface CheckEmailsPluginResponse {
  result: boolean;
}

export abstract class EmailRouterPlugin extends BasePlugin {
  instanceContext: Promise<EmailRouterBaseInstanceContext>;

  constructor(props?: BasePluginProps) {
    super(props);
    // We init the specific route to listen for activity analysis requests
    this.initEmailRouting();
    this.initEmailCheck();
    this.setErrorHandler();
  }

  // This is a default provided implementation
  protected async instanceContextBuilder(
    routerId: string
  ): Promise<EmailRouterBaseInstanceContext> {
    const emailRouterProps = await this.gatewaySdk.fetchEmailRouterProperties(routerId);

    const context: EmailRouterBaseInstanceContext = {
      properties: new PropertiesWrapper(emailRouterProps)
    };

    return context;
  }

  // To be overriden by the Plugin to get a custom behavior
  protected abstract onEmailRouting(
    request: EmailRoutingRequest,
    instanceContext: EmailRouterBaseInstanceContext
  ): Promise<EmailRoutingPluginResponse>;

  protected async getInstanceContext(
    emailRouterId: string
  ): Promise<EmailRouterBaseInstanceContext> {
    if (!this.pluginCache.get(emailRouterId)) {
      this.pluginCache.put(
        emailRouterId,
        this.instanceContextBuilder(emailRouterId),
        this.getInstanceContextCacheExpiration()
      );
    }

    return await this.pluginCache.get(emailRouterId);
  }

  // To be overriden by the Plugin to get a custom behavior
  protected abstract onEmailCheck(
    request: CheckEmailsRequest,
    instanceContext: EmailRouterBaseInstanceContext
  ): Promise<CheckEmailsPluginResponse>;

  private initEmailRouting(): void {
    this.app.post(
      '/v1/email_routing',
      this.asyncMiddleware(
        async (req: express.Request, res: express.Response) => {
          if (!req.body || _.isEmpty(req.body)) {
            const msg = {error: 'Missing request body'};
            this.logger.error('POST /v1/email_routing : %s', JSON.stringify(msg));
            return res.status(500).json(msg);
          } else {
            this.logger.debug(`POST /v1/email_routing ${JSON.stringify(req.body)}`);
            const emailRoutingRequest = req.body as EmailRoutingRequest;

            if (!this.onEmailRouting) {
              const errMsg = 'No Email Routing listener registered!';
              this.logger.error(errMsg);
              return res.status(500).json({error: errMsg});
            }

            const instanceContext = await this.getInstanceContext(emailRoutingRequest.email_router_id);
            const pluginResponse = await this.onEmailRouting(emailRoutingRequest, instanceContext);

            this.logger.debug(`Returning: ${JSON.stringify(pluginResponse)}`);
            res.status(200).send(JSON.stringify(pluginResponse));
          }
        }
      )
    );
  }

  private initEmailCheck(): void {
    this.app.post(
      '/v1/email_router_check',
      (req: express.Request, res: express.Response) => {
        if (!req.body || _.isEmpty(req.body)) {
          const msg = {
            error: 'Missing request body'
          };
          this.logger.error(
            'POST /v1/email_router_check : %s',
            JSON.stringify(msg)
          );
          res.status(500).json(msg);
        } else {
          this.logger.debug(
            `POST /v1/email_router_check ${JSON.stringify(req.body)}`
          );

          const emailCheckRequest = req.body as CheckEmailsRequest;

          if (!this.onEmailRouting) {
            throw new Error('No Email Check listener registered!');
          }

          if (!this.pluginCache.get(emailCheckRequest.email_router_id)) {
            this.pluginCache.put(
              emailCheckRequest.email_router_id,
              this.instanceContextBuilder(emailCheckRequest.email_router_id),
              this.getInstanceContextCacheExpiration()
            );
          }

          this.pluginCache
            .get(emailCheckRequest.email_router_id)
            .then((instanceContext: EmailRouterBaseInstanceContext) => {
              return this.onEmailCheck(emailCheckRequest, instanceContext).then(
                response => {
                  this.logger.debug(`Returning: ${JSON.stringify(response)}`);
                  res.status(200).send(JSON.stringify(response));
                }
              );
            })
            .catch((error: Error) => {
              this.logger.error(
                `Something bad happened : ${error.message} - ${error.stack}`
              );
              return res.status(500).send(error.message + '\n' + error.stack);
            });
        }
      }
    );
  }
}
