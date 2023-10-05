import React, { useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { useNavigation } from '@react-navigation/native';
import { Box, Input } from 'native-base';
import Buttons from 'src/components/Buttons';
import { StyleSheet } from 'react-native';
import { hp } from 'src/constants/responsive';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import useVault from 'src/hooks/useVault';
import { SignerType } from 'src/core/wallets/enums';
import { InheritancePolicy } from 'src/services/interfaces';
import idx from 'idx';
import InheritanceKeyServer from 'src/services/operations/InheritanceKey';
import useToastMessage from 'src/hooks/useToastMessage';
import { captureError } from 'src/services/sentry';
import { RealmSchema } from 'src/storage/realm/enum';
import dbManager from 'src/storage/realm/dbManager';
import TickIcon from 'src/assets/images/icon_tick.svg';

function IKSAddEmailPhone() {
  const navigtaion = useNavigation();
  const [email, setEmail] = useState('');
  const vault: Vault = useVault().activeVault;
  const { showToast } = useToastMessage();

  const updateIKSPolicy = async (email: string) => {
    try {
      const [ikSigner] = vault.signers.filter(
        (signer) => signer.type === SignerType.INHERITANCEKEY
      );
      const thresholdDescriptors = vault.signers.map((signer) => signer.signerId).slice(0, 2);

      const existingPolicy: InheritancePolicy | any =
        idx(ikSigner, (_) => _.inheritanceKeyInfo.policy) || {};

      const updatedPolicy: InheritancePolicy = {
        ...existingPolicy,
        alert: {
          emails: [email],
        },
      };

      const { updated } = await InheritanceKeyServer.updateInheritancePolicy(
        vault.shellId,
        {
          alert: updatedPolicy.alert,
        },
        thresholdDescriptors
      );

      if (updated) {
        const updatedIKSigner: VaultSigner = {
          ...ikSigner,
          inheritanceKeyInfo: {
            ...ikSigner.inheritanceKeyInfo,
            policy: updatedPolicy,
          },
        };
        const updatedSigners = vault.signers.map((signer) => {
          if (signer.type === SignerType.INHERITANCEKEY) return updatedIKSigner;
          return signer;
        });

        dbManager.updateObjectById(RealmSchema.Vault, vault.id, {
          signers: updatedSigners,
        });
        showToast('Email added', <TickIcon />);
        navigtaion.goBack();
      } else showToast('Failed to add email');
    } catch (err) {
      captureError(err);
      showToast('Failed to add email');
    }
  };

  return (
    <ScreenWrapper>
      <KeeperHeader
        title="Add email"
        subtitle="If notification is not declined continuously for 30 days, the Key would be activated"
      />
      <Box style={styles.inputWrapper}>
        <Input
          placeholderTextColor="grey"
          backgroundColor="light.primaryBackground"
          placeholder="Add email"
          style={styles.input}
          borderWidth={0}
          height={50}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
          }}
        />
      </Box>
      <Buttons
        primaryText="Proceed"
        primaryCallback={() => {
          updateIKSPolicy(email);
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
});
export default IKSAddEmailPhone;
