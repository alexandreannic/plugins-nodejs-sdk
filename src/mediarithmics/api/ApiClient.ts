import * as request from 'request';
import {obfuscateString} from '../utils';
import {Credentials} from '../plugins/common';
import * as winston from 'winston';

export class ApiClient {

  constructor(
    private baseURL: string,
    private transport: () => any,
    private credentials: Credentials,
    private logger: winston.Logger,
  ) {
  }

  readonly get = async <T = any>(uri: string, qs?: any, isJson?: boolean, isBinary?: boolean) => this.request<T>('GET', uri, undefined, qs, isJson, isBinary);
  readonly post = async <T = any>(uri: string, body?: any, isJson?: boolean, isBinary?: boolean) => this.request<T>('POST', uri, body, isJson, isBinary);
  readonly put = async <T = any>(uri: string, body?: any, isJson?: boolean, isBinary?: boolean) => this.request<T>('PUT', uri, body, isJson, isBinary);
  readonly delete = async <T = any>(uri: string, isJson?: boolean, isBinary?: boolean) => this.request<T>('DELETE', uri, isJson, isBinary);

  async request<T = any>(
    method: string,
    uri: string,
    body?: any,
    qs?: any,
    isJson?: boolean,
    isBinary?: boolean
  ): Promise<T> {
    const options: request.OptionsWithUri = {
      method: method,
      uri: `${this.baseURL}${uri}`,
      auth: {
        user: this.credentials.worker_id,
        pass: this.credentials.authentication_token,
        sendImmediately: true
      },
      proxy: false,
      body,
      qs,
      json: isJson !== undefined ? isJson : true,
      encoding: isBinary !== undefined && isBinary ? null : undefined
    };
    this.logger.silly(`Doing gateway call with ${JSON.stringify(options)}`);
    try {
      const res = await this.transport()(options);
      this.logger.debug(`[${method}] ${uri}: ${JSON.stringify(res)}`);
      return res;
    } catch (e) {
      if (e.name === 'StatusCodeError') {
        const bodyString = isJson !== undefined && !isJson ? body : JSON.stringify(body);
        throw new Error(`
          Error while calling ${method} '${uri}' with the request body '${bodyString || ''}',
          the qs '${JSON.stringify(qs) || ''}', the auth user '${obfuscateString(options.auth ? options.auth.user : undefined) || ''}',
          the auth password '${obfuscateString(options.auth ? options.auth.pass : undefined) || ''}':
          got a ${e.response.statusCode} ${e.response.statusMessage} with the response body ${JSON.stringify(e.response.body)}
        `);
      } else {
        this.logger.error(`Got an issue while doing a Gateway call: ${e.message} - ${e.stack}`);
        throw e;
      }
    }
  }
}