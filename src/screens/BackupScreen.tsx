import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { View, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import uuid from 'react-native-uuid';

import StatusBarComponent from 'src/components/StatusBarComponent';
import HeaderTitle from 'src/components/HeaderTitle';
import BackupListComponent from 'src/components/BackupListComponent';
import HexaBottomSheet from 'src/components/BottomSheet';
import QRCode from 'react-native-qrcode-svg';
import HardwareSheet from 'src/components/HardwareSheet';
import { HardwareData, Data, getIcon } from 'src/common/data/backup/backupdata';
import { ImportWalletSheet } from './AddWalletScreen';

const BackupScreen = ({}) => {
  const navigtaion = useNavigation();
  const [backUpKeyType, setBackUpKeyType] = useState();
  const addBackUpKeySheetRef = useRef(null);
  const hardwareSheetRef = useRef(null);
  const importWalletSheetRef = useRef(null);
  const [importKey, setImportKey] = useState();

  let index = -1;
  let data = {};

  useEffect(() => {
    if (index == -1) {
      data = {};
    }
  }, [index]);

  const expandAddBackUpKeySheet = useCallback((item) => {
    data = { ...item, Icon: getIcon(item.id), id: uuid.v4() };
    if (item.id == 5) {
      hardwareSheetRef.current?.expand();
    }
    if (item.id !== 5 && item.id >= 1 && item.id <= 7) {
      setBackUpKeyType(item);
      addBackUpKeySheetRef.current?.expand();
    } else if (item.id >= 8 && item.id <= 12) {
      data && navigtaion.navigate('Home', data);
      hardwareSheetRef.current?.close();
    }
  }, []);

  const closeAddBackUpKeySheet = useCallback(() => {
    addBackUpKeySheetRef.current?.close();
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

  const expandImportWalletSheet = () => {
    importWalletSheetRef?.current.expand();
  };

  const closeImportWalletSheet = () => {
    importWalletSheetRef?.current.close();
  };

  const importWallet = () => {
    closeImportWalletSheet();
  };

  return (
    <View style={styles.Container} background={'light.lightYellow'}>
      <StatusBarComponent padding={50} />
      <HeaderTitle
        title="Add a Backup Key"
        subtitle="Strengthen your security"
        onPressHandler={() => navigtaion.goBack()}
      />
      <FlatList
        style={{ marginTop: hp(2) }}
        showsVerticalScrollIndicator={false}
        data={Data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <HexaBottomSheet
        title={'Add Backup Key'}
        subTitle={'Lorem Ipsum Dolor Amet'}
        snapPoints={['80%']}
        bottomSheetRef={addBackUpKeySheetRef}
        primaryText={'Done'}
        primaryCallback={() => {
          closeAddBackUpKeySheet();
          expandImportWalletSheet();
        }}
        index={index}
      >
        {backUpKeyType && (
          <BackupListComponent
            title={backUpKeyType?.title}
            subtitle={backUpKeyType?.subtitle}
            Icon={backUpKeyType?.Icon}
            onPress={expandAddBackUpKeySheet}
          />
        )}
        <Text style={styles.sheetSubText}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit
        </Text>
        <View style={styles.qrContainer}>
          <QRCode value="http://awesome.link.qr" logoBackgroundColor="transparent" size={250} />
        </View>
      </HexaBottomSheet>
      <HardwareSheet
        bottomSheetRef={hardwareSheetRef}
        Data={HardwareData}
        onPress={expandAddBackUpKeySheet}
      />
      <ImportWalletSheet
        importWalletSheetRef={importWalletSheetRef}
        importWallet={importWallet}
        importKey={importKey}
        setImportKey={setImportKey}
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
  sheetSubText: { color: '#073E39', fontWeight: '500', marginVertical: 10 },
  qrContainer: { alignSelf: 'center', marginVertical: 30 },
});
export default BackupScreen;
