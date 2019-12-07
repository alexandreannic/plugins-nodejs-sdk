import {AdRendererTemplateInstanceContext, AdRendererTemplatePlugin} from '../template/AdRendererTemplatePlugin';
import {map} from '../../../utils';

export interface AdRendererRecoTemplateInstanceContext
  extends AdRendererTemplateInstanceContext {
  recommender_id?: string;
}

export abstract class AdRendererRecoTemplatePlugin extends AdRendererTemplatePlugin {
  constructor(enableThrottling = false) {
    super(enableThrottling);
  }

  /**
   * Helper to fetch the User Campaign
   * @param campaignId  The campaignId -> should come from the AdRendererRequest
   * @param userCampaignId  The userCampaignId -> should come from the AdRendererRequest
   * @returns       A Promise of the User Campaign
   * @deprecated Call it through apiSdk instead
   */
  get fetchUserCampaign() {
    return this.apiSdk.fetchUserCampaign;
  }

  /**
   * Helper to fetch the User recommendations
   * @param instanceContext  The instanceContext -> contains the recommender_id of the creative
   * @param userAgentId  The userAgentId as a string -> should come from the AdRendererRequest (recommended) or from the UserCampaign
   * @returns       A Promise of the Recommendations
   * @deprecated Call it through apiSdk instead
   */
  get fetchRecommendations() {
    return this.apiSdk.fetchRecommendations;
  }

  protected async instanceContextBuilder(creativeId: string) {
    const baseInstanceContext = await super.instanceContextBuilder(creativeId);

    const recommenderProperty = baseInstanceContext.properties.findStringProperty('recommender_id');

    const context: AdRendererRecoTemplateInstanceContext = {
      ...baseInstanceContext,
      recommender_id: map(recommenderProperty, p => p.value.value)
    };

    return context;
  }
}
