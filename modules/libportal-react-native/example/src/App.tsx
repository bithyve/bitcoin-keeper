import React, { useState } from 'react';
import { Platform, View, Button, Text, TouchableOpacity, StyleSheet } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { PortalSdk, type NfcOut, type CardStatus } from 'libportal-react-native';

const sdk = new PortalSdk(true);
let paused = false;

function livenessCheck(): Promise<NfcOut> {
  return new Promise((_resolve, reject) => {
    const interval = setInterval(() => {
      if (paused) {
        return;
      }

      NfcManager.getTag()
        .then(() => NfcManager.transceive([0x30, 0xED]))
        .catch(() => {
          NfcManager.cancelTechnologyRequest({ delayMsAndroid: 0 });
          clearInterval(interval);

          reject("Removed tag");
        }); 
    }, 250);
  });
}

async function manageTag() {
  await sdk.newTag();
  const check = Platform.select({
    ios: () => new Promise(() => {}),
    android: () => livenessCheck(),
  })();

  while (true) {
    const msg = await Promise.race([sdk.poll(), check]);
    // console.trace('>', msg.data);
    if (!paused) {
      const result = await NfcManager.nfcAHandler.transceive(msg.data);
      // console.trace('<', result);
      await sdk.incomingData(msg.msgIndex, result);
    }
  }
}

async function restartPolling() {
  const timeout = new Promise((_, rej) => setTimeout(rej, 250));

  paused = true;
  return Promise.race([NfcManager.restartTechnologyRequestIOS(), timeout])
    .finally(() => {
      paused = false;
    });
}

async function getOneTag() {
  console.info('Looking for a Portal...');
  paused = false;

  if (Platform.OS === 'android') {
    await NfcManager.registerTagEvent();
  }
  await NfcManager.requestTechnology(NfcTech.NfcA, {});
  if (Platform.OS === 'ios') {
    restartInterval = setInterval(restartPolling, 17500);
  }

  let restartInterval = null;
  while (true) {
    try {
      await manageTag();
    } catch (ex) {
      console.warn('Oops!', ex);
    }

    // Try recovering the tag on iOS
    if (Platform.OS === 'ios') {
      try {
        await restartPolling();
      } catch (_ex) {
        if (restartInterval) {
          clearInterval(restartInterval);
        }

        NfcManager.invalidateSessionWithErrorIOS('Portal was lost');
        break;
      }
    } else {
      NfcManager.cancelTechnologyRequest({ delayMsAndroid: 0 });
      break;
    }
  }
}

async function listenForTags() {
  while (true) {
    await getOneTag();
  }
}

NfcManager.isSupported()
  .then((value) => {
    if (value) {
      NfcManager.start();

      // On Android we can listen for tags in background
      if (Platform.OS === 'android') {
        return listenForTags();
      }

    } else {
      throw "NFC not supported";
    }
  });

function App() {
  const [status, setStatus] = useState<CardStatus | null>(null);
  async function getStatus() {
    // on iOS we have to explicitly open the NFC popup...
    if (Platform.OS === 'ios') {
      getOneTag();
    }

    setStatus(await sdk.getStatus());

    // ... and close it at the end
    if (Platform.OS === 'ios') {
      NfcManager.cancelTechnologyRequest({ delayMsAndroid: 0 });
    }
  }

  function resetStatus() {
    setStatus(null);
  }

  return (
    <View style={styles.wrapper}>
      <Button title="getStatus" onPress={getStatus}>
        <Text>getStatus()</Text>
      </Button>
      <Button title="resetStatus" onPress={resetStatus}>
        <Text>resetStatus()</Text>
      </Button>

      <Text>{ JSON.stringify(status) }</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
