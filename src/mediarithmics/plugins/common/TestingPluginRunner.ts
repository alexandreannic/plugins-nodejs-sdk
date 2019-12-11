import {BasePlugin} from './BasePlugin';
import {Server} from 'http';

/**
 * @deprecated
 */
export class TestingPluginRunner {

  server: Server;

  constructor(public plugin: BasePlugin) {
  }

  // Start a server serving the plugin app
  // A port can be provided to run the server on it
  start() {

  }
}
