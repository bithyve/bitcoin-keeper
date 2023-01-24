/* eslint-disable no-nested-ternary */
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { SignerType } from 'src/core/wallets/enums';
import React from 'react';
import { Box } from 'native-base';

const enum SignerTag {
  REGISTER_VAULT = 'REGISTER VAULT',
  HOT_KEYS = 'HOT KEYS',
  BLIND_SIGNER = 'BLIND SIGNER',
}

function Tag({ text }: { text: string }) {
  const color =
    text === SignerTag.BLIND_SIGNER
      ? '#DCDEBE'
      : text === SignerTag.REGISTER_VAULT
      ? '#D4BBD8'
      : '#CFD8D7';
  return (
    <Box style={[styles.wrapper]}>
      <Text style={[styles.text, { backgroundColor: color }]} bold>
        {text}
      </Text>
    </Box>
  );
}
function SDTag({ type }: { type: SignerType }) {
  switch (type) {
    case SignerType.COLDCARD: {
      return <Tag text={SignerTag.REGISTER_VAULT} />;
    }
    case SignerType.JADE: {
      return null;
    }
    case SignerType.KEEPER: {
      return <Tag text={SignerTag.HOT_KEYS} />;
    }
    case SignerType.KEYSTONE: {
      return <Tag text={SignerTag.REGISTER_VAULT} />;
    }
    case SignerType.LEDGER: {
      return <Tag text={SignerTag.REGISTER_VAULT} />;
    }
    case SignerType.MOBILE_KEY: {
      return <Tag text={SignerTag.HOT_KEYS} />;
    }
    case SignerType.PASSPORT: {
      return <Tag text={SignerTag.REGISTER_VAULT} />;
    }
    case SignerType.POLICY_SERVER: {
      return <Tag text={SignerTag.HOT_KEYS} />;
    }
    case SignerType.SEEDSIGNER: {
      return <Tag text={SignerTag.REGISTER_VAULT} />;
    }
    case SignerType.SEED_WORDS: {
      return <Tag text={SignerTag.BLIND_SIGNER} />;
    }
    case SignerType.TAPSIGNER: {
      return <Tag text={SignerTag.BLIND_SIGNER} />;
    }
    case SignerType.TREZOR: {
      return null;
    }
    default:
      return null;
  }
}

export default SDTag;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    marginRight: 20,
    marginTop: 6,
  },
  text: {
    fontSize: 8,
    paddingVertical: 0,
    lineHeight: 16,
    padding: 4,
    letterSpacing: 0.8,
    borderRadius: 5,
  },
});
