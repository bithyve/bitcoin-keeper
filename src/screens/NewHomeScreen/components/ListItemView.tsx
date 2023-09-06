import React from 'react';
import { Box, Pressable, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet } from 'react-native';
import { hp, windowHeight } from 'src/constants/responsive';
import Fonts from 'src/constants/Fonts';

function ListItemView(props) {
  const { colorMode } = useColorMode();
  return (
    <Pressable
      backgroundColor={`${colorMode}.seashellWhite`}
      style={styles.wrapper}
      onPress={props.onPress}
      testID={`btn_${props.title.replace(/ /g, '_')}`}
    >
      <Box>
        <Box style={styles.iconView} backgroundColor={props.iconBackColor} testID="view_listIcon">
          {props.icon}
        </Box>
      </Box>
      <Box style={styles.titleWrapper}>
        <Text
          color={`${colorMode}.primaryText`}
          style={styles.titleText}
          testID={`text_${props.title.replace(/ /g, '_')}`}
        >
          {props.title}
        </Text>
        <Text
          color={`${colorMode}.textColor2`}
          style={styles.subTitleText}
          testID="text_listSubTitle"
        >
          {props.subTitle}
        </Text>
      </Box>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: windowHeight > 680 ? 25 : 10,
    paddingHorizontal: 18,
    width: '100%',
    borderRadius: 10,
    marginVertical: hp(5),
  },
  iconView: {
    borderRadius: 100,
    height: windowHeight > 680 ? 35 : 33,
    width: windowHeight > 680 ? 35 : 33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: {
    marginTop: 10,
  },
  titleText: {
    letterSpacing: 1.04,
    fontSize: 13,
    fontWeight: '500',
    fontFamily: Fonts.FiraSansCondensedMedium,
  },
  subTitleText: {
    fontSize: 12,
    flexWrap: 'wrap',
    width: '100%',
  },
});
export default ListItemView;
