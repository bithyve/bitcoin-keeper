import Text from 'src/components/KeeperText';
import { Box, View } from 'native-base';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { hp } from 'src/common/data/responsiveness/responsive';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import KeeperModal from 'src/components/KeeperModal';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { VaultMigrationType } from 'src/core/wallets/enums';
import VaultSetupIcon from 'src/assets/images/vault_setup.svg';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { setIntroModal } from 'src/store/reducers/vaults';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import useVault from 'src/hooks/useVault';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import TierUpgradeModal from 'src/screens/ChoosePlanScreen/TierUpgradeModal';
import RampModal from './RampModal';
import VaultCreatedModal from './VaultCreatedModal';

function VaultModals({
  showBuyRampModal,
  setShowBuyRampModal,
  hasPlanChanged,
}: {
  showBuyRampModal: boolean;
  setShowBuyRampModal: any;
  hasPlanChanged: any;
}) {
  const route = useRoute();
  const { vaultTransferSuccessful } = (route.params as any) || { vaultTransferSuccessful: false };
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const introModal = useAppSelector((state) => state.vault.introModal);
  const { useQuery } = useContext(RealmWrapperContext);
  const vault: Vault = useVault().activeVault;
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const [vaultCreated, setVaultCreated] = useState(vaultTransferSuccessful);
  const [tireChangeModal, setTireChangeModal] = useState(false);

  const VaultContent = useCallback(
    () => (
      <View marginY={5}>
        <Box alignSelf="center">
          <VaultSetupIcon />
        </Box>
        <Text marginTop={hp(20)} color="white" fontSize={13} letterSpacing={0.65} padding={1}>
          Keeper supports all the popular bitcoin signing devices (Hardware Wallets) that a user can
          select
        </Text>
        <Text color="white" fontSize={13} letterSpacing={0.65} padding={1}>
          There are also some additional options if you do not have hardware signing devices
        </Text>
      </View>
    ),
    []
  );
  const onPressModalBtn = () => {
    setTireChangeModal(false);
    navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
  };
  const closeVaultCreatedDialog = () => {
    setVaultCreated(false);
  };

  useEffect(() => {
    if (hasPlanChanged() !== VaultMigrationType.CHANGE) {
      setTireChangeModal(true);
    }
  }, []);
  return (
    <>
      <TierUpgradeModal
        visible={tireChangeModal}
        close={() => {
          if (hasPlanChanged() === VaultMigrationType.DOWNGRADE) {
            return;
          }
          setTireChangeModal(false);
        }}
        onPress={onPressModalBtn}
        isUpgrade={hasPlanChanged() === VaultMigrationType.UPGRADE}
        plan={keeper.subscription.name}
        closeOnOverlayClick={hasPlanChanged() !== VaultMigrationType.DOWNGRADE}
      />
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
        title="Keeper Vault"
        subTitle={`Depending on your tier - ${SubscriptionTier.L1}, ${SubscriptionTier.L2} or ${SubscriptionTier.L3}, you need to add signing devices to the vault`}
        modalBackground={['light.gradientStart', 'light.gradientEnd']}
        textColor="light.white"
        Content={VaultContent}
        buttonBackground={['#FFFFFF', '#80A8A1']}
        buttonText="Continue"
        buttonTextColor="light.greenText"
        buttonCallback={() => {
          dispatch(setIntroModal(false));
        }}
        DarkCloseIcon
        learnMore
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
