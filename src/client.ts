import path from 'path';
import { Client as SoapClient, createClientAsync } from 'soap';
import { sign } from './signing';
import { IidentityResponse, ViispAuthClientOptions } from './types';
import { readFileAsync, getValidatedIdentity } from './utils';
import { ticketTemplate } from './templates/ticket';
import { identityTemplate } from './templates/identity';

export class ViispAuthClient {
  static options: ViispAuthClientOptions = {
    uniqueNodeId: 'uniqueId',
    pid: 'VSID000000000113',
    wsdlUrl: 'https://www.epaslaugos.lt/portal-test/services/AuthenticationServiceProxy?wsdl',
    postbackUrl: 'http://localhost',
    correlationData: '',
    cert: {
      key: path.join(__dirname, '/certs/testKey.pem'),
      cert: path.join(__dirname, '/certs/testCert.pem'),
    },
  };
  static soapClientCert: Buffer;
  static soapClientCertKey: Buffer;
  private soapClient: SoapClient;

  constructor(client?: SoapClient) {
    if (typeof client === 'undefined') {
      throw new Error('Cannot be initialized directly');
    }
    this.soapClient = client;
  }

  static async init(authOptions?: ViispAuthClientOptions) {
    this.options = {
      ...this.options,
      ...authOptions,
    };

    let client: SoapClient;

    try {
      await this.storeCertificates();
      client = await createClientAsync(this.options.wsdlUrl);
      client.setEndpoint(this.options.wsdlUrl);
    } catch (error) {
      throw new Error('Unable to initialize soap client');
    }

    return new ViispAuthClient(client);
  }

  public clientInfo = () => {
    return this.soapClient.describe();
  };

  public getTicket = async (postbackUrl?: string, correlationData?: string): Promise<string> => {
    const req: string = ticketTemplate({
      uniqueId: ViispAuthClient.options.uniqueNodeId,
      pid: ViispAuthClient.options.pid,
      postbackUrl: postbackUrl || ViispAuthClient.options.postbackUrl,
      correlationData: correlationData || ViispAuthClient.options.correlationData,
    });
    const signedXmlRequest: string = await sign(
      req,
      'authenticationRequest',
      ViispAuthClient.soapClientCertKey
    );

    return new Promise((resolve, reject) => {
      this.soapClient.ExternalAuthenticationServiceImplService.ExternalAuthenticationServiceImplPort.initAuthentication(
        {
          _xml: signedXmlRequest,
        },
        (err: any, result: any) => {
          if (err) {
            return reject(err);
          }

          return resolve(result.ticket);
        }
      );
    });
  };

  public getIdentity = async (ticket: string): Promise<IidentityResponse> => {
    const req: string = identityTemplate({
      uniqueId: ViispAuthClient.options.uniqueNodeId,
      pid: ViispAuthClient.options.pid,
      ticket,
    });

    const signedXmlRequest: string = await sign(
      req,
      'authenticationDataRequest',
      ViispAuthClient.soapClientCertKey
    );

    return new Promise((resolve, reject) => {
      this.soapClient.ExternalAuthenticationServiceImplService.ExternalAuthenticationServiceImplPort.getAuthenticationData(
        {
          _xml: signedXmlRequest,
        },
        (err: any, result: any) => {
          if (err) {
            return reject(err);
          }

          return resolve(getValidatedIdentity(result));
        }
      );
    });
  };

  static async storeCertificates(): Promise<void> {
    try {
      this.soapClientCertKey = await readFileAsync(ViispAuthClient.options.cert.key);
      this.soapClientCert = await readFileAsync(ViispAuthClient.options.cert.key);
    } catch (e) {
      throw new Error(`Unable to store certificate and key ${e}`);
    }
  }
}
