import * as express from 'express';
import * as _ from 'lodash';
import {BasePlugin, BasePluginProps, PropertiesWrapper} from '../../common';
import {Creative} from '../../../api/core/creative';
import {EmailRenderRequest} from '../../../api/plugin/emailtemplaterenderer/EmailRendererRequestInterface';
import {EmailRendererPluginResponse} from '../../../api/plugin/emailtemplaterenderer/EmailRendererPluginResponse';

export interface EmailRendererBaseInstanceContext {
  creative: Creative;
  properties: PropertiesWrapper;
}

export abstract class EmailRendererPlugin<T extends EmailRendererBaseInstanceContext = EmailRendererBaseInstanceContext> extends BasePlugin {
  instanceContext: Promise<T>;

  constructor(props?: BasePluginProps) {
    super(props);
    // We init the specific route to listen for email contents requests
    this.initEmailContents();
    this.setErrorHandler();
  }

  // This is a default provided implementation
  protected async instanceContextBuilder(
    creativeId: string,
    forceReload = false
  ): Promise<T> {
    const creativeP = this.gatewaySdk.fetchCreative(creativeId, forceReload);
    const creativePropsP = this.gatewaySdk.fetchCreativeProperties(creativeId, forceReload);

    const results = await Promise.all([creativeP, creativePropsP]);

    const creative = results[0];
    const creativeProps = results[1];

    const context = {
      creative: creative,
      properties: new PropertiesWrapper(creativeProps)
    } as T;

    return context;
  }

  // To be overriden by the Plugin to get a custom behavior
  protected abstract onEmailContents(
    request: EmailRenderRequest,
    instanceContext: T
  ): Promise<EmailRendererPluginResponse>;

  private initEmailContents(): void {
    this.app.post(
      '/v1/email_contents',
      this.asyncMiddleware(
        async (req: express.Request, res: express.Response) => {
          if (!req.body || _.isEmpty(req.body)) {
            const msg = {
              error: 'Missing request body'
            };
            this.logger.error(
              'POST /v1/email_contents : %s',
              JSON.stringify(msg)
            );
            return res.status(500).json(msg);
          } else {
            this.logger.debug(
              `POST /v1/email_contents ${JSON.stringify(req.body)}`
            );

            const emailRenderRequest = req.body as EmailRenderRequest;

            if (!this.onEmailContents) {
              const errMsg = 'No Email Renderer listener registered!';
              this.logger.error(errMsg);
              return res.status(500).send({error: errMsg});
            }

            // We flush the Plugin Gateway cache during previews
            const forceReload = (emailRenderRequest.context === 'PREVIEW' || emailRenderRequest.context === 'STAGE');

            if (!this.pluginCache.get(emailRenderRequest.creative_id) || forceReload) {
              this.pluginCache.put(
                emailRenderRequest.creative_id,
                this.instanceContextBuilder(
                  emailRenderRequest.creative_id,
                  forceReload
                ),
                this.getInstanceContextCacheExpiration()
              );
            }

            const instanceContext = await this.pluginCache.get(
              emailRenderRequest.creative_id
            );

            const response = await this.onEmailContents(
              emailRenderRequest,
              instanceContext as T
            );

            this.logger.debug(`Returning: ${JSON.stringify(response)}`);
            return res.status(200).send(JSON.stringify(response));
          }
        }
      )
    );
  }
}
