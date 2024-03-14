import React, { useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { useNavigation } from '@react-navigation/native';
import { Box, Input, useColorMode } from 'native-base';
import Buttons from 'src/components/Buttons';
import { StyleSheet, Text } from 'react-native';

import { hp } from 'src/constants/responsive';
import { Signer, Vault } from 'src/services/wallets/interfaces/vault';
import useVault from 'src/hooks/useVault';
import { SignerType } from 'src/services/wallets/enums';
import { InheritanceConfiguration, InheritancePolicy } from 'src/services/interfaces';
import InheritanceKeyServer from 'src/services/operations/InheritanceKey';
import useToastMessage from 'src/hooks/useToastMessage';
import { captureError } from 'src/services/sentry';
import TickIcon from 'src/assets/images/icon_tick.svg';
import useSignerMap from 'src/hooks/useSignerMap';
import { useDispatch } from 'react-redux';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import { emailCheck } from 'src/utils/utilities';

function IKSAddEmailPhone({ route }) {
  const navigtaion = useNavigation();
  const [email, setEmail] = useState('');
  const [emailStatusFail, setEmailStatusFail] = useState(false);
  const { vaultId } = route.params;
  const vault: Vault = useVault({ vaultId }).activeVault;
  const { showToast } = useToastMessage();
  const { signerMap } = useSignerMap() as { signerMap: { [key: string]: Signer } };
  const dispatch = useDispatch();
  const [ikVaultKey] = vault.signers.filter(
    (vaultKey) => signerMap[vaultKey.masterFingerprint].type === SignerType.INHERITANCEKEY
  );
  const { colorMode } = useColorMode();

  const updateIKSPolicy = async (email: string) => {
    try {
      const IKSigner = signerMap[ikVaultKey.masterFingerprint];
      if (IKSigner.inheritanceKeyInfo === undefined) {
        showToast('Something went wrong, IKS configuration missing', <TickIcon />);
      }

      const existingPolicy: InheritancePolicy = IKSigner.inheritanceKeyInfo.policy;
      const updatedPolicy: InheritancePolicy = {
        ...existingPolicy,
        alert: {
          emails: [email],
        },
      };

      let configurationForVault: InheritanceConfiguration = null;
      for (const config of IKSigner.inheritanceKeyInfo.configurations) {
        if (config.id === vault.id) {
          configurationForVault = config;
          break;
        }
      }
      if (!configurationForVault) {
        showToast(`Something went wrong, IKS configuration missing for vault ${vault.id}`);
        return;
      }

      const { updated } = await InheritanceKeyServer.updateInheritancePolicy(
        ikVaultKey.xfp,
        updatedPolicy,
        configurationForVault
      );

      if (updated) {
        const updateInheritanceKeyInfo = {
          ...IKSigner.inheritanceKeyInfo,
          policy: updatedPolicy,
        };

        dispatch(updateSignerDetails(IKSigner, 'inheritanceKeyInfo', updateInheritanceKeyInfo));
        showToast('Email added', <TickIcon />);
        navigtaion.goBack();
      } else showToast('Failed to add email');
    } catch (err) {
      captureError(err);
      showToast('Failed to add email');
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title="Add Email" subtitle="To receive periodic notifications" />
      <Box style={styles.inputWrapper}>
        <Input
          placeholderTextColor="grey"
          backgroundColor="light.primaryBackground"
          placeholder="Add email Id"
          placeholderTextColor={`${colorMode}.SlateGreen`}
          style={styles.input}
          borderWidth={0}
          height={50}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            emailStatusFail && setEmailStatusFail(false);
          }}
        />
        {emailStatusFail && (
          <Text style={[styles.errorStyle, { color: `${colorMode}.errorRed` }]}>
            Email is not correct
          </Text>
        )}
      </Box>
      <Box>
        <Text style={[styles.consentNotes, { color: `${colorMode}.pantoneGreen` }]}>
          Consent Note:
        </Text>
        <Text style={styles.notesDescription}>
          By providing your email address/phone number, you consent to us using this information to
          send you alerts and notifications about Inheritance Key requests, notify you of account
          activity, and contact you for customer support purposes if needed. You can withdraw your
          consent at any time by disabling this from App settings or clicking the unsubscribe link
          in our emails. We will protect your data as outlined in our privacy policy.{' '}
        </Text>
      </Box>
      <Buttons
        primaryText="Confirm"
        primaryCallback={() => {
          if (!emailCheck(email)) {
            setEmailStatusFail(true);
          } else {
            updateIKSPolicy(email);
          }
        }}
      />
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  inputWrapper: {
    marginVertical: hp(60),
    marginHorizontal: 4,
  },
  input: {
    width: '90%',
    fontSize: 14,
    paddingLeft: 5,
  },
  consentNotes: { fontWeight: '500' },
  notesDescription: { marginVertical: 10, fontSize: 12, lineHeight: 20 },
  errorStyle: { marginTop: 10 },
});
export default IKSAddEmailPhone;
