import React from 'react';
import { Box } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { hp } from 'src/common/data/responsiveness/responsive';

function ListItemView(props) {
  return (
    <TouchableOpacity style={styles.wrapper} backgroundColor="light.white" onPress={props.onPress}>
      <Box style={styles.iconWrapper}>
        <Box style={styles.iconView} backgroundColor="light.learnMoreBorder">
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
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconView: {
    borderRadius: 100,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: {
    width: '85%',
  },
  titleText: {
    fontSize: 13,
    fontWeight: '500',
  },
  subTitleText: {
    fontSize: 12,
  },
});
export default ListItemView;
