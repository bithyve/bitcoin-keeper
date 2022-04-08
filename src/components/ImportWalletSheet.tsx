import React, { useState } from 'react'

import { View } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

import HexaBottomSheet from './BottomSheet';
import QRscanner from './QRscanner';

const ImportWalletSheet = ({
  importWalletSheetRef,
  importWallet,
  importKey,
  setImportKey,
}) => {
  const [showQR, setShowQR] = useState(false);

  return (
    <HexaBottomSheet
      title={'Import Wallet'}
      subTitle={'Insert a seed to import your existing wallet'}
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