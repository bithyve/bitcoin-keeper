import React from 'react';
import { FlatList } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

import HexaBottomSheet from 'src/components/BottomSheet';
import BackupListComponent from './BackupListComponent';

const HardwareSheet = ({ bottomSheetRef, Data, onPress }) => {
  const renderItem = ({ item }) => {
    return (
      <BackupListComponent
        title={item.title}
        subtitle={item.subtitle}
        Icon={item.Icon}
        item={item}
        onPress={onPress}
        showAccordian
        touchable
      />
    );
  };
  return (
    <HexaBottomSheet
      bottomSheetRef={bottomSheetRef}
      title="Add Hardware Wallet"
      subTitle={'Lorem Ipsum Dolor Amet'}
      snapPoints={['85%']}
    >
      <FlatList
        style={{ marginTop: hp(2) }}
        showsVerticalScrollIndicator={false}
        data={Data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </HexaBottomSheet>
  );
};

export default HardwareSheet;
