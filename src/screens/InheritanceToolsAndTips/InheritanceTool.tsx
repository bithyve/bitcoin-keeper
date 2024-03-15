import { Box, ScrollView } from 'native-base';
import React from 'react';
import moment from 'moment';

import OptionCard from 'src/components/OptionCard';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import Sword from 'src/assets/images/sword_icon.svg';
import useWallets from 'src/hooks/useWallets';
import { WalletType } from 'src/core/wallets/enums';
import { CommonActions } from '@react-navigation/native';
import { VaultScheme } from 'src/core/wallets/interfaces/vault';
import { getTimeDifferenceInWords } from 'src/utils/utilities';
import { updateLastVisitedTimestamp } from 'src/store/reducers/storage';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import {
  INHERITANCE_KEY,
  INHERITANCE_TIPS,
  LETTER_OF_ATTORNEY,
  PRINTABLE_TEMPLATES,
  RECOVERY_INSTRUCTIONS,
} from 'src/services/channel/constants';

function InheritanceTool({ navigation }) {
  const { wallets } = useWallets({ getAll: true });
  const dispatch = useAppDispatch();
  const { inheritanceToolVisitedHistory } = useAppSelector((state) => state.storage);

  const navigate = (path, value) => {
    navigation.navigate(path);
    dispatch(updateLastVisitedTimestamp({ option: value }));
  };
  const navigateToVaultSetup = (scheme: VaultScheme) => {
    navigation.dispatch(CommonActions.navigate({ name: 'VaultSetup', params: { scheme } }));
  };

  const navigateToWalletCreation = () => {
    navigation.navigate('EnterWalletDetail', {
      name: `Wallet ${wallets.length + 1}`,
      description: '',
      type: WalletType.DEFAULT,
    });
  };

  return (
    <ScrollView>
      <OptionCard
        preTitle={`${
          inheritanceToolVisitedHistory[INHERITANCE_KEY] === undefined
            ? 'Never accessed'
            : `${getTimeDifferenceInWords(inheritanceToolVisitedHistory[INHERITANCE_KEY])}`
        }`}
        title="Inheritance Key"
        description="Additional signer for your vault"
        LeftIcon={<Sword />}
        callback={() => navigate('InheritanceKey', INHERITANCE_KEY)}
      />
      <OptionCard
        preTitle={`${
          inheritanceToolVisitedHistory[LETTER_OF_ATTORNEY] === undefined
            ? 'Never accessed'
            : `${getTimeDifferenceInWords(inheritanceToolVisitedHistory[LETTER_OF_ATTORNEY])}`
        }`}
        title="Letter to Attorney"
        description="A pre-filled letter template"
        LeftIcon={<Sword />}
        callback={() => navigate('LetterOfAttorney', LETTER_OF_ATTORNEY)}
      />
      <OptionCard
        preTitle={`${
          inheritanceToolVisitedHistory[RECOVERY_INSTRUCTIONS] === undefined
            ? 'Never accessed'
            : `${getTimeDifferenceInWords(inheritanceToolVisitedHistory[RECOVERY_INSTRUCTIONS])}`
        }`}
        title="Recovery Instructions"
        description="For the heir or beneficiary"
        LeftIcon={<VaultGreenIcon />}
        callback={() => navigate('RecoveryInstruction', RECOVERY_INSTRUCTIONS)}
      />
      <OptionCard
        preTitle={`${
          inheritanceToolVisitedHistory[PRINTABLE_TEMPLATES] === undefined
            ? 'Never accessed'
            : `${getTimeDifferenceInWords(inheritanceToolVisitedHistory[PRINTABLE_TEMPLATES])}`
        }`}
        title="Printable Templates"
        description="For digital or physical copies"
        LeftIcon={<VaultGreenIcon />}
        callback={() => navigate('PrintableTemplates', PRINTABLE_TEMPLATES)}
      />
      <Box paddingTop={10}>
        <OptionCard
          preTitle={`${
            inheritanceToolVisitedHistory[INHERITANCE_TIPS] === undefined
              ? 'Never accessed'
              : `${getTimeDifferenceInWords(inheritanceToolVisitedHistory[INHERITANCE_TIPS])}`
          }`}
          title="Inheritance Tips"
          description="How to secure keys for the heir"
          LeftIcon={<VaultGreenIcon />}
          callback={() => navigate('InheritanceTips', INHERITANCE_TIPS)}
        />
      </Box>
    </ScrollView>
  );
}

export default InheritanceTool;
