import React, { useCallback, useEffect, useState } from 'react';
import InheritanceKeyIllustration from 'src/assets/images/illustration_inheritanceKey.svg';
import { Box, View, Pressable } from 'native-base';
import KeeperModal from 'src/components/KeeperModal';
import useToastMessage from 'src/hooks/useToastMessage';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import InheritanceKeyServer from 'src/services/operations/InheritanceKey';
import { generateSignerFromMetaData } from 'src/hardware';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { useDispatch } from 'react-redux';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { setBackupBSMSForIKS } from 'src/store/reducers/vaults';
import Text from 'src/components/KeeperText';
import Instruction from 'src/components/Instruction';

const config = {
  Illustration: <InheritanceKeyIllustration />,
  Instructions: [
    'Manually provide the signing device details',
    `The hardened part of the derivation path of the xpub has to be denoted with a " h " or " ' ". Please do not use any other charecter`,
  ],
  title: 'Setting up the Inheritance Key',
  subTitle: 'Keep your signing device ready before proceeding',
};
function AddIKS({ vault, visible, close }: { vault: Vault; visible: boolean; close: () => void }) {
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();

  const [inProgress, setInProgress] = useState(false);
  const [backupBSMS, setBackupBSMS] = useState(false);

  useEffect(() => {
    dispatch(setBackupBSMSForIKS(backupBSMS));
  }, [backupBSMS]);

  const Content = useCallback(
    () => (
      <View>
        <Box style={{ alignSelf: 'center', marginRight: 35 }}>{config.Illustration}</Box>
        <Pressable
          onPress={() => {
            setBackupBSMS(!backupBSMS);
          }}
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}
        >
          {backupBSMS ? (
            <TickIcon />
          ) : (
            <Box
              style={{
                height: 18,
                width: 18,
                borderRadius: 18,
                borderColor: '#000',
                borderWidth: 1,
              }}
            />
          )}
          <Text style={{ fontSize: 14, marginLeft: 15 }}>Backup Vault Config (BSMS)</Text>
        </Pressable>
        <Box marginTop="4">
          {config.Instructions.map((instruction) => (
            <Instruction text={instruction} key={instruction} />
          ))}
        </Box>
      </View>
    ),
    [backupBSMS]
  );

  const setupInheritanceKey = async () => {
    try {
      close();
      setInProgress(true);
      const { setupData } = await InheritanceKeyServer.initializeIKSetup();
      const { id, inheritanceXpub: xpub, derivationPath, masterFingerprint } = setupData;
      const { signer: inheritanceKey, key } = generateSignerFromMetaData({
        xpub,
        derivationPath,
        masterFingerprint,
        signerType: SignerType.INHERITANCEKEY,
        storageType: SignerStorage.WARM,
        signerId: id,
        isMultisig: true,
      });
      setInProgress(false);
      dispatch(addSigningDevice([inheritanceKey], [key]));
      showToast(`${inheritanceKey.signerName} added successfully`, <TickIcon />);
    } catch (err) {
      console.log({ err });
      showToast(`Failed to add inheritance key`, <TickIcon />);
    }
  };

  return (
    <>
      <ActivityIndicatorView visible={inProgress} />
      <KeeperModal
        visible={visible}
        close={close}
        title={config.title}
        subTitle={config.subTitle}
        buttonText="Proceed"
        buttonTextColor="light.white"
        buttonCallback={setupInheritanceKey}
        textColor="light.primaryText"
        Content={Content}
      />
    </>
  );
}

export default AddIKS;
