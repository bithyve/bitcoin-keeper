import { StyleSheet } from 'react-native';
import React from 'react';
import { FlatList } from 'react-native';
import { Box, VStack, useColorMode } from 'native-base';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';
import Text from 'src/components/KeeperText';
import { getSignerNameFromType } from 'src/hardware';

const AppSigners = ({ keys }) => {
  const { colorMode } = useColorMode();
  return (
    <VStack style={styles.container} backgroundColor={`${colorMode}.seashellWhite`}>
      <Box style={styles.infoContainer}>
        <Text style={styles.keyInfo} color={`${colorMode}.primaryText`}>
          <Text color={`${colorMode}.primaryText`} bold>
            {`${keys.length > 0 && keys.length < 10 ? '0' : ''}${keys.length} `}
          </Text>
          {keys.length ? 'Keys' : 'Key'}
        </Text>
      </Box>
      <FlatList
        data={keys}
        keyExtractor={(item) => item.signerId}
        horizontal
        renderItem={({ item: signer }) => {
          return (
            <VStack>
              <Box
                backgroundColor={`${colorMode}.pantoneGreen`}
                style={styles.vaultSigner}
                key={signer.signerId}
              >
                {SDIcons(signer.type, colorMode !== 'dark').Icon}
              </Box>
              <Text color={`${colorMode}.primaryText`} bold style={styles.signerInfo}>
                {`${getSignerNameFromType(signer.type)}`}
              </Text>
            </VStack>
          );
        }}
      />
    </VStack>
  );
};

export { AppSigners };

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -20,
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 2,
    borderColor: '#E3E3E3',
  },
  vaultSigner: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    width: 40,
    height: 40,
    borderRadius: 40,
  },
  infoContainer: {
    paddingVertical: 20,
  },
  keyInfo: {
    fontSize: 22,
    letterSpacing: 0.22,
  },
  signerInfo: {
    fontSize: 11,
    letterSpacing: 1,
    textAlign: 'center',
  },
});
