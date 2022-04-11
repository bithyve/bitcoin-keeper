import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { View } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import uuid from 'react-native-uuid';

import StatusBarComponent from 'src/components/StatusBarComponent';
import HeaderTitle from 'src/components/HeaderTitle';
import BackupListComponent from 'src/components/BackupListComponent';
import HardwareSheet from 'src/components/HardwareSheet';
import { HardwareData, Data, getIcon } from 'src/common/data/backup/backupdata';
import SuccessSheet from 'src/components/SuccessSheet';
import useBottomSheetUtils from 'src/hooks/useBottomSheetUtils';
import QrSheet from 'src/components/QrSheet';
import HardwareInputSheet from 'src/components/HardwareInputSheet';

const BackupScreen = ({ }) => {
  let index = -1;

  const navigtaion = useNavigation();
  const [backUpKeyType, setBackUpKeyType] = useState();
  const addBackUpKeySheetRef = useRef(null);
  const hardwareSheetRef = useRef(null);
  const successSheetRef = useRef(null);
  const addBackUpKeyHardwareSheetRef = useRef(null);
  const { openSheet: openAddBackUpKeyHardwareSheet, closeSheet: closeAddBackUpKeyHardwareSheet } =
    useBottomSheetUtils(addBackUpKeyHardwareSheetRef);

  const [data, setData] = useState({});

  useEffect(() => {
    if (index == -1) {
      setData({});
    }
  }, [index]);

  const expandAddBackUpKeySheet = useCallback((item) => {
    setData({ ...item, baseIcon: item.Icon, Icon: getIcon(item.id), id: uuid.v4() });
    if (item.id == 5) {
      hardwareSheetRef.current?.expand();
    }
    if (item.id !== 5 && item.id >= 1 && item.id <= 7) {
      setBackUpKeyType(item);
      addBackUpKeySheetRef.current?.expand();
    } else if (item.id >= 8 && item.id <= 12) {
      setBackUpKeyType(item);
      hardwareSheetRef.current?.close();
      openAddBackUpKeyHardwareSheet();
    }
  }, []);

  const closeAddBackUpKeySheet = useCallback(() => {
    addBackUpKeySheetRef.current?.close();
    data && successSheetRef.current.expand();
  }, []);

  const renderItem = ({ item }) => {
    return (
      <BackupListComponent
        title={item.title}
        subtitle={item.subtitle}
        Icon={item.Icon}
        item={item}
        onPress={expandAddBackUpKeySheet}
        showAccordian
        touchable
      />
    );
  };

  return (
    <View style={styles.Container} background={'light.lightYellow'}>
      <StatusBarComponent padding={50} />
      <HeaderTitle
        title="Add a Backup Key"
        subtitle="Strengthen your security"
        onPressHandler={() => navigtaion.navigate('Home', data)}
      />
      <FlatList
        style={{ marginTop: hp(2) }}
        showsVerticalScrollIndicator={false}
        data={Data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />

      <QrSheet
        backUpKeyType={backUpKeyType}
        expandAddBackUpKeySheet={expandAddBackUpKeySheet}
        addBackUpKeySheetRef={addBackUpKeySheetRef}
        closeAddBackUpKeySheet={closeAddBackUpKeySheet}
        index={index} />

      <HardwareInputSheet
        backUpKeyType={backUpKeyType}
        expandAddBackUpKeySheet={expandAddBackUpKeySheet}
        closeAddBackUpKeyHardwareSheet={closeAddBackUpKeyHardwareSheet}
        successSheetRef={successSheetRef}
        index={index}
        addBackUpKeyHardwareSheetRef={addBackUpKeyHardwareSheetRef}
      />

      <HardwareSheet
        bottomSheetRef={hardwareSheetRef}
        Data={HardwareData}
        onPress={expandAddBackUpKeySheet}
      />
      <SuccessSheet
        subTitle=""
        sheetTitle="Backup Key Added"
        successSheetRef={successSheetRef}
        Icon={data.baseIcon}
        data={data}
        primaryText="View Devices"
      />
    </View>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
  },
  linearGradient: {
    borderRadius: 6,
    marginTop: hp(3),
  },
  cardContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: RFValue(12),
    letterSpacing: '0.24@s',
  },
  subtitle: {
    fontSize: RFValue(10),
    letterSpacing: '0.20@s',
  },
  sheetSubText: {
    color: '#073E39',
    marginVertical: hp(3),
    fontSize: RFValue(12),
    letterSpacing: 0.6,
    lineHeight: 18,
  },
  qrContainer: {
    alignSelf: 'center',
    marginVertical: 30,
  },
});
export default BackupScreen;
