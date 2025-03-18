import React, { useContext } from 'react';
import { Box, HStack, Pressable, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import DotIcon from 'src/assets/images/dot-cream.svg';
import { StyleSheet } from 'react-native';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const AppStatus = ({ setShowModal }) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  return (
    <Box>
      <Pressable onPress={() => setShowModal(true)}>
        <Box
          style={styles.statusContainer}
          backgroundColor={`${colorMode}.appStatusButtonBackground`}
          borderColor={`${colorMode}.greyBorder`}
        >
          <HStack style={styles.contentContainer}>
            <DotIcon />
            <Text color={`${colorMode}.appStatusTextColor`} style={styles.textStyle}>
              {common.offline}
            </Text>
          </HStack>
        </Box>
      </Pressable>
    </Box>
  );
};

const styles = StyleSheet.create({
  statusContainer: {
    width: 68,
    height: 27,
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2.5,
  },
  textStyle: {
    fontSize: 12,
    lineHeight: 17,
  },
});

export default AppStatus;
