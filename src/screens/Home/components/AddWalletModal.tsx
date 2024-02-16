import { StyleSheet } from 'react-native';
import React, { useContext } from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { Box, useColorMode } from 'native-base';
import MenuItemButton from 'src/components/CustomButton/MenuItemButton';
import AddWallet from 'src/assets/images/addWallet.svg';
import ImportWallet from 'src/assets/images/importWallet.svg';
import AddCollaborativeWalletIcon from 'src/assets/images/icon_collab.svg';
import { NewWalletInfo } from 'src/store/sagas/wallets';
import { WalletType } from 'src/core/wallets/enums';
import { v4 as uuidv4 } from 'uuid';
import { defaultTransferPolicyThreshold } from 'src/store/sagas/storage';
import { addNewWallets } from 'src/store/sagaActions/wallets';
import { useDispatch } from 'react-redux';
import Text from 'src/components/KeeperText';
import { hp } from 'src/constants/responsive';

const addNewDefaultWallet = (walletsCount, dispatch) => {
  const newWallet: NewWalletInfo = {
    walletType: WalletType.DEFAULT,
    walletDetails: {
      name: `Wallet ${walletsCount + 1} `,
      description: ``,
      transferPolicy: {
        id: uuidv4(),
        threshold: defaultTransferPolicyThreshold,
      },
    },
  };
  dispatch(addNewWallets([newWallet]));
};

function AddImportWallet({
  wallets,
  collaborativeWallets,
  setAddImportVisible,
  setDefaultWalletCreation,
  navigation,
}) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;

  const addCollaborativeWallet = () => {
    setAddImportVisible(false);
    const collaborativeWalletsCount = collaborativeWallets.length;
    const walletsCount = wallets.length;
    if (collaborativeWalletsCount < walletsCount) {
      navigation.navigate('SetupCollaborativeWallet', {
        coSigner: wallets[collaborativeWalletsCount],
        walletId: wallets[collaborativeWalletsCount].id,
        collaborativeWalletsCount,
      });
    } else {
      setDefaultWalletCreation(true);
      addNewDefaultWallet(wallets.length, dispatch);
    }
  };

  return (
    <Box>
      <MenuItemButton
        onPress={() => {
          setAddImportVisible(false);
          navigation.navigate('EnterWalletDetail', {
            name: `Wallet ${wallets.length + 1}`,
            description: '',
            type: WalletType.DEFAULT,
          });
        }}
        icon={<AddWallet />}
        title={wallet.addWallet}
        subTitle={wallet.addWalletSubTitle}
        height={80}
      />
      <MenuItemButton
        onPress={() => {
          setAddImportVisible(false);
          navigation.navigate('ImportWallet');
        }}
        icon={<ImportWallet />}
        title={wallet.importWalletTitle}
        subTitle={wallet.manageWalletSubTitle}
        height={80}
      />
      <MenuItemButton
        onPress={addCollaborativeWallet}
        icon={<AddCollaborativeWalletIcon />}
        title={wallet.addCollabWalletTitle}
        subTitle={wallet.addCollabWalletSubTitle}
        height={80}
      />
      <Box>
        <Text color={`${colorMode}.greenText`} style={styles.addImportParaContent}>
          {wallet.addCollabWalletParagraph}
        </Text>
      </Box>
    </Box>
  );
}

const AddWalletModal = ({
  navigation,
  visible,
  setAddImportVisible,
  wallets,
  collaborativeWallets,
  setDefaultWalletCreation,
}) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { importWallet } = translations;

  return (
    <KeeperModal
      visible={visible}
      close={() => setAddImportVisible(false)}
      title={importWallet.AddImportModalTitle}
      subTitle={importWallet.AddImportModalSubTitle}
      modalBackground={`${colorMode}.modalWhiteBackground`}
      subTitleColor={`${colorMode}.secondaryText`}
      textColor={`${colorMode}.primaryText`}
      DarkCloseIcon={colorMode === 'dark'}
      Content={() => (
        <AddImportWallet
          wallets={wallets}
          collaborativeWallets={collaborativeWallets}
          setAddImportVisible={setAddImportVisible}
          setDefaultWalletCreation={setDefaultWalletCreation}
          navigation={navigation}
        />
      )}
    />
  );
};

export default AddWalletModal;

const styles = StyleSheet.create({
  addImportParaContent: {
    fontSize: 13,
    padding: 2,
    marginTop: hp(20),
  },
});
