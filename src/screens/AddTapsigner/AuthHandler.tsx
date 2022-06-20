import { Box, Text } from 'native-base';

import React from 'react';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

const AuthHandler = ({ status, fixAuthDelay }) => {
  const isCardBlocked = status ? !!status.auth_delay : false;
  if (!isCardBlocked) return null;
  const text = isCardBlocked ? `Looks like you've crossed the CVC rate limit!` : '';

  return (
    <Box p={2}>
      <Text
        color={'error.500'}
        fontSize={16}
        fontFamily={'body'}
        fontWeight={'300'}
        letterSpacing={1}
        textAlign={'center'}
      >
        {text}
      </Text>
      <Text
        fontSize={12}
        fontFamily={'body'}
        fontWeight={'200'}
        letterSpacing={1}
        textAlign={'center'}
      >
        {'Hold the card for about 15 seconds to unlock it.'}
      </Text>
      <TouchableOpacity onPress={fixAuthDelay}>
        <Text
          fontSize={16}
          fontFamily={'body'}
          fontWeight={'300'}
          letterSpacing={1}
          textAlign={'center'}
        >
          {'Unlock'}
        </Text>
      </TouchableOpacity>
    </Box>
  );
};

export default AuthHandler;

const styles = StyleSheet.create({
  textCenter: {
    textAlign: 'center',
    padding: 10,
  },
});
