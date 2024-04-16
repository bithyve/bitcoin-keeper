import { ScrollView } from 'native-base';
import React, { useContext } from 'react';
import OptionCard from 'src/components/OptionCard';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import VaultGreyIcon from 'src/assets/images/vault-grey.svg'
import File from 'src/assets/images/files.svg';
import EditFile from 'src/assets/images/edit_file.svg';
import EditFileGrey from 'src/assets/images/edit-file-grey.svg';
import RecoveryIcon from 'src/assets/images/recovery_icon.svg';
import RecoveryGreyIcon from 'src/assets/images/recovery-grey.svg';
import ContactIcon from 'src/assets/images/contacts.svg';
import ContactGreyIcon from 'src/assets/images/contacts-grey.svg';
import AdditionalDetailIcon from 'src/assets/images/addtional_details.svg';
import AdditionalDetailGreyIcon from 'src/assets/images/additional-detail-grey.svg';


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
  const isHodlerAndDiamondHand = plan === 'DIAMOND HANDS' || plan === 'HODLER';
  const isDiamondHand = plan === 'DIAMOND HANDS';
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const { inheritanceToolVisitedHistory } = useAppSelector((state) => state.storage);

  const navigate = (path, value) => {
    navigation.navigate(path);
    dispatch(updateLastVisitedTimestamp({ option: value }));
  };

  return (
    <ScrollView>
      {!isDiamondHand && <UpgradeSubscription type={'DIAMOND HANDS'} />}
      <OptionCard
        preTitle={`${getTimeDifferenceInWords(
          inheritanceToolVisitedHistory[RECOVERY_PHRASE_TEMPLATE]
        )}`}
        disabled={!isDiamondHand}
        title={inheritancePlanning.recoveryPhraseTitle}
        description={inheritancePlanning.recoveryPhraseDescp}
        LeftIcon={!isHodlerAndDiamondHand? <RecoveryGreyIcon/> : <RecoveryIcon />}
        callback={() => navigate('RecoveryPhraseTemplate', RECOVERY_PHRASE_TEMPLATE)}
      />

      <OptionCard
        preTitle={`${getTimeDifferenceInWords(
          inheritanceToolVisitedHistory[TRUSTED_CONTACTS_TEMPLATE]
        )}`}
        disabled={!isDiamondHand}
        title={inheritancePlanning.trustedContactsTitle}
        description={inheritancePlanning.trustedContactsDescp}
        LeftIcon={!isHodlerAndDiamondHand? <ContactGreyIcon/> : <ContactIcon />}
        callback={() => navigate('TrustedContactTemplates', TRUSTED_CONTACTS_TEMPLATE)}
      />

      <OptionCard
        preTitle={`${getTimeDifferenceInWords(
          inheritanceToolVisitedHistory[ADDITIONAL_SIGNER_DETAILS]
        )}`}
        disabled={!isDiamondHand}
        title={inheritancePlanning.additionalKeysTitle}
        description={inheritancePlanning.additionalKeysDescp}
        LeftIcon={!isHodlerAndDiamondHand? <AdditionalDetailGreyIcon/> : <AdditionalDetailIcon />}
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
      {!isHodlerAndDiamondHand && <UpgradeSubscription type={'HODLER'} />}
      <OptionCard
        preTitle={`${getTimeDifferenceInWords(
          inheritanceToolVisitedHistory[RECOVERY_INSTRUCTIONS]
        )}`}
        disabled={!isHodlerAndDiamondHand}
        title={inheritancePlanning.recoveryInstructionsTitle}
        description={inheritancePlanning.recoveryInstructionsDescp}
        LeftIcon={<File />}
        callback={() => navigate('RecoveryInstruction', RECOVERY_INSTRUCTIONS)}
      />
      <OptionCard
        preTitle={`${getTimeDifferenceInWords(inheritanceToolVisitedHistory[LETTER_OF_ATTORNEY])}`}
        disabled={!isHodlerAndDiamondHand}
        title={inheritancePlanning.letterOfAttorneyTitle}
        description={inheritancePlanning.letterOfAttorneyDescp}
        LeftIcon={!isHodlerAndDiamondHand? <EditFileGrey/> : <EditFile />}
        callback={() => navigate('LetterOfAttorney', LETTER_OF_ATTORNEY)}
      />
      <OptionCard
        preTitle={`${getTimeDifferenceInWords(inheritanceToolVisitedHistory[INHERITANCE_TIPS])}`}
        disabled={!isHodlerAndDiamondHand}
        title={inheritancePlanning.inheritanceTipsTitle}
        description={inheritancePlanning.inheritanceTipsDescp}
        LeftIcon={!isHodlerAndDiamondHand? <VaultGreyIcon/> : <VaultGreenIcon />}
        callback={() => navigate('InheritanceTips', INHERITANCE_TIPS)}
      />
    </ScrollView>
  );
}

export default InheritanceTool;
