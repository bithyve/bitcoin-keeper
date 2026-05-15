import assert from 'assert';
import { classifyElectrumConnectionError } from '../../src/services/electrum/errorClassification';

describe('classifyElectrumConnectionError', () => {
  it('classifies trust-anchor failures as tls-certificate', () => {
    const error = new Error(
      'javax.net.ssl.SSLHandshakeException: java.security.cert.CertPathValidatorException: Trust anchor for certification path not found'
    );

    assert.strictEqual(classifyElectrumConnectionError(error), 'tls-certificate');
  });

  it('classifies timeout/unreachable failures as network', () => {
    const error = new Error('Connection timed out while connecting to electrum host');

    assert.strictEqual(classifyElectrumConnectionError(error), 'network');
  });

  it('classifies unable-to-connect failures as network', () => {
    const error = new Error('Unable to connect to any electrum server. Please switch network');

    assert.strictEqual(classifyElectrumConnectionError(error), 'network');
  });

  it('classifies unknown messages as unknown', () => {
    const error = new Error('unexpected internal electrum failure');

    assert.strictEqual(classifyElectrumConnectionError(error), 'unknown');
  });
});
