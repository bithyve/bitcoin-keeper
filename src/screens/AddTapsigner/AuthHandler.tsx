import { Box, Text } from 'native-base';
import { StyleSheet, View } from 'react-native';

import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';

const AuthHandler = ({ status, withModal, card, wrapper, setStatus }) => {
  const isCardBlocked = status ? !!status.auth_delay : false;
  if (!isCardBlocked) return null;
  const text = isCardBlocked ? `Looks like you've crossed the CVC rate limit!` : '';

  const unlockCard = async () => {
    const updatedStatus = await wrapper(async () => {
      for (let i = 0; i < status.auth_delay; i++) {
        await card.wait();
      }
      return card.first_look();
    });
    setStatus(updatedStatus);
  };
  const fixAuthDelay = () => {
    withModal(unlockCard)();
  };
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
