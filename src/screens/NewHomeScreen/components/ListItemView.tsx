import React from 'react';
import { Box } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { hp } from 'src/common/data/responsiveness/responsive';

function ListItemView(props) {
  return (
    <TouchableOpacity style={[styles.wrapper, { backgroundColor: "#FDF7F0" }]} onPress={props.onPress}>
      <Box style={styles.iconWrapper}>
        <Box style={styles.iconView} backgroundColor={props.iconBackColor}>
          {props.icon}
        </Box>
      </Box>
      <Box style={styles.titleWrapper}>
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
    paddingVertical: 15,
    flexDirection: 'row',
    width: '100%',
    borderRadius: 10,
    marginVertical: hp(5),
  },
  iconWrapper: {
    width: '10%',
    alignItems: 'flex-start',
  },
  iconView: {
    borderRadius: 100,
    height: 35,
    width: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: {
    width: '90%',
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
