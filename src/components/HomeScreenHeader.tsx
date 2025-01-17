import React from 'react';
import { StyleSheet } from 'react-native';
import { Box } from 'native-base';
import { hp, wp } from 'src/constants/responsive';
import Text from './KeeperText';
import { TouchableOpacity } from 'react-native-gesture-handler';
import NotificationIcon from 'src/assets/images/header-notification-icon.svg';
import NotificationSimpleIcon from 'src/assets/images/header-notification-simple-icon.svg';
import { capitalizeEachWord } from 'src/utils/utilities';

interface HomeScreenHeaderProps {
  colorMode: string;
  circleIconWrapper: React.ReactNode;
  title: string;
}

const HomeScreenHeader: React.FC<HomeScreenHeaderProps> = ({
  colorMode,
  circleIconWrapper,
  title,
}) => {
  return (
    <Box backgroundColor={`${colorMode}.pantoneGreen`} style={[styles.wrapper]}>
      <Box width="90%" style={styles.padding}>
        <Box style={styles.headerData} testID={`btn_choosePlan`}>
          {circleIconWrapper}
          <Text
            testID="text_home_current_plan"
            style={styles.headerText}
            color={`${colorMode}.choosePlanHome`}
            medium
          >
            {capitalizeEachWord(title)}
          </Text>
        </Box>
        <Box style={styles.headerData}>
          <TouchableOpacity style={{ padding: 5 }} testID="btn_settings">
            {/* <NotificationIcon /> */}
            <NotificationSimpleIcon />
          </TouchableOpacity>
        </Box>
      </Box>
    </Box>
  );
};

export default HomeScreenHeader;

const styles = StyleSheet.create({
  padding: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wrapper: {
    paddingHorizontal: wp(5),
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    minHeight: hp(127),
  },
  headerData: {
    paddingTop: wp(68),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    fontSize: 18,
  },
});
