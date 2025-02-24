import React, { useCallback, useEffect, useState } from 'react';
import InheritanceKeyIllustration from 'src/assets/images/illustration_inheritanceKey.svg';
import { Box, useColorMode, View } from 'native-base';
import KeeperModal from 'src/components/KeeperModal';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import InheritanceKeyServer from 'src/services/backend/InheritanceKey';
import { generateSignerFromMetaData } from 'src/hardware';
import { SignerStorage, SignerType } from 'src/services/wallets/enums';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { useDispatch } from 'react-redux';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { setBackupBSMSForIKS } from 'src/store/reducers/vaults';
import Instruction from 'src/components/Instruction';

const config = {
  Illustration: <InheritanceKeyIllustration />,
  Instructions: [
    'Manually provide the signer details',
    'The hardened part of the derivation path of the xpub has to be denoted with a " h " or " \' ". Please do not use any other charecter',
  ],
  title: 'Setting up the Inheritance Key',
  subTitle: 'Keep your signer ready before proceeding',
};
function AddIKS({ vault, visible, close }: { vault: Vault; visible: boolean; close: () => void }) {
  const { colorMode } = useColorMode();
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
        {/* <Pressable // TODO: Resolve BSMS encryption before re-enabling this
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
          <Text style={{ fontSize: 14, marginLeft: 15 }}>Backup vault Config (BSMS)</Text>
        </Pressable> */}
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
      const { id, isBIP85, inheritanceXpub: xpub, derivationPath, masterFingerprint } = setupData;
      const { signer: inheritanceKey } = generateSignerFromMetaData({
        xpub,
        derivationPath,
        masterFingerprint,
        signerType: SignerType.INHERITANCEKEY,
        storageType: SignerStorage.WARM,
        xfp: id,
        isBIP85,
        isMultisig: true,
      });
      setInProgress(false);
      dispatch(addSigningDevice([inheritanceKey]));
      showToast(
        `${inheritanceKey.signerName} added successfully`,
        <TickIcon />,
        IToastCategory.SIGNING_DEVICE
      );
    } catch (err) {
      console.log({ err });
      showToast('Failed to add inheritance key', <TickIcon />);
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
        buttonTextColor={`${colorMode}.buttonText`}
        buttonCallback={setupInheritanceKey}
        textColor={`${colorMode}.modalHeaderTitle`}
        Content={Content}
      />
    </>
  );
}

export default AddIKS;
