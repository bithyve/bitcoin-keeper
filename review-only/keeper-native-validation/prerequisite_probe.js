// Disposable alternate Metro entrypoint; no application source edits.
import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { AppRegistry, SafeAreaView, Text } from 'react-native';
import Realm from 'realm';
import { initConnection, endConnection } from 'react-native-iap';
import schema from '../../src/storage/realm/schema';
import * as storage from '../../src/storage';
import { name as appName } from '../../app.json';
import { runProbe } from './prerequisite_storage.cjs';
import { runIap, failureCode } from './prerequisite_iap.cjs';

let attempt;
function Probe() {
  const [result, setResult] = useState({ storage: 'running', iap: 'not-run', failure: '' });
  useEffect(() => {
    let active = true;
    if (!attempt) {
      attempt = (async () => {
        if (!__DEV__) return { storage: 'failed', iap: 'not-run', failure: 'DEVELOPMENT_ONLY' };
        let stage;
        try { stage = await runProbe({ Realm, schema, storage }); }
        catch { return { storage: 'failed', iap: 'not-run', failure: 'STORAGE_FAILURE' }; }
        if (stage !== 'pass') return { storage: stage, iap: 'not-run', failure: '' };
        if (active) setResult({ storage: 'pass', iap: 'running', failure: '' });
        try {
          await runIap({ initConnection, endConnection });
          return { storage: 'pass', iap: 'pass', failure: '' };
        } catch (error) {
          return { storage: 'pass', iap: 'blocked', failure: failureCode(error) };
        }
      })();
    }
    attempt.then(value => { if (active) setResult(value); });
    return () => { active = false; };
  }, []);
  return (
    <SafeAreaView>
      <Text testID={`native-probe-${result.storage === 'pass' ? 'storage-pass' : result.storage}`}>
        Keeper disposable storage check
      </Text>
      <Text testID={`native-probe-iap-${result.iap}`}>Keeper disposable IAP check</Text>
      {result.failure ? <Text testID="native-probe-failed">{result.failure}</Text> : null}
    </SafeAreaView>
  );
}
AppRegistry.registerComponent(appName, () => Probe);
