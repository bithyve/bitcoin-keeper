import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import ShopIcon from 'src/assets/images/shop-icon.svg';
import LocationIcon from 'src/assets/images/Map-pin-icon.svg';
import LocationIconDark from 'src/assets/images/MapPin.svg';
import openLink from 'src/utils/OpenLink';

type Props = {
  title: string;
  subTitle: string;
  location: string;
  icon?: Element;
  plan?: any;
  subscribeText?: string;
  unSubscribeText?: string;
  link?: string;
  buttonText?: string;
};

const ResellerCard = (props: Props) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  return (
    <Box
      style={styles.container}
      backgroundColor={`${colorMode}.textInputBackground`}
      borderColor={`${colorMode}.separator`}
      borderWidth={1}
    >
      <Box style={styles.primaryContainer}>
        <Box backgroundColor={`${colorMode}.backgroundbitSaga`} style={styles.iconWrapper}>
          {props.icon}
        </Box>
        <Box style={styles.textContainer}>
          <Text fontSize={16} color={`${colorMode}.primaryText`} semiBold>
            {props.title}
          </Text>
          <Box style={styles.locationContainer}>
            {isDarkMode ? <LocationIconDark /> : <LocationIcon />}
            <Text fontSize={13} color={`${colorMode}.locationgrey`}>
              {props.location}
            </Text>
          </Box>
          <Text
            fontSize={13}
            color={isDarkMode ? `${colorMode}.secondaryCreamWhite` : `${colorMode}.primaryText`}
            style={styles.subTitle}
          >
            {props.subTitle}
          </Text>
        </Box>
      </Box>
      <Box>
        <Buttons
          primaryText={props.buttonText}
          primaryBackgroundColor={`${colorMode}.SeaweedGreen`}
          fullWidth
          paddingVertical={hp(10)}
          primaryFontWeight="medium"
          RightIcon={ShopIcon}
          borderRadius={6}
          primaryCallback={() => openLink(props.link)}
        />
        {props.plan ? (
          props.unSubscribeText ? (
            <Text
              style={[props.unSubscribeText ? styles.subText : {}]}
              semiBold
              fontSize={12}
              color={isDarkMode ? `${colorMode}.secondaryCreamWhite` : `${colorMode}.coalGreen`}
            >
              {props.unSubscribeText}
            </Text>
          ) : null
        ) : props.subscribeText ? (
          <Text
            semiBold
            fontSize={12}
            color={isDarkMode ? `${colorMode}.secondaryCreamWhite` : `${colorMode}.primaryBrown`}
            style={[props.subscribeText ? styles.subText : {}]}
          >
            {props.subscribeText}
          </Text>
        ) : null}
      </Box>
    </Box>
  );
};

export default ResellerCard;

const styles = StyleSheet.create({
  container: {
    borderRadius: wp(10),
    paddingVertical: hp(20),

    paddingHorizontal: wp(18),
    border: 1,
    gap: wp(10),
  },
  primaryContainer: {
    flexDirection: 'row',
    gap: wp(10),
  },
  textContainer: {
    flexShrink: 1,
    maxWidth: '90%',
  },
  iconWrapper: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },

  subText: {
    marginTop: hp(10),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginBottom: hp(8),
    marginTop: hp(4),
  },
  subTitle: {
    width: '90%',
  },
});
