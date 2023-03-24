import React from 'react';
import { Box } from 'native-base';
import { StyleSheet, FlatList } from 'react-native';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Note from 'src/components/Note/Note';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import SettingUp from 'src/assets/images/settingup.svg'; // Actual assert was missing in XD link  

export const enum MixStatus {
  COMPLETED = 'COMPLETED',
  INPROGRESS = 'INPROGRESS',
  NOTSTARTED = 'NOTSTARTED',
  CANCELED = 'CANCELED'
}

const DATA = [
  {
    id: '1',
    title: 'Connecting to Whirlpool',
    status: MixStatus.COMPLETED
  },
  {
    id: '2',
    title: 'Waiting for a mix',
    status: MixStatus.COMPLETED
  },
  {
    id: '3',
    title: 'Trying to join a mix',
    status: MixStatus.COMPLETED
  },
  {
    id: '4',
    title: 'Registering output',
    status: MixStatus.INPROGRESS
  },
  {
    id: '5',
    title: 'Signing',
    status: MixStatus.NOTSTARTED
  },
  {
    id: '6',
    title: 'Signed',
    status: MixStatus.NOTSTARTED
  },
  {
    id: '7',
    title: 'Mix completed successfully',
    status: MixStatus.NOTSTARTED,
    isLast: true,
  },
];

const getBackgroungColor = (status: MixStatus) => {
  switch (status) {
    case MixStatus.NOTSTARTED:
      return 'light.dustySageGreen'
    case MixStatus.COMPLETED:
      return 'light.forestGreen'
    case MixStatus.INPROGRESS:
      return null
    default:
      return null
  }
}

const TimeLine = ({ title, isLast, status }) => {
  return (
    <Box style={styles.contentWrapper}>
      <Box style={styles.timeLineWrapper}>
        <Box style={styles.circularborder}>
          {status === MixStatus.INPROGRESS ?
            <SettingUp /> :
            <Box backgroundColor={getBackgroungColor(status)} style={styles.greentDot} />
          }
        </Box>
        {isLast ? null : (
          <Box style={styles.verticalBorderWrapper}>
            <Box backgroundColor={'light.fadedblue'} style={styles.verticalBorder} />
            <Box backgroundColor={'light.fadedblue'} style={styles.verticalBorder} />
            <Box backgroundColor={'light.fadedblue'} style={styles.verticalBorder} />
          </Box>
        )}
      </Box>
      <Text color='light.secondaryText' style={styles.timeLineTitle}>{title}</Text>
    </Box>
  );
};

const MixProgress = () => {
  const renderItem = ({ item }) => (
    <TimeLine title={item.title} status={item.status} isLast={item?.isLast} />
  );
  return (
    <Box style={styles.container}>
      <ScreenWrapper>
        <HeaderTitle
          enableBack={false}
          paddingTop={hp(30)}
          headerTitleColor=""
          titleFontSize={20}
          title="Mix Progress"
          subtitle="Donot exit this app, this may take upto 2min Lorem ipsum"
        />
        <Box style={styles.timeLineContainer}>
          <FlatList
            data={DATA}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatList}
          />
        </Box>
      </ScreenWrapper>
      <Box backgroundColor={'light.mainBackground'} style={styles.note}>
        <Note title="Note:" subtitle="Make sure your phone is sufficiently charged" />
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 5
  },
  timeLineContainer: {
    paddingHorizontal: wp(5),
  },
  flatList: {
    marginTop: hp(55),
  },
  circularborder: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.fadedblue,
    borderStyle: 'dotted',
    justifyContent: 'center',
    alignItems: 'center',
    width: hp(25),
    height: hp(25),
    zIndex: 999
  },
  greentDot: {
    width: hp(19),
    height: hp(19),
    borderRadius: 50,
  },
  verticalBorderWrapper: {
    marginVertical: hp(5),
  },
  verticalBorder: {
    width: hp(5),
    height: hp(5),
    marginVertical: hp(5),
  },
  timeLineWrapper: {
    alignItems: 'center',
    marginHorizontal: wp(10)
  },
  contentWrapper: {
    flexDirection: 'row',
  },
  timeLineTitle: {
    fontSize: 17,
    letterSpacing: 0.5,
    marginLeft: wp(25),
  },
  note: {
    position: 'absolute',
    bottom: hp(20),
    marginLeft: wp(30),
    width: wp(300),
    height: hp(70)
  }
});

export default MixProgress;
