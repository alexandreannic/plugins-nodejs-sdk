import * as express from 'express';
import * as _ from 'lodash';
import * as jsesc from 'jsesc';

import {BasePlugin, PropertiesWrapper} from '../../common/BasePlugin';
import {DisplayAd} from '../../../api/core/creative/index';
import {AdRendererPluginResponse, AdRendererRequest, ClickUrlInfo} from './AdRendererInterface';
import {generateEncodedClickUrl} from '../utils/index';

export class AdRendererBaseInstanceContext {
  properties: PropertiesWrapper;
  displayAd: DisplayAd;
}

export abstract class AdRendererBasePlugin<T extends AdRendererBaseInstanceContext> extends BasePlugin {

  displayContextHeader = 'x-mics-display-context';

  constructor(enableThrottling = false) {
    super(enableThrottling);

    this.initAdContentsRoute();
    this.setErrorHandler();
  }

  /**
   * Helper to fetch the Display Ad resource with caching
   * @deprecated Call it through apiSdk instead
   */
  get fetchDisplayAd() {
    return this.apiSdk.fetchDisplayAd;
  }

  /**
   * Helper to fetch the Display Ad properties resource with caching
   * @deprecated Call it through apiSdk instead
   */
  get fetchDisplayAdProperties() {
    return this.apiSdk.fetchDisplayAdProperties;
  }

  // Method to build an instance context
  getEncodedClickUrl(redirectUrls: ClickUrlInfo[]) {
    return generateEncodedClickUrl(redirectUrls);
  }

  // To be overriden to get a custom behavior
  protected async instanceContextBuilder(creativeId: string, forceReload = false): Promise<T> {

    const displayAdP = this.fetchDisplayAd(creativeId, forceReload);
    const displayAdPropsP = this.fetchDisplayAdProperties(creativeId, forceReload);

    const results = await Promise.all([displayAdP, displayAdPropsP]);

    const displayAd = results[0];
    const displayAdProps = results[1];

    const context = {
      displayAd: displayAd,
      properties: new PropertiesWrapper(displayAdProps)
    } as T;

    return Promise.resolve(context);
  }

  protected abstract onAdContents(
    request: AdRendererRequest,
    instanceContext: T
  ): Promise<AdRendererPluginResponse>;

  private initAdContentsRoute(): void {
    this.app.post(
      '/v1/ad_contents',
      this.asyncMiddleware(
        async (req: express.Request, res: express.Response) => {
          if (!req.body || _.isEmpty(req.body)) {
            const msg = {
              error: 'Missing request body'
            };
            this.logger.error('POST /v1/ad_contents : %s', JSON.stringify(msg));
            return res.status(500).json(msg);
          } else {
            this.logger.debug(
              `POST /v1/ad_contents ${JSON.stringify(req.body)}`
            );

            const adRendererRequest = req.body as AdRendererRequest;

            if (!this.onAdContents) {
              this.logger.error(
                'POST /v1/ad_contents: No AdContents listener registered!'
              );
              const msg = {
                error: 'No AdContents listener registered!'
              };
              return res.status(500).json(msg);
            }

            // We flush the Plugin Gateway cache during previews
            const forceReload = (adRendererRequest.context === 'PREVIEW' || adRendererRequest.context === 'STAGE');

            if (
              !this.pluginCache.get(adRendererRequest.creative_id) ||
              forceReload
            ) {
              this.pluginCache.put(
                adRendererRequest.creative_id,
                this.instanceContextBuilder(adRendererRequest.creative_id, forceReload),
                this.getInstanceContextCacheExpiration()
              );
            }

            const instanceContext: T = await this.pluginCache.get(
              adRendererRequest.creative_id
            );

            const adRendererResponse = await this.onAdContents(
              adRendererRequest,
              instanceContext as T
            );

            return res
              .header(
                this.displayContextHeader,
                jsesc(adRendererResponse.displayContext, {json: true})
              )
              .status(200)
              .send(adRendererResponse.html);
          }
        }
      )
    );
  }
}
