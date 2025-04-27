import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackBlackButton from 'src/assets/images/header-arrow-icon.svg';
import BackWhiteButton from 'src/assets/images/leftarrowCampainlight.svg';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import Fonts from 'src/constants/Fonts';
import InfoIcon from 'src/assets/images/info_icon.svg';
import InfoDarkIcon from 'src/assets/images/info-Dark-icon.svg';
import PrivateBackButton from 'src/assets/privateImages/gold-back-arrow.svg';
import usePlan from 'src/hooks/usePlan';

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
  learnMore?: boolean;
  learnMorePressed?: () => void;
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
  learnMore,
  learnMorePressed,
}) => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const isDarkMode = colorMode === 'dark';
  const { isOnL4 } = usePlan();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    leftContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    backButton: {
      height: hp(44),
      width: wp(28),
      justifyContent: 'center',
    },
    title: {
      fontSize: 18,
      fontFamily: Fonts.LoraMedium,
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

    infoIcon: {
      width: wp(40),
      height: wp(40),
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: wp(5),
    },
  });

  return (
    <Box width={'100%'}>
      <Box style={styles.container}>
        <Box style={styles.leftContainer}>
          {enableBack && (
            <TouchableOpacity
              testID="btn_back"
              onPress={onPressHandler || navigation.goBack}
              style={styles.backButton}
            >
              {isOnL4 ? (
                <PrivateBackButton />
              ) : colorMode === 'light' && !contrastScreen ? (
                <BackBlackButton />
              ) : (
                <BackWhiteButton />
              )}
            </TouchableOpacity>
          )}
          {title && (
            <Text color={titleColor} style={styles.title} medium>
              {title}
            </Text>
          )}
        </Box>
        {rightComponent && <Box>{rightComponent}</Box>}

        {learnMore && (
          <TouchableOpacity style={styles.infoIcon} onPress={learnMorePressed}>
            {isDarkMode ? <InfoDarkIcon /> : <InfoIcon />}
          </TouchableOpacity>
        )}
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
