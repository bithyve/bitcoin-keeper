import React from 'react'

import { View } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

import HexaBottomSheet from './BottomSheet';
import BackupListComponent from './BackupListComponent';
import QRCode from 'react-native-qrcode-svg';

const QrSheet = ({ backUpKeyType, expandAddBackUpKeySheet, addBackUpKeySheetRef, closeAddBackUpKeySheet, index }) => {
  return (
    <HexaBottomSheet
      title={'Add Backup Key'}
      subTitle={'Strengthen your security'}
      snapPoints={['80%']}
      bottomSheetRef={addBackUpKeySheetRef}
      primaryText={'Done'}
      primaryCallback={closeAddBackUpKeySheet}
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
      <Text style={styles.sheetSubText} fontFamily="body" fontWeight={'200'}>
        Scan the QR below to add Backup Key
      </Text>
      <View style={styles.qrContainer}>
        <QRCode value="http://awesome.link.qr" logoBackgroundColor="transparent" size={250} />
      </View>
    </HexaBottomSheet>
  );
}

const styles = ScaledSheet.create({
  qrContainer: {
    alignSelf: 'center',
    marginVertical: 30,
  },
  sheetSubText: {
    color: '#073E39',
    marginVertical: hp(3),
    fontSize: RFValue(12),
    letterSpacing: 0.6,
    lineHeight: 18,
  },
})

export default QrSheet;