import React from 'react'
import { useNavigation } from '@react-navigation/native';
import HexaBottomSheet from './BottomSheet';
import HexaPayComponent from './HexaPayComponent';

type Props = {
  title: string,
  subTitle: string,
  sheetTitle: string,
  successSheetRef: any,
  Icon: React.SFC<React.SVGProps<SVGSVGElement>>,
  data: object | undefined,
  primaryText: string,
};

export const SuccessSheet = ({
  title = '',
  subTitle,
  sheetTitle,
  successSheetRef,
  Icon,
  data = undefined,
  primaryText,
}: Props) => {
  const navigation = useNavigation();

  return (
    <HexaBottomSheet
      title={sheetTitle}
      snapPoints={['50%']}
      bottomSheetRef={successSheetRef}
      primaryText={primaryText}
      primaryCallback={() => navigation.navigate('Home', data)}
    >
      <HexaPayComponent Icon={Icon} title={title} subtitle={subTitle} />
    </HexaBottomSheet>
  );
};

export default SuccessSheet