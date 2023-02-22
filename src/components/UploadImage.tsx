import React from 'react';
import { Box, useColorMode } from 'native-base';

import Text from 'src/components/KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';

import ImageIcon from 'src/assets/images/image.svg';

type Props = {
  onPress: () => void
}

function UploadImage(
  {
    onPress = () => { }
  }: Props
) {
  const { colorMode } = useColorMode();
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={onPress}
      style={{
        alignItems: 'center'
      }}
    >
      <Box
        variant="linearGradient"
        style={styles.container}
      >
        <ImageIcon />
        <Text
          style={styles.text}
          color={`${colorMode}.white`}
        >
          Upload from gallery
        </Text>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center'
  },
  text: {
    letterSpacing: 0.6,
    fontSize: 12,
    marginLeft: 5
  }
})

export default UploadImage;
