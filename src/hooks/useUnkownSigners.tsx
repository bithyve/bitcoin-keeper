import { useQuery } from '@realm/react';
import { useDispatch } from 'react-redux';
import { SignerType } from 'src/services/wallets/enums';
import { Signer } from 'src/services/wallets/interfaces/vault';
import { getSignerNameFromType } from 'src/hardware';
import { SignerPolicy } from 'src/models/interfaces/AssistedKeys';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import { useContext } from 'react';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const useUnkownSigners = () => {
  const signers: Signer[] = useQuery(RealmSchema.Signer).map(getJSONFromRealmObject);
  const unknowSigners = signers.filter((signer) => signer.type === SignerType.UNKOWN_SIGNER);
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { error: ErrorText } = translations;

  const mapUnknownSigner = ({
    masterFingerprint,
    type,
    isBIP85,
    signerPolicy,
  }: {
    masterFingerprint: string;
    type: SignerType;
    isBIP85?: boolean;
    signerPolicy?: SignerPolicy;
  }): boolean | void => {
    try {
      const signer = unknowSigners.find((signer) => signer.masterFingerprint === masterFingerprint);
      if (signer) {
        dispatch(updateSignerDetails(signer, 'type', type));
        dispatch(updateSignerDetails(signer, 'signerName', getSignerNameFromType(type)));

        if (isBIP85) dispatch(updateSignerDetails(signer, 'isBIP85', isBIP85));
        if (signerPolicy) dispatch(updateSignerDetails(signer, 'signerPolicy', signerPolicy));

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(`${ErrorText.ErrorMappingUnknownSigner}:`, error);
      throw new Error(ErrorText.ErrorMappingUnknownSigner);
    }
  };

  return { unknowSigners, mapUnknownSigner };
};

export default useUnkownSigners;
