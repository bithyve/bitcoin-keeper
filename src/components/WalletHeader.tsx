import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackBlackButton from 'src/assets/images/header-arrow-icon.svg';
import BackWhiteButton from 'src/assets/images/leftarrowCampainlight.svg';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import Fonts from 'src/constants/Fonts';

type Props = {
  title?: string;
  enableBack?: boolean;
  onPressHandler?: () => void;
  titleColor?: string;
  contrastScreen?: boolean;
  data?: any;
  rightComponent?: any;
  subTitle?: string;
  subtitleColor?: string;
};

const WalletHeader: React.FC<Props> = ({
  title = '',
  enableBack = true,
  onPressHandler,
  titleColor,
  contrastScreen = false,
  rightComponent,
  subTitle,
  subtitleColor,
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
      fontFamily: Fonts.InterMedium,
    },
    subTitle: {
      fontSize: 14,
      marginTop: 10,
      width: '90%',
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
            <Text color={titleColor} style={styles.title} medium>
              {title}
            </Text>
          )}
        </Box>

        {rightComponent && <Box>{rightComponent}</Box>}
      </Box>
      {subTitle && (
        <Text color={subtitleColor} style={styles.subTitle}>
          {subTitle}
        </Text>
      )}
    </Box>
  );
};

export default WalletHeader;
