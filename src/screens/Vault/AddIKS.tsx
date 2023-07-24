import React, { useCallback, useState } from 'react';
import InheritanceKeyIllustration from 'src/assets/images/illustration_inheritanceKey.svg';
import { Box, View } from 'native-base';
import KeeperModal from 'src/components/KeeperModal';
import useToastMessage from 'src/hooks/useToastMessage';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import InheritanceKeyServer from 'src/core/services/operations/InheritanceKey';
import { generateSignerFromMetaData } from 'src/hardware';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { useDispatch } from 'react-redux';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { BulletPoint } from './HardwareModalMap';

const config = {
  Illustration: <InheritanceKeyIllustration />,
  Instructions: [
    'Manually provide the signing device details',
    `The hardened part of the derivation path of the xpub has to be denoted with a " h " or " ' ". Please do not use any other charecter`,
  ],
  title: 'Setting up a Inheritance Key',
  subTitle: 'Keep your signing device ready before proceeding',
};
function AddIKS({ vault, visible, close }: { vault: Vault; visible: boolean; close: () => void }) {
  const [inProgress, setInProgress] = useState(false);

  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const Content = useCallback(
    () => (
      <View>
        <Box style={{ alignSelf: 'center', marginRight: 35 }}>{config.Illustration}</Box>
        <Box marginTop="4">
          {config.Instructions.map((instruction) => (
            <BulletPoint text={instruction} />
          ))}
        </Box>
      </View>
    ),
    []
  );

  const setupInheritanceKey = async () => {
    close();
    setInProgress(true);
    const { setupData } = await InheritanceKeyServer.initializeIKSetup(vault.shellId);
    const { inheritanceXpub: xpub, derivationPath, masterFingerprint } = setupData;
    const inheritanceKey = generateSignerFromMetaData({
      xpub,
      derivationPath,
      xfp: masterFingerprint,
      signerType: SignerType.INHERITANCEKEY,
      storageType: SignerStorage.WARM,
      isMultisig: true,
    });
    setInProgress(false);
    dispatch(addSigningDevice(inheritanceKey));
    showToast(`${inheritanceKey.signerName} added successfully`, <TickIcon />);
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
