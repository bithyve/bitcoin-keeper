import React from 'react';
import { Box } from 'native-base';
import { StyleSheet, View, Text, FlatList } from 'react-native';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Note from 'src/components/Note/Note';

const TimeLine = ({ title, bgColor = '#008369', isLast }) => {
  return (
    <View style={styles.contentWrapper}>
      <View style={styles.timeLineWrapper}>
        <View style={styles.circularborder}>
          <View style={{ ...styles.greentDot, backgroundColor: bgColor }} />
        </View>
        {isLast ? null : (
          <View style={styles.verticalBorderWrapper}>
            <View style={styles.verticalBorder} />
            <View style={styles.verticalBorder} />
            <View style={styles.verticalBorder} />
          </View>
        )}
      </View>
      <Text style={styles.timeLineTitle}>{title}</Text>
    </View>
  );
};

const DATA = [
  {
    id: '1',
    title: 'Connecting to Whirlpool',
  },
  {
    id: '2',
    title: 'Waiting for a mix',
  },
  {
    id: '3',
    title: 'Trying to join a mix',
  },
  {
    id: '4',
    title: 'Registering output',
    bgColor: '#8BA099',
  },
  {
    id: '5',
    title: 'Signing',
    bgColor: '#8BA099',
  },
  {
    id: '6',
    title: 'Signed',
    bgColor: '#8BA099',
  },
  {
    id: '7',
    title: 'Mix completed successfully',
    bgColor: '#8BA099',
    isLast: true,
  },
];

const MixProgress = () => {
  const renderItem = ({ item }) => (
    <TimeLine title={item.title} bgColor={item.bgColor} isLast={item.isLast} />
  );
  return (
    <Box style={styles.container}>
      <ScreenWrapper>
        <HeaderTitle
          enableBack={false}
          paddingTop={30}
          headerTitleColor=""
          titleFontSize={20}
          title="Mix Progress"
          subtitle="Donot exit this app, this may take upto 2min Lorem ipsum"
        />
        <View style={styles.timeLineContainer}>
          <FlatList
            data={DATA}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatList}
          />
          <Note title="Note:" subtitle="Make sure your phone is sufficiently charged" />
        </View>
      </ScreenWrapper>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timeLineContainer: {
    paddingHorizontal: 24,
  },
  flatList: {
    marginVertical: 55,
  },
  circularborder: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#002C27',
    borderStyle: 'dotted',
    justifyContent: 'center',
    alignItems: 'center',
    width: 25,
    height: 25,
  },
  greentDot: {
    width: 19,
    height: 19,
    borderRadius: 50,
  },
  verticalBorderWrapper: {
    marginVertical: 8,
  },
  verticalBorder: {
    width: 5,
    height: 5,
    backgroundColor: '#B7C9C4',
    marginVertical: 5,
  },

  timeLineWrapper: {
    alignItems: 'center',
  },
  contentWrapper: {
    flexDirection: 'row',
  },
  timeLineTitle: {
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.5,
    fontWeight: '400',
    marginLeft: 30,
    color: '#5F6965',
  },
});

export default MixProgress;
