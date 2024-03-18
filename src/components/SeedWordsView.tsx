import { Box, useColorMode } from 'native-base';

import BackButton from 'src/assets/images/back.svg';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Text from 'src/components/KeeperText';

type Props = {
  title?: string;
  subtitle?: string;
  onPressHandler?: () => void;
  enableBack?: boolean;
};
function SeedWordsView({ title = '', subtitle = '', onPressHandler, enableBack = true }: Props) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  return (
    <Box style={styles.container}>
      {enableBack && (
        <TouchableOpacity onPress={onPressHandler || navigation.goBack} style={styles.back}>
          <BackButton />
        </TouchableOpacity>
      )}
      <Box>
        {title && (
          <Text
            numberOfLines={1}
            style={styles.addWalletText}
            color={`${colorMode}.greenText2`}
            fontSize={19}
          >
            {title}
          </Text>
        )}
        {subtitle && (
          <Text
            numberOfLines={1}
            style={styles.addWalletDescription}
            color={`${colorMode}.primaryText`}
            light
            fontSize={12}
          >
            {subtitle}
          </Text>
        )}
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  addWalletText: {
    fontSize: 16,
    lineHeight: 23,
    letterSpacing: 0.8,
    paddingHorizontal: 10,
    paddingTop: 15,
  },
  addWalletDescription: {
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0.5,
    paddingHorizontal: 10,
    paddingBottom: 25,
  },
  back: {
    paddingHorizontal: 5,
    paddingVertical: 15,
  },
});
export default SeedWordsView;
