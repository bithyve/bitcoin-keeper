import { StyleSheet } from 'react-native';
import React, { useContext } from 'react';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const FeeDataSource = () => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  return (
    <Box style={styles.container}>
      <Text style={styles.label} color={`${colorMode}.inActiveMsg`}>
        {settings.dataSource}
      </Text>
    </Box>
  );
};

export default FeeDataSource;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 5,
  },
  label: {
    fontSize: 10,
    letterSpacing: 1,
    textAlign: 'center',
  },
});
