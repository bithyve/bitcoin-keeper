import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';

import { Platform } from 'react-native';

const TNF_MAP = {
  EMPTY: 0x0,
  WELL_KNOWN: 0x01,
  MIME_MEDIA: 0x02,
  ABSOLUTE_URI: 0x03,
  EXTERNAL_TYPE: 0x04,
  UNKNOWN: 0x05,
  UNCHANGED: 0x06,
  RESERVED: 0x07,
};

const RTD_MAP = {
  TEXT: 'T', // [0x54]
  URI: 'U', // [0x55]
  SMART_POSTER: 'Sp', // [0x53, 0x70]
  ALTERNATIVE_CARRIER: 'ac', //[0x61, 0x63]
  HANDOVER_CARRIER: 'Hc', // [0x48, 0x63]
  HANDOVER_REQUEST: 'Hr', // [0x48, 0x72]
  HANDOVER_SELECT: 'Hs', // [0x48, 0x73]
};
function tnfValueToName(value) {
  for (let name in TNF_MAP) {
    if (value === TNF_MAP[name]) {
      return name;
    }
  }
  return null;
}

function rtdValueToName(value) {
  value = value.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
  for (let name in RTD_MAP) {
    if (value === RTD_MAP[name]) {
      return name;
    }
  }
  return null;
}

export default class NFC {
  public static read = async (techRequest: NfcTech | NfcTech[]) => {
    try {
      const supported = await NfcManager.isSupported();
      if (supported) {
        await NfcManager.start();
        await NfcManager.requestTechnology(techRequest);
        const { ndefMessage } = await NfcManager.getTag();
        if (Platform.OS === 'ios') {
          await NfcManager.setAlertMessageIOS('Success');
        }
        await NfcManager.cancelTechnologyRequest();
        const records = ndefMessage.map((record) => {
          const tnfName = tnfValueToName(record.tnf);
          const rtdName = rtdValueToName(record.type);
          const data =
            rtdName === 'URI'
              ? Ndef.uri.decodePayload(record.payload as any)
              : rtdName === 'TEXT'
              ? Ndef.text.decodePayload(record.payload as any)
              : // ColdCard signed psbt is of type EXTERNAL_TYPE
              tnfName === 'EXTERNAL_TYPE'
              ? Buffer.from(record.payload).toString('base64')
              : JSON.parse(Buffer.from(record.payload).toString());
          return { data, rtdName, tnfName };
        });
        return records;
      }
    } catch (error) {
      console.log(error);
      if (Platform.OS === 'ios') {
        await NfcManager.setAlertMessageIOS('Something went wrong!');
      }
      await NfcManager.cancelTechnologyRequest();
      throw error;
    }
  };
  public static send = async (techRequest: NfcTech | NfcTech[], bytes: number[]) => {
    try {
      const supported = await NfcManager.isSupported();
      if (supported) {
        await NfcManager.start();
        await NfcManager.requestTechnology(techRequest);
        const data = await NfcManager.ndefHandler.writeNdefMessage(bytes);
        if (Platform.OS === 'ios') {
          await NfcManager.setAlertMessageIOS('Success');
        }
        await NfcManager.cancelTechnologyRequest();
        return { data };
      }
    } catch (error) {
      console.log(error);
      if (Platform.OS === 'ios') {
        await NfcManager.setAlertMessageIOS('Something went wrong!');
      }
      await NfcManager.cancelTechnologyRequest();
      throw error;
    }
  };
  public static encodeForColdCard = (message) => {
    return Ndef.encodeMessage([Ndef.textRecord(message)]);
  };
}
