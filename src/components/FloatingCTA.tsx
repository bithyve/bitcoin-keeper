import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';
import Buttons from 'src/components/Buttons';
import { useNavigation } from '@react-navigation/native';

type FloatingCTAProps = {
  primaryText: string;
  primaryCallback: any;
  primaryDisable?: boolean;
  primaryLoading?: boolean;
  secondaryText?: string;
  secondaryCallback?: any;
};

const FloatingCTA = ({
  primaryDisable,
  primaryText,
  primaryCallback,
  secondaryText,
  secondaryCallback,
  primaryLoading,
}: FloatingCTAProps) => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  secondaryCallback = secondaryCallback || navigation.goBack;

  return (
    <Box style={styles.bottomContainer} backgroundColor={`${colorMode}.primaryBackground`}>
      <Buttons
        primaryDisable={primaryDisable}
        primaryText={primaryText}
        primaryCallback={primaryCallback}
        secondaryText={secondaryText}
        secondaryCallback={secondaryCallback}
        primaryLoading={primaryLoading}
      />
    </Box>
  );
};

export default FloatingCTA;

const styles = StyleSheet.create({
  bottomContainer: {
    marginHorizontal: '5%',
    paddingTop: '5%',
  },
});
