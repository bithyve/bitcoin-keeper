import { Box } from 'native-base';
import React from 'react';
import { useSelector } from 'react-redux';
import LoginMethod from 'src/models/enums/LoginMethod';
import { useAppSelector } from 'src/store/hooks';
import PasscodeVerifyModal from './Modal/PasscodeVerify';
import PasswordModalContent from 'src/screens/AppSettings/PasswordModalContent';

type Props = {
  close?: () => void;
  success?: any;
  useBiometrics?: boolean;
  forcedMode?: any;
  onForceSuccess?: any;
  primaryText?: string;
};

const ConfirmCredentialModal = ({
  success,
  close,
  useBiometrics,
  forcedMode,
  onForceSuccess,
  primaryText,
}: Props) => {
  const { loginMethod }: { loginMethod: LoginMethod } = useAppSelector((state) => state.settings);
  const fallbackLoginMethod = useSelector((state) => state.settings.fallbackLoginMethod);

  console.log({ loginMethod, fallbackLoginMethod });

  return (
    <Box>
      {(loginMethod === LoginMethod.BIOMETRIC && fallbackLoginMethod === 'PIN') ||
      (loginMethod !== LoginMethod.BIOMETRIC && loginMethod === LoginMethod.PIN) ? (
        <PasscodeVerifyModal
          useBiometrics={useBiometrics}
          close={() => {
            close();
          }}
          forcedMode={forcedMode}
          onForceSuccess={onForceSuccess}
          onSuccess={success}
          primaryText={primaryText}
        />
      ) : (
        <PasswordModalContent
          close={() => {
            close();
          }}
          onSuccess={success}
        />
      )}
    </Box>
  );
};

export default ConfirmCredentialModal;
