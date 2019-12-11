import {expect} from 'chai';
import 'mocha';
import {AdRendererRequest, DisplayAd, IAdRendererSdk, IBaseSdk, ItemProposal, newGatewaySdkMock, PluginProperty} from '@mediarithmics/plugins-nodejs-sdk/lib/mediarithmics';
import {MyHandlebarsAdRenderer} from '../MyPluginImpl';
import {IAdRendererRecoSdk} from '../../../../lib/mediarithmics';
import {AdRendererApiTester} from '@mediarithmics/plugins-nodejs-sdk/lib/helper';
import {badChars, escapeChar} from './utils';

const creative: DisplayAd = {
  type: 'DISPLAY_AD',
  id: '7168',
  organisation_id: '1126',
  name: 'Toto',
  technical_name: null,
  archived: false,
  editor_version_id: '5',
  editor_version_value: '1.0.0',
  editor_group_id: 'com.mediarithmics.creative.display',
  editor_artifact_id: 'default-editor',
  editor_plugin_id: '5',
  renderer_version_id: '1054',
  renderer_version_value: '1.0.0',
  renderer_group_id: 'com.trololo.creative.display',
  renderer_artifact_id: 'multi-advertisers-display-ad-renderer',
  renderer_plugin_id: '1041',
  creation_date: 1492785056278,
  subtype: 'BANNER',
  format: '300x250'
};

const creativePropertiesResponse: PluginProperty[] = [
  {
    technical_name: 'click_url',
    value: {
      url:
        ''
    },
    property_type: 'URL',
    origin: 'PLUGIN',
    writable: true,
    deletable: false
  },
  {
    technical_name: 'template',
    value: {
      uri: 'mics://over_the_rainbow',
      last_modified: undefined
    },
    property_type: 'DATA_FILE',
    origin: 'PLUGIN',
    writable: true,
    deletable: false
  },
  {
    technical_name: 'backup_image',
    value: {original_file_name: null, asset_id: null, file_path: null},
    property_type: 'ASSET',
    origin: 'PLUGIN',
    writable: true,
    deletable: false
  },
  {
    technical_name: 'datamart_id',
    value: {value: null},
    property_type: 'STRING',
    origin: 'PLUGIN',
    writable: true,
    deletable: false
  },
  {
    technical_name: 'default_items',
    value: {value: null},
    property_type: 'STRING',
    origin: 'PLUGIN',
    writable: true,
    deletable: false
  },
  {
    technical_name: 'recommender_id',
    value: {value: '1'},
    property_type: 'STRING',
    origin: 'PLUGIN',
    writable: true,
    deletable: false
  },
  {
    technical_name: 'tag_type',
    value: {value: null},
    property_type: 'STRING',
    origin: 'PLUGIN_STATIC',
    writable: false,
    deletable: false
  }
];

const recommendations: ItemProposal[] = [
  {
    $type: 'ITEM_PROPOSAL',
    $item_id: '8',
    $id: '8',
    $catalog_id: '16',
    $name: 'Résidence Les Terrasses de Veret***',
    $brand: 'Madame Vacance',
    $url:
      'https://www.madamevacances.com/locations/france/alpes-du-nord/flaine/residence-les-terrasses-de-veret/',
    $image_url:
      'http://hbs.madamevacances.com/photos/etab/87/235x130/residence_les_terrasses_de_veret_piscine.jpg',
    $price: 160.3,
    $sale_price: null,
    city: 'Flaine',
    country: 'France',
    region: 'Alpes du Nord',
    zip_code: '74300'
  },
  {
    $type: 'ITEM_PROPOSAL',
    $item_id: '7',
    $id: '7',
    $catalog_id: '16',
    $name: 'Le Chalet Altitude*****',
    $brand: 'Madame Vacance',
    $url:
      'https://www.madamevacances.com/locations/france/alpes-du-nord/val-thorens/le-chalet-altitude/',
    $image_url:
      'http://hbs.madamevacances.com/photos/etab/335/235x130/chalet_altitude_exterieure_2.jpg',
    $price: null,
    $sale_price: null,
    city: 'Val Thorens',
    country: 'France',
    region: 'Alpes du Nord',
    zip_code: '73440'
  },
  {
    $type: 'ITEM_PROPOSAL',
    $item_id: '6',
    $id: '6',
    $catalog_id: '16',
    $name: 'Les Chalets du Thabor***',
    $brand: 'Madame Vacance',
    $url:
      'https://www.madamevacances.com/locations/france/alpes-du-nord/valfrejus/les-chalets-du-thabor/',
    $image_url:
      'http://hbs.madamevacances.com/photos/etab/65/235x130/valfrejus_chalet_thabor_exterieure_2.jpg',
    $price: 143.2,
    $sale_price: null,
    city: 'Valfréjus',
    country: 'France',
    region: 'Alpes du Nord',
    zip_code: '73500'
  }
];

const gatewayMock = (
  templateContent: string,
  creativeProperties: PluginProperty[] = creativePropertiesResponse,
) => newGatewaySdkMock<IAdRendererSdk & IAdRendererRecoSdk & IBaseSdk>({
  fetchDisplayAd: Promise.resolve(creative),
  fetchDataFile: Promise.resolve(new Buffer(templateContent)),
  fetchDisplayAdProperties: Promise.resolve(creativeProperties),
  fetchRecommendations: Promise.resolve(recommendations),
  fetchConfigurationFile: Promise.resolve({} as any),
  fetchUserCampaign: Promise.resolve({} as any),
});

const adRequest: AdRendererRequest = {
  call_id: 'auc:goo:58346725000689de0a16ac4f120ecc41-0',
  context: 'LIVE',
  creative_id: '2757',
  campaign_id: '1537',
  ad_group_id: '1622',
  protocol: 'https',
  user_agent_id: 'vec:42000',
  user_agent:
    'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; MALCJS; rv:11.0) like Gecko',
  user_agent_info: {
    form_factor: 'PERSONAL_COMPUTER',
    os_family: 'WINDOWS',
    browser_family: 'IE',
    brand: null,
    model: null,
    os_version: null,
    carrier: null
  },
  placeholder_id: 'mics_ed54e0e',
  user_campaign_id: 'toto',
  click_urls_info: [
    {
      url: 'https://ads.mediarithmics.com/ads/event?caid=auc%3Agoo%3A58346725000689de0a16ac4f120ecc41-0&ctx=LIVE&tid=1093&gid=1622&rid=2757&uaid=tech%3Agoo%3ACAESEANnikq25sbChKLHU7-o7ls&type=clk&ctid=%7B%7BMICS_AD_CONTENT_ID%7D%7D&redirect=',
      redirect_count: 1
    },
    {
      url: 'https://adclick.g.doubleclick.net/aclk?sa=L&ai=CDypOJWc0WN6TGs_YWsGYu5AB4Kmf9UbfuK_coAPAjbcBEAEgAGDVjdOCvAiCARdjYS1wdWItNjE2Mzg1Nzk5Mjk1Njk2NMgBCakCNKXJyWPNsT7gAgCoAwGqBOkBT9DCltAKPa0ltaiH2E0CxRF2Jee8ykOBqRGHBbE8aYS7jODKKPHE3KkGbenZXwSan1UZekvmuIfSdRUg6DFQhnbJnMR_bK57BQlMaMnmd71MXTv6P9Hh0m5cuoj7SlpOoyMX9IG8mNomIve031sZUPKOb5QA_tVKhtrlnm2hYJ7KSVZJH_83YmpK_ShxuxIwiAwQKMhYBnM4tnbvEinl3fROiwH1FFNOlqNJPaNgU4z9kEGCHIpj3RLErIcrxmT5OFLZ3q5AELXCYBJP1zB-UvscTkLrfc3Vl-sOe5f5_Tkkn-MpcijM_Z_gBAGABvDqk_ivqMjMFaAGIagHpr4b2AcA0ggFCIBhEAE&num=1&sig=AOD64_3iMhOr3Xh-A4bP1jvMzeEMGFfwtw&client=ca-pub-6163857992956964&adurl=',
      redirect_count: 1
    }
  ],
  display_tracking_url:
    'https://ads.mediarithmics.com/ads/event?caid=auc%3Agoo%3A58346725000689de0a16ac4f120ecc41-0&ctx=LIVE&tid=1093&gid=1622&rid=2757&uaid=tech%3Agoo%3ACAESEANnikq25sbChKLHU7-o7ls&type=imp&vid=4080&cb=ef3933a2-591b-4b1e-8fe2-4d9fd75980c4',
  latitude: null,
  longitude: null,
  restrictions: {animation_max_duration: 25}
};

describe('Test Example Handlebar Ad Renderer', function () {
  it('Check overall execution of dummy handlebar adRenderer', async function () {
    const templateContent: string = `Hello World!`;
    const mock = gatewayMock(templateContent);
    const plugin = new MyHandlebarsAdRenderer({gatewaySdk: mock});
    const tester = new AdRendererApiTester(plugin);
    await tester.init();
    await tester.initAdContents(adRequest);
    expect(mock.calledMethods.fetchRecommendations.getArgs(0)?.[1] === adRequest.user_agent_id);
  });

  it('Check encodeClickUrl macro', async function () {
    const templateContent: string = `{{> encodeClickUrl url="http://www.mediarithmics.com/en/"}}`;
    const plugin = new MyHandlebarsAdRenderer({gatewaySdk: gatewayMock(templateContent)});
    const tester = new AdRendererApiTester(plugin);
    await tester.init('silly');
    const res = await tester.initAdContents(adRequest);
    const urlFromHandlebar = res.text.trim();
    const correctUrl = 'https://ads.mediarithmics.com/ads/event?caid=auc%3Agoo%3A58346725000689de0a16ac4f120ecc41-0&ctx=LIVE&tid=1093&gid=1622&rid=2757&uaid=tech%3Agoo%3ACAESEANnikq25sbChKLHU7-o7ls&type=clk&ctid=%7B%7BMICS_AD_CONTENT_ID%7D%7D&redirect=https%3A%2F%2Fadclick.g.doubleclick.net%2Faclk%3Fsa%3DL%26ai%3DCDypOJWc0WN6TGs_YWsGYu5AB4Kmf9UbfuK_coAPAjbcBEAEgAGDVjdOCvAiCARdjYS1wdWItNjE2Mzg1Nzk5Mjk1Njk2NMgBCakCNKXJyWPNsT7gAgCoAwGqBOkBT9DCltAKPa0ltaiH2E0CxRF2Jee8ykOBqRGHBbE8aYS7jODKKPHE3KkGbenZXwSan1UZekvmuIfSdRUg6DFQhnbJnMR_bK57BQlMaMnmd71MXTv6P9Hh0m5cuoj7SlpOoyMX9IG8mNomIve031sZUPKOb5QA_tVKhtrlnm2hYJ7KSVZJH_83YmpK_ShxuxIwiAwQKMhYBnM4tnbvEinl3fROiwH1FFNOlqNJPaNgU4z9kEGCHIpj3RLErIcrxmT5OFLZ3q5AELXCYBJP1zB-UvscTkLrfc3Vl-sOe5f5_Tkkn-MpcijM_Z_gBAGABvDqk_ivqMjMFaAGIagHpr4b2AcA0ggFCIBhEAE%26num%3D1%26sig%3DAOD64_3iMhOr3Xh-A4bP1jvMzeEMGFfwtw%26client%3Dca-pub-6163857992956964%26adurl%3Dhttp%253A%252F%252Fwww.mediarithmics.com%252Fen%252F';
    expect(urlFromHandlebar).to.be.eq(correctUrl.replace(badChars, escapeChar));
  });

  it('Check encodeRecoClickUrl macro', async function () {
    const templateContent: string = `
    {{#each RECOMMENDATIONS}}
    {{> encodeRecoClickUrl }},
    {{/each}}`;

    const plugin = new MyHandlebarsAdRenderer({gatewaySdk: gatewayMock(templateContent)});
    const tester = new AdRendererApiTester(plugin);
    await tester.init();
    const res = await tester.initAdContents(adRequest);
    const urlsFromHandlebar = res.text.split(',').map(url => url.trim());

    const correctUrls = [
      'https://ads.mediarithmics.com/ads/event?caid=auc%3Agoo%3A58346725000689de0a16ac4f120ecc41-0&ctx=LIVE&tid=1093&gid=1622&rid=2757&uaid=tech%3Agoo%3ACAESEANnikq25sbChKLHU7-o7ls&type=clk&ctid=0&redirect=https%3A%2F%2Fadclick.g.doubleclick.net%2Faclk%3Fsa%3DL%26ai%3DCDypOJWc0WN6TGs_YWsGYu5AB4Kmf9UbfuK_coAPAjbcBEAEgAGDVjdOCvAiCARdjYS1wdWItNjE2Mzg1Nzk5Mjk1Njk2NMgBCakCNKXJyWPNsT7gAgCoAwGqBOkBT9DCltAKPa0ltaiH2E0CxRF2Jee8ykOBqRGHBbE8aYS7jODKKPHE3KkGbenZXwSan1UZekvmuIfSdRUg6DFQhnbJnMR_bK57BQlMaMnmd71MXTv6P9Hh0m5cuoj7SlpOoyMX9IG8mNomIve031sZUPKOb5QA_tVKhtrlnm2hYJ7KSVZJH_83YmpK_ShxuxIwiAwQKMhYBnM4tnbvEinl3fROiwH1FFNOlqNJPaNgU4z9kEGCHIpj3RLErIcrxmT5OFLZ3q5AELXCYBJP1zB-UvscTkLrfc3Vl-sOe5f5_Tkkn-MpcijM_Z_gBAGABvDqk_ivqMjMFaAGIagHpr4b2AcA0ggFCIBhEAE%26num%3D1%26sig%3DAOD64_3iMhOr3Xh-A4bP1jvMzeEMGFfwtw%26client%3Dca-pub-6163857992956964%26adurl%3Dhttps%253A%252F%252Fwww.madamevacances.com%252Flocations%252Ffrance%252Falpes-du-nord%252Fflaine%252Fresidence-les-terrasses-de-veret%252F',
      'https://ads.mediarithmics.com/ads/event?caid=auc%3Agoo%3A58346725000689de0a16ac4f120ecc41-0&ctx=LIVE&tid=1093&gid=1622&rid=2757&uaid=tech%3Agoo%3ACAESEANnikq25sbChKLHU7-o7ls&type=clk&ctid=1&redirect=https%3A%2F%2Fadclick.g.doubleclick.net%2Faclk%3Fsa%3DL%26ai%3DCDypOJWc0WN6TGs_YWsGYu5AB4Kmf9UbfuK_coAPAjbcBEAEgAGDVjdOCvAiCARdjYS1wdWItNjE2Mzg1Nzk5Mjk1Njk2NMgBCakCNKXJyWPNsT7gAgCoAwGqBOkBT9DCltAKPa0ltaiH2E0CxRF2Jee8ykOBqRGHBbE8aYS7jODKKPHE3KkGbenZXwSan1UZekvmuIfSdRUg6DFQhnbJnMR_bK57BQlMaMnmd71MXTv6P9Hh0m5cuoj7SlpOoyMX9IG8mNomIve031sZUPKOb5QA_tVKhtrlnm2hYJ7KSVZJH_83YmpK_ShxuxIwiAwQKMhYBnM4tnbvEinl3fROiwH1FFNOlqNJPaNgU4z9kEGCHIpj3RLErIcrxmT5OFLZ3q5AELXCYBJP1zB-UvscTkLrfc3Vl-sOe5f5_Tkkn-MpcijM_Z_gBAGABvDqk_ivqMjMFaAGIagHpr4b2AcA0ggFCIBhEAE%26num%3D1%26sig%3DAOD64_3iMhOr3Xh-A4bP1jvMzeEMGFfwtw%26client%3Dca-pub-6163857992956964%26adurl%3Dhttps%253A%252F%252Fwww.madamevacances.com%252Flocations%252Ffrance%252Falpes-du-nord%252Fval-thorens%252Fle-chalet-altitude%252F',
      'https://ads.mediarithmics.com/ads/event?caid=auc%3Agoo%3A58346725000689de0a16ac4f120ecc41-0&ctx=LIVE&tid=1093&gid=1622&rid=2757&uaid=tech%3Agoo%3ACAESEANnikq25sbChKLHU7-o7ls&type=clk&ctid=2&redirect=https%3A%2F%2Fadclick.g.doubleclick.net%2Faclk%3Fsa%3DL%26ai%3DCDypOJWc0WN6TGs_YWsGYu5AB4Kmf9UbfuK_coAPAjbcBEAEgAGDVjdOCvAiCARdjYS1wdWItNjE2Mzg1Nzk5Mjk1Njk2NMgBCakCNKXJyWPNsT7gAgCoAwGqBOkBT9DCltAKPa0ltaiH2E0CxRF2Jee8ykOBqRGHBbE8aYS7jODKKPHE3KkGbenZXwSan1UZekvmuIfSdRUg6DFQhnbJnMR_bK57BQlMaMnmd71MXTv6P9Hh0m5cuoj7SlpOoyMX9IG8mNomIve031sZUPKOb5QA_tVKhtrlnm2hYJ7KSVZJH_83YmpK_ShxuxIwiAwQKMhYBnM4tnbvEinl3fROiwH1FFNOlqNJPaNgU4z9kEGCHIpj3RLErIcrxmT5OFLZ3q5AELXCYBJP1zB-UvscTkLrfc3Vl-sOe5f5_Tkkn-MpcijM_Z_gBAGABvDqk_ivqMjMFaAGIagHpr4b2AcA0ggFCIBhEAE%26num%3D1%26sig%3DAOD64_3iMhOr3Xh-A4bP1jvMzeEMGFfwtw%26client%3Dca-pub-6163857992956964%26adurl%3Dhttps%253A%252F%252Fwww.madamevacances.com%252Flocations%252Ffrance%252Falpes-du-nord%252Fvalfrejus%252Fles-chalets-du-thabor%252F',
      '',
    ];

    expect(urlsFromHandlebar).to.be.deep.eq(
      correctUrls.map(url => url.replace(badChars, escapeChar))
    );
  });

  it('Check formatPrice macro', async function () {
    const templateContent: string = `{{formatPrice 123.4522214 "0.00"}}`;
    const plugin = new MyHandlebarsAdRenderer({gatewaySdk: gatewayMock(templateContent)});
    const tester = new AdRendererApiTester(plugin);
    await tester.init();
    const res = await tester.initAdContents(adRequest);
    const priceFromHandlebar = res.text.trim();
    const correctPrice = '123.45';
    expect(priceFromHandlebar).to.be.eq(correctPrice.replace(badChars, escapeChar));
  });

  it('Check toJson macro', async function () {
    const templateContent: string = `{{toJson REQUEST}}`;
    const plugin = new MyHandlebarsAdRenderer({gatewaySdk: gatewayMock(templateContent)});
    const tester = new AdRendererApiTester(plugin);
    await tester.init();
    const res = await tester.initAdContents(adRequest);
    const json = res.text.trim();
    expect(json).to.be.eq(JSON.stringify(adRequest).replace(badChars, escapeChar));
  });

  it('Check displayTracking', async function () {
    const templateContent: string = `{{REQUEST.display_tracking_url}}`;
    const plugin = new MyHandlebarsAdRenderer({gatewaySdk: gatewayMock(templateContent)});
    const tester = new AdRendererApiTester(plugin);
    await tester.init();
    const res = await tester.initAdContents(adRequest);
    const trackingURL = res.text.trim();
    expect(trackingURL).to.be.eq(adRequest.display_tracking_url.replace(badChars, escapeChar));
  });

  it('Check Headers', async function () {
    // Template File stub
    const templateContent: string = `
    {{#each RECOMMENDATIONS}}
    {{> encodeRecoClickUrl }},
    {{/each}}`;

    const plugin = new MyHandlebarsAdRenderer({gatewaySdk: gatewayMock(templateContent)});
    const tester = new AdRendererApiTester(plugin);
    await tester.init();
    const res = await tester.initAdContents(adRequest);
    const headers = res.header['x-mics-display-context'];
    recommendations.map((prop, idx) => {
      expect(
        JSON.parse(headers).$clickable_contents[idx].item_id
      ).to.be.eq(prop.$id);
      expect(
        JSON.parse(headers).$clickable_contents[idx].$content_id
      ).to.be.eq(idx);
    });
  });

  it('Check that the plugin doesn\'t fail without any recommenderId provided', async function () {

    const templateContent: string = `Hello World!`;

    // properties without recommederId
    const creativePropertiesResponse: PluginProperty[] = [
      {
        technical_name: 'click_url',
        value: {
          url:
            'http://www.april.fr/mon-assurance-de-pret-formulaire?cmpid=disp_datacomp_formadp_bann_300x250'
        },
        property_type: 'URL',
        origin: 'PLUGIN',
        writable: true,
        deletable: false
      },
      {
        technical_name: 'template',
        value: {
          uri: 'mics://over_the_rainbow',
          last_modified: undefined
        },
        property_type: 'DATA_FILE',
        origin: 'PLUGIN',
        writable: true,
        deletable: false
      },
      {
        technical_name: 'backup_image',
        value: {original_file_name: null, asset_id: null, file_path: null},
        property_type: 'ASSET',
        origin: 'PLUGIN',
        writable: true,
        deletable: false
      },
      {
        technical_name: 'datamart_id',
        value: {value: null},
        property_type: 'STRING',
        origin: 'PLUGIN',
        writable: true,
        deletable: false
      },
      {
        technical_name: 'default_items',
        value: {value: null},
        property_type: 'STRING',
        origin: 'PLUGIN',
        writable: true,
        deletable: false
      },
      {
        technical_name: 'recommender_id',
        value: {value: null},
        property_type: 'STRING',
        origin: 'PLUGIN',
        writable: true,
        deletable: false
      },
      {
        technical_name: 'tag_type',
        value: {value: null},
        property_type: 'STRING',
        origin: 'PLUGIN_STATIC',
        writable: false,
        deletable: false
      }
    ];
    const plugin = new MyHandlebarsAdRenderer({gatewaySdk: gatewayMock(templateContent, creativePropertiesResponse)});
    const tester = new AdRendererApiTester(plugin);
    await tester.init();
    await tester.initAdContents(adRequest);
  });

  it('Check if plugin doesn\'t fail without any user_agent_id', async function () {
    const templateContent: string = `Hello World!`;
    const mocks = gatewayMock(templateContent);
    const plugin = new MyHandlebarsAdRenderer({gatewaySdk: mocks});

    const adRequest2 = Object.assign({}, adRequest);
    adRequest2.user_agent_id = null;

    const tester = new AdRendererApiTester(plugin);
    await tester.init();
    await tester.initAdContents(adRequest2);
    expect(mocks.calledMethods.fetchRecommendations.getArgs(0)?.[1] === adRequest2.user_agent_id);
  });
});
