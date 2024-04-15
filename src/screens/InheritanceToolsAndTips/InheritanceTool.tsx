import { ScrollView } from 'native-base';
import React, { useContext } from 'react';
import OptionCard from 'src/components/OptionCard';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import File from 'src/assets/images/files.svg';
import EditFile from 'src/assets/images/edit_file.svg';
import RecoveryIcon from 'src/assets/images/recovery_icon.svg';
import ContactIcon from 'src/assets/images/contacts.svg';
import AdditionalDetailIcon from 'src/assets/images/addtional_details.svg';

import { getTimeDifferenceInWords } from 'src/utils/utilities';
import { updateLastVisitedTimestamp } from 'src/store/reducers/storage';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import {
  ADDITIONAL_SIGNER_DETAILS,
  INHERITANCE_TIPS,
  LETTER_OF_ATTORNEY,
  RECOVERY_INSTRUCTIONS,
  RECOVERY_PHRASE_TEMPLATE,
  TRUSTED_CONTACTS_TEMPLATE,
} from 'src/services/channel/constants';
import usePlan from 'src/hooks/usePlan';
import UpgradeSubscription from './components/UpgradeSubscription';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function InheritanceTool({ navigation }) {
  const dispatch = useAppDispatch();
  const { plan } = usePlan();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const { inheritanceToolVisitedHistory } = useAppSelector((state) => state.storage);

  const navigate = (path, value) => {
    navigation.navigate(path);
    dispatch(updateLastVisitedTimestamp({ option: value }));
  };

  return (
    <ScrollView>
      {plan !== 'DIAMOND HANDS' && <UpgradeSubscription type={'DIAMOND HANDS'} />}
      <OptionCard
        preTitle={`${getTimeDifferenceInWords(
          inheritanceToolVisitedHistory[RECOVERY_PHRASE_TEMPLATE]
        )}`}
        disabled={plan === 'DIAMOND HANDS' ? false : true}
        title={inheritancePlanning.recoveryPhraseTitle}
        description={inheritancePlanning.recoveryPhraseDescp}
        LeftIcon={<RecoveryIcon />}
        callback={() => navigate('RecoveryPhraseTemplate', RECOVERY_PHRASE_TEMPLATE)}
      />

      <OptionCard
        preTitle={`${getTimeDifferenceInWords(
          inheritanceToolVisitedHistory[TRUSTED_CONTACTS_TEMPLATE]
        )}`}
        disabled={plan === 'DIAMOND HANDS' ? false : true}
        title={inheritancePlanning.trustedContactsTitle}
        description={inheritancePlanning.trustedContactsDescp}
        LeftIcon={<ContactIcon />}
        callback={() => navigate('TrustedContactTemplates', TRUSTED_CONTACTS_TEMPLATE)}
      />

      <OptionCard
        preTitle={`${getTimeDifferenceInWords(
          inheritanceToolVisitedHistory[ADDITIONAL_SIGNER_DETAILS]
        )}`}
        disabled={plan === 'DIAMOND HANDS' ? false : true}
        title={inheritancePlanning.additionalKeysTitle}
        description={inheritancePlanning.additionalKeysDescp}
        LeftIcon={<AdditionalDetailIcon />}
        callback={() => navigate('AdditionalSignerDetailsTemplate', ADDITIONAL_SIGNER_DETAILS)}
      />

      {/* <OptionCard
        preTitle={`${
          inheritanceToolVisitedHistory[PRINTABLE_TEMPLATES] === undefined
            ? 'Never accessed'
            : `${getTimeDifferenceInWords(inheritanceToolVisitedHistory[PRINTABLE_TEMPLATES])}`
        }`}
        title="Printable Templates"
        description="For digital or physical copies"
        LeftIcon={<VaultGreenIcon />}
        callback={() => navigate('PrintableTemplates', PRINTABLE_TEMPLATES)}
      /> */}
      {plan !== 'HODLER' && plan !== 'DIAMOND HANDS' && <UpgradeSubscription type={'HODLER'} />}
      <OptionCard
        preTitle={`${getTimeDifferenceInWords(
          inheritanceToolVisitedHistory[RECOVERY_INSTRUCTIONS]
        )}`}
        disabled={plan === 'DIAMOND HANDS' || plan === 'HODLER' ? false : true}
        title={inheritancePlanning.recoveryInstructionsTitle}
        description={inheritancePlanning.recoveryInstructionsDescp}
        LeftIcon={<File />}
        callback={() => navigate('RecoveryInstruction', RECOVERY_INSTRUCTIONS)}
      />
      <OptionCard
        preTitle={`${getTimeDifferenceInWords(inheritanceToolVisitedHistory[LETTER_OF_ATTORNEY])}`}
        disabled={plan === 'DIAMOND HANDS' || plan === 'HODLER' ? false : true}
        title={inheritancePlanning.letterOfAttorneyTitle}
        description={inheritancePlanning.letterOfAttorneyDescp}
        LeftIcon={<EditFile />}
        callback={() => navigate('LetterOfAttorney', LETTER_OF_ATTORNEY)}
      />
      <OptionCard
        preTitle={`${getTimeDifferenceInWords(inheritanceToolVisitedHistory[INHERITANCE_TIPS])}`}
        disabled={plan === 'DIAMOND HANDS' || plan === 'HODLER' ? false : true}
        title={inheritancePlanning.inheritanceTipsTitle}
        description={inheritancePlanning.inheritanceTipsDescp}
        LeftIcon={<VaultGreenIcon />}
        callback={() => navigate('InheritanceTips', INHERITANCE_TIPS)}
      />
    </ScrollView>
  );
}

export default InheritanceTool;
