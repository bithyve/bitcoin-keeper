import React, { useContext, useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { Box, Input, useColorMode } from 'native-base';
import Buttons from 'src/components/Buttons';
import { StyleSheet, Text } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { hp, wp } from 'src/constants/responsive';
import { Signer, Vault } from 'src/services/wallets/interfaces/vault';
import useVault from 'src/hooks/useVault';
import { SignerType } from 'src/services/wallets/enums';
import { InheritanceConfiguration, InheritancePolicy } from 'src/models/interfaces/AssistedKeys';
import InheritanceKeyServer from 'src/services/backend/InheritanceKey';
import useToastMessage from 'src/hooks/useToastMessage';
import { captureError } from 'src/services/sentry';
import TickIcon from 'src/assets/images/icon_tick.svg';
import useSignerMap from 'src/hooks/useSignerMap';
import { useDispatch } from 'react-redux';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import { emailCheck, getKeyUID } from 'src/utils/utilities';
import Note from 'src/components/Note/Note';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useAppSelector } from 'src/store/hooks';
import idx from 'idx';
import { Colors } from 'react-native/Libraries/NewAppScreen';

function IKSAddEmailPhone({ route }) {
  const [email, setEmail] = useState('');
  const [emailStatusFail, setEmailStatusFail] = useState(false);
  const { vaultId } = route.params;
  const vault: Vault = useVault({ vaultId }).activeVault;
  const { showToast } = useToastMessage();
  const { signerMap } = useSignerMap() as { signerMap: { [key: string]: Signer } };
  const dispatch = useDispatch();
  const [ikVaultKey] = vault.signers.filter(
    (vaultKey) => signerMap[getKeyUID(vaultKey)].type === SignerType.INHERITANCEKEY
  );
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common, vault: vaultTranslation } = translations;
  const { inheritanceKeyExistingEmailCount } = useAppSelector((state) => state.storage);

  const updateIKSPolicy = async (email: string) => {
    try {
      const IKSigner = signerMap[getKeyUID(ikVaultKey)];
      if (IKSigner.inheritanceKeyInfo === undefined) {
        showToast(vaultTranslation.IKSconfMissToast, <TickIcon />);
      }

      const existingPolicy: InheritancePolicy = IKSigner.inheritanceKeyInfo.policy;
      const existingEmails = idx(existingPolicy, (_) => _.alert.emails) || [];

      const latestEmailIndex = inheritanceKeyExistingEmailCount || 0; // || 0 for backward compatibility: inheritanceKeyExistingEmailCount might be undefined for upgraded apps
      existingEmails[latestEmailIndex] = email; // only update email for the latest inheritor(for source app, inheritanceKeyExistingEmailCount is 0)

      const updatedPolicy: InheritancePolicy = {
        ...existingPolicy,
        alert: {
          emails: existingEmails,
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
        showToast(`${vaultTranslation.IKSconfMissVaultToast} ${vault.id}`);
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
        showToast(vaultTranslation.addEmailSuccessToast, <TickIcon />);
        viewVault();
      } else showToast(vaultTranslation.addEmailFailedToast);
    } catch (err) {
      captureError(err);
      showToast(vaultTranslation.addEmailFailedToast);
    }
  };

  const viewVault = () => {
    const navigationState = {
      index: 1,
      routes: [
        { name: 'Home' },
        {
          name: 'VaultDetails',
          params: { vaultId: vaultId, vaultTransferSuccessful: true },
        },
      ],
    };
    navigation.dispatch(CommonActions.reset(navigationState));
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={vaultTranslation.addEmail} subtitle="To receive key access alerts" />
      <Box style={styles.mainContainer}>
        <Box style={styles.inputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
          <Input
            placeholder={vaultTranslation.addEmailPlaceHolder}
            placeholderTextColor={`${colorMode}.SlateGreen`}
            style={styles.input}
            borderWidth={0}
            height={50}
            variant={'unstyled'}
            marginLeft={3}
            value={email}
            onChangeText={(text) => {
              setEmail(text.trim());
              emailStatusFail && setEmailStatusFail(false);
            }}
            _input={
              colorMode === 'dark' && {
                selectionColor: Colors.bodyText,
                cursorColor: Colors.bodyText,
              }
            }
          />
          {emailStatusFail && (
            <Text style={[styles.errorStyle, { color: `${colorMode}.errorRed` }]}>
              Email is not correct
            </Text>
          )}
        </Box>
        <Box style={styles.noteContainer}>
          <Note title={common.note} subtitle={vaultTranslation.addEmailNoteSubtitle} />
        </Box>
        <Buttons
          primaryText={common.confirm}
          primaryCallback={() => {
            if (!emailCheck(email)) {
              setEmailStatusFail(true);
            } else {
              updateIKSPolicy(email);
            }
          }}
          secondaryText={common.skip}
          secondaryCallback={viewVault}
        />
      </Box>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: wp(18),
  },
  inputWrapper: {
    marginVertical: hp(40),
    marginHorizontal: 4,
    borderRadius: 10,
  },
  input: {
    width: '90%',
    fontSize: 14,
    paddingLeft: 5,
  },
  errorStyle: {
    marginTop: 10,
  },
  noteContainer: {
    marginBottom: 18,
  },
});
export default IKSAddEmailPhone;
