import {ActivityAnalyzer, ActivityAnalyzerPlugin, BasePluginProps, IActivityAnalyzerSdk, LogLevel, newGatewaySdkMock, PluginProperty} from '../../mediarithmics';
import {ActivityAnalyzerApiTester} from '../PluginApiTester';

const defaultProperties: PluginProperty[] = [
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

const defaultActivityAnalyzer: ActivityAnalyzer = {
  id: '1000',
  name: 'my analyzer',
  organisation_id: '1000',
  visit_analyzer_plugin_id: 1001,
  group_id: 'com.mediarithmics.visit-analyzer',
  artifact_id: 'default'
};

export class ActivityAnalyzerTester {

  constructor(
    private Plugin: new (props?: BasePluginProps) => ActivityAnalyzerPlugin,
    private logLevel: LogLevel = 'info') {
  }

  readonly test = async ({
    input,
    expectedOutput,
    properties = defaultProperties,
    activityAnalyzer = defaultActivityAnalyzer,
  }: {
    input: any,
    expectedOutput: any,
    properties?: PluginProperty[],
    activityAnalyzer?: ActivityAnalyzer
  }): Promise<any> => {
    const output = await this.process({input, properties, activityAnalyzer});
    return ActivityAnalyzerTester.compare(output, expectedOutput);
  };

  readonly process = async ({
    input,
    properties = defaultProperties,
    activityAnalyzer = defaultActivityAnalyzer,
  }: {
    input: any,
    properties?: PluginProperty[],
    activityAnalyzer?: ActivityAnalyzer
  }): Promise<any> => {
    const gatewayMock = newGatewaySdkMock<IActivityAnalyzerSdk>({
      fetchActivityAnalyzer: Promise.resolve(activityAnalyzer),
      fetchActivityAnalyzerProperties: Promise.resolve(properties),
    });
    const plugin = new this.Plugin({gatewaySdk: gatewayMock});
    const tester = new ActivityAnalyzerApiTester(plugin);
    await tester.initAndSetLogLevel(this.logLevel);
    const res = await tester.postActivityAnalysis(input);
    plugin.pluginCache.clear();
    return JSON.parse(res.text);
  };

  static readonly compare = (input: any, output: any): boolean => {
    return JSON.stringify(input) === JSON.stringify(output);
  };
}