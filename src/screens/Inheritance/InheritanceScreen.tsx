import React, { Fragment, useRef, useState, useContext } from 'react';
import { Text, VStack } from 'native-base';
import { useNavigation, useRoute } from '@react-navigation/native';

import BenificiaryList from './BenificiaryList';
import BottomSheet from '@gorhom/bottom-sheet';
import DeclarationForm from './DeclarationForm';
import HeaderTitle from 'src/components/HeaderTitle';
import HexaBottomSheet from 'src/components/BottomSheet';
import InheritanceModes from './InheritanceModes';
import { Keyboard } from 'react-native';
import StatusBarComponent from 'src/components/StatusBarComponent';
import TransferState from './TransferState';
import useBottomSheetUtils from 'src/hooks/useBottomSheetUtils';
import { LocalizationContext } from 'src/common/content/LocContext';

const InheritanceScreen = () => {

  const { translations } = useContext( LocalizationContext )
  const inheritence = translations[ 'inheritence' ]
  const common = translations[ 'common' ]
  const wallet = translations[ 'wallet' ]

  const [transferState, setTransfer] = useState('Initiate Transfer');
  const [transferDescription, setDescription] = useState(
    'Initiate transfer to Gunther Greene as your beneficiary and transfer access to your funds in Keeper'
  );
  const [primaryText, setPrimary] = useState('Initiate');
  const [secondaryText, setSecondary] = useState('Cancel');
  const navigation = useNavigation();
  const route = useRoute<any>();
  const assignRef = useRef<BottomSheet>(null);
  const declarationRef = useRef<BottomSheet>(null);
  const transferRef = useRef<BottomSheet>(null);
  const { openSheet: openAssignSheet, closeSheet: closeAssignSheet } =
    useBottomSheetUtils(assignRef);
  const { openSheet: _openDeclarationSheet, closeSheet: _closeDeclarationSheet } =
    useBottomSheetUtils(declarationRef);
  const { openSheet: _openTransferSheet, closeSheet: _closeTransferSheet } =
    useBottomSheetUtils(transferRef);

  const openDeclarationSheet = () => {
    closeAssignSheet();
    _openDeclarationSheet();
    Keyboard.dismiss();
  };
  const closeDeclarationSheet = () => {
    _closeDeclarationSheet();
    route.params.setInheritance(true);
  };

  const openTransferSheet = () => {
    closeDeclarationSheet();
    _openTransferSheet();
  };

  const initiateTransfer = () => {
    if (transferState == 'Transfer Successful!') {
      _closeTransferSheet();
      navigation.goBack();
    }
    setTransfer('Transfer Successful!');
    setDescription('Gunther Greene now has access to your funds in Keeper!');
    setPrimary('Home');
    setSecondary('');
  };
  return (
    <Fragment>
      <StatusBarComponent padding={80} extraPadding={30} />
      <VStack marginX={8}>
        <HeaderTitle
          title={inheritence.SetupInheritance}
          subtitle={inheritence.Handdownyourbitcoin}
          onPressHandler={() => navigation.goBack()}
        />
        <Text
          fontFamily={'body'}
          fontWeight={'100'}
          size={'xs'}
          noOfLines={2}
          marginY={12}
          h={'auto'}
        >
          {inheritence.Chooseyourbeneficiarycarefully}
        </Text>
        <InheritanceModes
          openAssignSheet={openAssignSheet}
          openDeclarationSheet={openDeclarationSheet}
          openTransferSheet={openTransferSheet}
        />
      </VStack>
      <HexaBottomSheet
        title={inheritence.AssignBenificiary}
        subTitle={inheritence.receivesyourbitcoininheritance}
        snapPoints={['60%']}
        bottomSheetRef={assignRef}
        primaryText={common.add}
        secondaryText={common.Addfromcontacts}
        primaryCallback={openDeclarationSheet}
      >
        <BenificiaryList />
      </HexaBottomSheet>
      <HexaBottomSheet
        title={inheritence.SignDeclaration}
        subTitle={inheritence.Readbeforesigning}
        snapPoints={['90%']}
        bottomSheetRef={declarationRef}
        primaryText={common.sign}
        secondaryText={common.cancel}
        secondaryCallback={_closeDeclarationSheet}
        primaryCallback={openTransferSheet}
      >
        <DeclarationForm />
      </HexaBottomSheet>
      <HexaBottomSheet
        title={transferState}
        subTitle={
          transferState == wallet.TransferSuccessful
            ? ''
            : wallet.initiatetransfer
        }
        snapPoints={['60%']}
        bottomSheetRef={transferRef}
        primaryText={primaryText}
        secondaryText={secondaryText}
        secondaryCallback={_closeTransferSheet}
        primaryCallback={initiateTransfer}
      >
        <TransferState setTransfer={setTransfer} transferDescription={transferDescription} />
      </HexaBottomSheet>
    </Fragment>
  );
};

export default InheritanceScreen;
