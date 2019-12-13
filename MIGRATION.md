# Breaking changes

- Properties `gatewayHost`, `gatewayPort`, `outboundPlatformUrl`, `proxyHost, `proxyPort`, `proxyUrl` and `pluginPort` of `BasePlugin` must be now accessed from the property `config`.
- All gateway calls (like `fetchActivityAnalyzer`, `fetchRecommenderProperties`, …) of `BasePlugin` must be now accessed from the property `gatewaySdk`.
- Mics API calls (`fetchDatamarts`, `fetchDatamartCompartments`) must be now accessed from the property `apiSdk`
- `BasePlugin` constructor signature has changed. It’s now an object which can contains `config`, - `gatewaySdk`, `apiSdk` and the original `enableThrottling` property.
- `ifFactory` helper designed to tests Activity analyzers has been removed in favor of `ActivityAnalyzerTester`
- `TestingPluginRunner` class has been removed since it’s no longer relevant (not really sure it was before :D).
- `_transport` has been removed.
