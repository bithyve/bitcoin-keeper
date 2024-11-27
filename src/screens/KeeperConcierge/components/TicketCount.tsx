import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import TicketLight from 'src/assets/images/ticket-light.svg';
import TicketDark from 'src/assets/images/ticket-dark.svg';

const TicketCount = ({ count }: { count: number }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const TicketIcon = isDarkMode ? TicketDark : TicketLight;

  return (
    <Box style={styles.container}>
      <TicketIcon />
      <Text medium fontSize={11} color={`${colorMode}.labelColor2`}>
        {count} {count > 0 ? 'free' : ''}
      </Text>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
});

export default TicketCount;
