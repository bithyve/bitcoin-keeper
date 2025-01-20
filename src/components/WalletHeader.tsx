import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackBlackButton from 'src/assets/images/header-arrow-icon.svg';
import BackWhiteButton from 'src/assets/images/back_white.svg';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';

type Props = {
  title?: string;
  enableBack?: boolean;
  onPressHandler?: () => void;
  titleColor?: string;
  contrastScreen?: boolean;
  data?: any;
  rightComponent: any;
};

const WalletHeader: React.FC<Props> = ({
  title = '',
  enableBack = true,
  onPressHandler,
  titleColor,
  contrastScreen = false,
  rightComponent,
}) => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      height: hp(44),
      width: wp(28),
      justifyContent: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
    },

    settingBtn: {
      paddingHorizontal: 22,
      paddingVertical: 22,
    },
  });

  return (
    <Box>
      <Box style={styles.container}>
        <Box style={styles.leftContainer}>
          {enableBack && (
            <TouchableOpacity
              testID="btn_back"
              onPress={onPressHandler || navigation.goBack}
              style={styles.backButton}
            >
              {colorMode === 'light' && !contrastScreen ? <BackBlackButton /> : <BackWhiteButton />}
            </TouchableOpacity>
          )}
          {title && (
            <Text color={titleColor} style={styles.title}>
              {title}
            </Text>
          )}
        </Box>

        <Box>{rightComponent}</Box>
      </Box>
    </Box>
  );
};

export default WalletHeader;
