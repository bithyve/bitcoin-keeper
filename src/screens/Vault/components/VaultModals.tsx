import Text from 'src/components/KeeperText';
import { Box, useColorMode, View } from 'native-base';
import React, { useCallback, useState } from 'react';
import { hp } from 'src/constants/responsive';
import KeeperModal from 'src/components/KeeperModal';
import VaultSetupIcon from 'src/assets/images/vault_setup.svg';
import { setIntroModal } from 'src/store/reducers/vaults';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import useVault from 'src/hooks/useVault';
import { useRoute } from '@react-navigation/native';
import openLink from 'src/utils/OpenLink';
import RampModal from './RampModal';
import VaultCreatedModal from './VaultCreatedModal';

function VaultModals({
  showBuyRampModal,
  setShowBuyRampModal,
}: {
  showBuyRampModal: boolean;
  setShowBuyRampModal: any;
}) {
  const { colorMode } = useColorMode();
  const route = useRoute();
  const { vaultTransferSuccessful } = (route.params as any) || { vaultTransferSuccessful: false };
  const dispatch = useDispatch();
  const introModal = useAppSelector((state) => state.vault.introModal);
  const { activeVault: vault } = useVault();
  const [vaultCreated, setVaultCreated] = useState(vaultTransferSuccessful);

  const VaultContent = useCallback(
    () => (
      <View marginY={5}>
        <Box alignSelf="center">
          <VaultSetupIcon />
        </Box>
        <Text marginTop={hp(20)} color="white" fontSize={13} letterSpacing={0.65} padding={1}>
          Keeper supports all the popular bitcoin signers (Hardware Wallets) that a user can select
        </Text>
        <Text color="white" fontSize={13} letterSpacing={0.65} padding={1}>
          There are also some additional options if you do not have hardware signers
        </Text>
      </View>
    ),
    []
  );
  const closeVaultCreatedDialog = () => {
    setVaultCreated(false);
  };

  return (
    <>
      <VaultCreatedModal
        vault={vault}
        vaultCreated={vaultCreated}
        close={closeVaultCreatedDialog}
      />
      <KeeperModal
        visible={introModal}
        close={() => {
          dispatch(setIntroModal(false));
        }}
        title="Keeper vault"
        subTitle={`Depending on your tier - ${SubscriptionTier.L1}, ${SubscriptionTier.L2} or ${SubscriptionTier.L3}, you need to add signers to the vault`}
        modalBackground={`${colorMode}.modalGreenBackground`}
        textColor={`${colorMode}.modalGreenContent`}
        Content={VaultContent}
        buttonTextColor={colorMode === 'light' ? `${colorMode}.greenText2` : `${colorMode}.white`}
        buttonBackground={`${colorMode}.modalWhiteButton`}
        buttonText="Continue"
        buttonCallback={() => {
          dispatch(setIntroModal(false));
        }}
        DarkCloseIcon
        learnMore
        learnMoreCallback={() => openLink('https://www.bitcoinkeeper.app/')}
      />
      <RampModal
        vault={vault}
        showBuyRampModal={showBuyRampModal}
        setShowBuyRampModal={setShowBuyRampModal}
      />
    </>
  );
}

export default VaultModals;
