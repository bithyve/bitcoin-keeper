import { Box, ScrollView } from 'native-base';
import React from 'react';
import OptionCard from 'src/components/OptionCard';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import Sword from 'src/assets/images/sword_icon.svg';
import useWallets from 'src/hooks/useWallets';
import { WalletType } from 'src/services/wallets/enums';
import { VaultScheme } from 'src/services/wallets/interfaces/vault';
import { CommonActions } from '@react-navigation/native';
import { getTimeDifferenceInWords } from 'src/utils/utilities';
import { updateLastVisitedTimestamp } from 'src/store/reducers/storage';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import {
  ADDITIONAL_SIGNER_DETAILS,
  INHERITANCE_TIPS,
  LETTER_OF_ATTORNEY,
  PRINTABLE_TEMPLATES,
  RECOVERY_INSTRUCTIONS,
  RECOVERY_PHRASE_TEMPLATE,
  TRUSTED_CONTACTS_TEMPLATE,
} from 'src/services/channel/constants';
import { hp } from 'src/constants/responsive';

function InheritanceTool({ navigation }) {
  const dispatch = useAppDispatch();
  const { inheritanceToolVisitedHistory } = useAppSelector((state) => state.storage);

  const navigate = (path, value) => {
    navigation.navigate(path);
    dispatch(updateLastVisitedTimestamp({ option: value }));
  };

  return (
    <ScrollView>
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
          inheritanceToolVisitedHistory[RECOVERY_PHRASE_TEMPLATE] === undefined
            ? 'Never accessed'
            : `${getTimeDifferenceInWords(inheritanceToolVisitedHistory[RECOVERY_PHRASE_TEMPLATE])}`
        }`}
        title="Recovery Phrase"
        description="Template to write down your seed words"
        LeftIcon={<VaultGreenIcon />}
        callback={() => navigate('RecoveryPhraseTemplate', RECOVERY_PHRASE_TEMPLATE)}
      />

      <OptionCard
        preTitle={`${
          inheritanceToolVisitedHistory[TRUSTED_CONTACTS_TEMPLATE] === undefined
            ? 'Never accessed'
            : `${getTimeDifferenceInWords(
                inheritanceToolVisitedHistory[TRUSTED_CONTACTS_TEMPLATE]
              )}`
        }`}
        title="Trusted Contacts DOCUMENT WIP"
        description="Template to share details of contacts"
        LeftIcon={<VaultGreenIcon />}
        callback={() => navigate('TrustedContactTemplates', TRUSTED_CONTACTS_TEMPLATE)}
      />

      <OptionCard
        preTitle={`${
          inheritanceToolVisitedHistory[ADDITIONAL_SIGNER_DETAILS] === undefined
            ? 'Never accessed'
            : `${getTimeDifferenceInWords(
                inheritanceToolVisitedHistory[ADDITIONAL_SIGNER_DETAILS]
              )}`
        }`}
        title="Additional Key Details DOCUMENT WIP"
        description="Template to share useful key details"
        LeftIcon={<VaultGreenIcon />}
        callback={() => navigate('AdditionalSignerDetailsTemplate', ADDITIONAL_SIGNER_DETAILS)}
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
      <Box style={{ marginBottom: hp(100) }} />
    </ScrollView>
  );
}

export default InheritanceTool;
