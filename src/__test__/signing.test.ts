import path from 'path';
import fs from 'fs';
import { sign, validate } from '../signing';
import { ticketTemplate } from '../templates/ticket';
import { identityTemplate } from '../templates/identity';

describe('VIISP xml signing', () => {
  const options = {
    uniqueId: 'uniqueNodeId',
    pid: 'VSID000000000113',
    postbackUrl: 'http://localhost/test',
    correlationData: 'somedata',
  };
  let xml: string = null;

  beforeEach(async () => {
    xml = ticketTemplate(options);
  });

  afterEach(() => {
    xml = null;
  });

  it('should successfully sign with default key & cert', async () => {
    const result = await sign(xml, 'authenticationRequest');
    const validated = await validate(result);
    expect(validated).toBeTruthy();
  });

  it('should successfully sign with default key & cert authenticationDataRequest', async () => {
    xml = identityTemplate({ ...options, ticket: '1234' });
    const result = await sign(xml, 'authenticationDataRequest');
    const validated = await validate(result);
    expect(validated).toBeTruthy();
  });

  it('should successfully sign with provided key & cert', async () => {
    const result = await sign(
      xml,
      'authenticationRequest',
      fs.readFileSync(path.join(__dirname, '../certs/testKey.pem'))
    );
    const validated = await validate(
      result,
      fs.readFileSync(path.join(__dirname, '../certs/testCert.pem'))
    );
    expect(validated).toBeTruthy();
  });

  it('should successfully sign with provided key & cert authenticationDataRequest', async () => {
    xml = identityTemplate({ ...options, ticket: '1234' });
    const result = await sign(
      xml,
      'authenticationDataRequest',
      fs.readFileSync(path.join(__dirname, '../certs/testKey.pem'))
    );
    const validated = await validate(
      result,
      fs.readFileSync(path.join(__dirname, '../certs/testCert.pem'))
    );
    expect(validated).toBeTruthy();
  });

  it('should fail sign with incorrect keys or cert', async () => {
    const result = await sign(
      xml,
      'authenticationRequest',
      fs.readFileSync(path.join(__dirname, '../certs/testKey.pem'))
    );

    try {
      await validate(result, fs.readFileSync(path.join(__dirname, '../certs/testKey.pem')));
    } catch (e) {
      expect(e).toBeTruthy();
    }
  });
});
