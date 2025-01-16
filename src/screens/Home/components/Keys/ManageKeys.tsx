import { CommonActions, useNavigation } from '@react-navigation/native';
import { Box, useColorMode } from 'native-base';
import React from 'react';
import DashedCta from 'src/components/DashedCta';
import Plus from 'src/assets/images/add-plus-white.svg';

import Colors from 'src/theme/Colors';
import { StyleSheet, ViewStyle } from 'react-native';
import { wp } from 'src/constants/responsive';

const ManageKeys = () => {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  const customStyle: ViewStyle = {
    width: wp(162),
    minHeight: wp(135),
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  };

  return (
    <Box style={styles.containerWrapper}>
      <DashedCta
        backgroundColor={
          isDarkMode ? `${colorMode}.DashedButtonCta` : `${colorMode}.DashedButtonCta`
        }
        hexagonBackgroundColor={isDarkMode ? Colors.pantoneGreen : Colors.pantoneGreen}
        textColor={isDarkMode ? Colors.White : Colors.pantoneGreen}
        name="Add keys"
        callback={() => navigation.dispatch(CommonActions.navigate('SignerCategoryList', {}))}
        icon={<Plus width={12.9} height={12.9} />}
        iconWidth={33}
        iconHeight={30}
        customStyle={customStyle}
      />
    </Box>
  );
};

export default ManageKeys;
const styles = StyleSheet.create({
  containerWrapper: {
    width: '100%',
    flexWrap: 'wrap',
    flex: 1,
  },
});
