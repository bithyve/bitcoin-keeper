import React, { useState, useContext } from 'react'

import { View } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

import HexaBottomSheet from './BottomSheet';
import QRscanner from './QRscanner';
import { LocalizationContext } from 'src/common/content/LocContext';

const ImportWalletSheet = ({
  importWalletSheetRef,
  importWallet,
  importKey,
  setImportKey,
}) => {
  const [showQR, setShowQR] = useState(false);

  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'home' ]

  return (
    <HexaBottomSheet
      title={strings.ImportWallet}
      subTitle={strings.Insertaseed}
      snapPoints={['80%']}
      bottomSheetRef={importWalletSheetRef}
      primaryText={'Import'}
      primaryCallback={importWallet}
      secondaryText={showQR ? 'Text' : 'Scan'}
      secondaryCallback={showQR ? () => setShowQR(false) : () => setShowQR(true)}
    >
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {showQR ? (
          <QRscanner />
        ) : (
          <BottomSheetTextInput
            multiline={true}
            value={importKey}
            onChangeText={(value) => setImportKey(value)}
            style={{ backgroundColor: '#D8A57210', padding: 4, aspectRatio: 1 }}
          />
        )}
      </View>
    </HexaBottomSheet>
  );
};

export default ImportWalletSheet;