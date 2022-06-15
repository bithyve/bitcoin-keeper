import React, { useContext } from 'react'

import { View } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

import HexaBottomSheet from './BottomSheet';
import BackupListComponent from './BackupListComponent';
import QRCode from 'react-native-qrcode-svg';
import { BACKUP_KEYS } from 'src/common/data/defaultData/defaultData'
import { LocalizationContext } from 'src/common/content/LocContext';

type Props = {
  backUpKeyType: BACKUP_KEYS,
  expandAddBackUpKeySheet: any,
  addBackUpKeySheetRef: any,
  closeAddBackUpKeySheet: () => void,
  index: number
};

const QrSheet = ({
  backUpKeyType,
  expandAddBackUpKeySheet,
  addBackUpKeySheetRef,
  closeAddBackUpKeySheet,
  index
}: Props) => {

  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'home' ]

  return (
    <HexaBottomSheet
      title={strings.AddBackupKey}
      subTitle={strings.Strengthenyoursecurity}
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
          showAccordian={false}
          touchable={false}
          item={undefined} />
      )}
      <Text style={styles.sheetSubText} fontFamily="body" fontWeight={'200'}>
        {strings.ScanQRAddBackup}
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