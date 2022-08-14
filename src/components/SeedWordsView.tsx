import { Box, Text } from 'native-base';

import BackButton from 'src/assets/images/svgs/back.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

type Props = {
  title?: string;
  subtitle?: string;
  onPressHandler?: () => void;
  enableBack?: boolean;
};
const SeedWordsView = ({ title = '', subtitle = '', onPressHandler, enableBack = true }: Props) => {
  const navigation = useNavigation();
  return (
    <Box style={styles.container}>
      {enableBack && (
        <TouchableOpacity
          onPress={onPressHandler ? onPressHandler : navigation.goBack}
          style={styles.back}
        >
          <BackButton />
        </TouchableOpacity>
      )}
      <Box>
        {title && (
          <Text
            numberOfLines={1}
            style={styles.addWalletText}
            color={'#00715B'}
            fontFamily={'body'}
            fontWeight={'200'}
            fontSize={19}
          >
            {title}
          </Text>
        )}
        {subtitle && (
          <Text
            numberOfLines={1}
            style={styles.addWalletDescription}
            color={'light.lightBlack'}
            fontFamily={'body'}
            fontWeight={'100'}
            fontSize={12}
          >
            {subtitle}
          </Text>
        )}
      </Box>
    </Box>
  );
};

const styles = ScaledSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  addWalletText: {
    fontSize: RFValue(16),
    lineHeight: '23@s',
    letterSpacing: '0.8@s',
    paddingHorizontal: '10@s',
    paddingTop: '15@s',
  },
  addWalletDescription: {
    fontSize: RFValue(12),
    lineHeight: '17@s',
    letterSpacing: '0.5@s',
    paddingHorizontal: '10@s',
    paddingBottom: '25@s',
  },
  back: {
    paddingHorizontal: '5@s',
    paddingVertical: '15@s',
  },
});
export default SeedWordsView;
