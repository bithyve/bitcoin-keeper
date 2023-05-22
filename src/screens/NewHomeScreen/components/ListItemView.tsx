import React from 'react';
import { Box } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { hp, windowHeight } from 'src/common/data/responsiveness/responsive';

function ListItemView(props) {
  return (
    <TouchableOpacity disabled={props.disabled} style={[styles.wrapper, { backgroundColor: "#FDF7F0", opacity: props.disabled ? 0.8 : 1 }]} onPress={props.onPress}>
      <Box style={styles.iconWrapper}>
        <Box style={[styles.iconView, { opacity: props.disabled ? 0.8 : 1 }]} backgroundColor={props.iconBackColor}>
          {props.icon}
        </Box>
      </Box>
      <Box style={[styles.titleWrapper, { opacity: props.disabled ? 0.8 : 1 }]}>
        <Text color="light.primaryText" style={styles.titleText}>
          {props.title}
        </Text>
        <Text color="light.primaryText" style={styles.subTitleText}>
          {props.subTitle}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 10,
    paddingVertical: windowHeight > 680 ? 15 : 5,
    flexDirection: 'row',
    width: '100%',
    borderRadius: 10,
    marginVertical: hp(5),
    alignItems: 'center'
  },
  iconWrapper: {
    width: '10%',
    alignItems: 'flex-start',
  },
  iconView: {
    borderRadius: 100,
    height: windowHeight > 680 ? 35 : 33,
    width: windowHeight > 680 ? 35 : 33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: {
    width: '92%',
    marginLeft: 25,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '500',
  },
  subTitleText: {
    fontSize: 12,
    flexWrap: 'wrap',
    width: '100%',
  },
});
export default ListItemView;
