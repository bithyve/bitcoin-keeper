import React from 'react'

import HexaBottomSheet from './BottomSheet';
import BackupListComponent from './BackupListComponent';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

const HardwareInputSheet = ({
  backUpKeyType,
  expandAddBackUpKeySheet,
  closeAddBackUpKeyHardwareSheet,
  successSheetRef,
  index,
  addBackUpKeyHardwareSheetRef
}) => {
  return (
    <HexaBottomSheet
      title={'Add Backup Key'}
      subTitle={'Strengthen your security'}
      snapPoints={['80%']}
      bottomSheetRef={addBackUpKeyHardwareSheetRef}
      primaryText={'Done'}
      primaryCallback={() => {
        closeAddBackUpKeyHardwareSheet();
        successSheetRef.current.expand();
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
      <BottomSheetTextInput
        multiline={true}
        placeholder={'Insert a Seed'}
        // value={importKey}
        // onChangeText={(value) => setImportKey(value)}
        style={{ backgroundColor: '#D8A57210', padding: 4, aspectRatio: 1, marginTop: 5 }}
      />
    </HexaBottomSheet>
  );
}

export default HardwareInputSheet;