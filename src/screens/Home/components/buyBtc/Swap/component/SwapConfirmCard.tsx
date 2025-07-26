import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import HexagonIcon from 'src/components/HexagonIcon';
import Text from 'src/components/KeeperText';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';

type Props = { rightComponent?: any; icon?: any; text?: string; subText?: string };

const SwapConfirmCard = ({ rightComponent, icon, text, subText }: Props) => {
  const HexagonIconColor = ThemedColor({ name: 'HexagonIcon' });
  const { colorMode } = useColorMode();

  return (
    <Box style={styles.container} backgroundColor={`${colorMode}.textInputBackground`}>
      <Box style={styles.iconContainer}>
        {icon ? (
          <HexagonIcon width={44} height={38} backgroundColor={HexagonIconColor} icon={icon} />
        ) : null}
        <Box style={styles.textContainer}>
          <Text fontSize={14} medium>
            {text}
          </Text>
          <Text>{subText}</Text>
        </Box>
      </Box>
      {rightComponent ? rightComponent() : null}
    </Box>
  );
};

export default SwapConfirmCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    margin: 20,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textContainer: {
    gap: 5,
  },
});
