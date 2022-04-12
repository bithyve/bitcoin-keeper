import React from 'react'
import { useNavigation } from '@react-navigation/native';
import HexaBottomSheet from './BottomSheet';
import HexaPayComponent from './HexaPayComponent';

export const SuccessSheet = ({
  title = '',
  subTitle,
  sheetTitle,
  successSheetRef,
  Icon,
  data = undefined,
  primaryText,
}) => {
  const navigation = useNavigation();

  return (
    <HexaBottomSheet
      title={sheetTitle}
      snapPoints={['50%']}
      bottomSheetRef={successSheetRef}
      primaryText={primaryText}
      primaryCallback={() => navigation.navigate('Home', data)}
    >
      <HexaPayComponent Icon={<Icon />} title={title} subtitle={subTitle} />
    </HexaBottomSheet>
  );
};

export default SuccessSheet