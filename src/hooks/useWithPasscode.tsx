import { useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import KeeperModal from 'src/components/KeeperModal';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import { wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const useWithPasscode = () => {
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTransactions } = translations;
  const { colorMode } = useColorMode();
  const [onSuccess, setOnSuccess] = useState<Function | null>(null);

  const withPasscode = (onProceed) => {
    setConfirmPassVisible(true);
    setOnSuccess(onProceed);
  };

  const onPasscodeSuccess = () => {
    setConfirmPassVisible(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  const CheckPasscodeModal = () => (
    <KeeperModal
      visible={confirmPassVisible}
      close={() => setConfirmPassVisible(false)}
      title={walletTransactions.confirmPassTitle}
      subTitleWidth={wp(240)}
      subTitle=""
      modalBackground={`${colorMode}.modalWhiteBackground`}
      subTitleColor={`${colorMode}.secondaryText`}
      textColor={`${colorMode}.primaryText`}
      Content={() => (
        <PasscodeVerifyModal
          useBiometrics
          close={() => {
            setConfirmPassVisible(false);
          }}
          onSuccess={onPasscodeSuccess}
        />
      )}
    />
  );
  return { withPasscode, CheckPasscodeModal };
};

export default useWithPasscode;
