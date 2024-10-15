import { Box } from 'native-base';
import React, { useContext, useState } from 'react';
import OptionCard from 'src/components/OptionCard';
import RecreateWalletIcon from 'src/assets/images/recreate_wallet.svg';
import WatchOnlyIcon from 'src/assets/images/watch_only.svg';
import ConfigurationIcon from 'src/assets/images/file.svg';
import SignerImportIcon from 'src/assets/images/signer_import.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import KeeperModal from 'src/components/KeeperModal';
import SingleKey from 'src/assets/images/single_key.svg';
import MultiKey from 'src/assets/images/multi_key.svg';
import SignerCard from '../AddSigner/SignerCard';
import { WalletType } from 'src/services/wallets/enums';
import { CommonActions } from '@react-navigation/native';

enum RecreateOptions {
  SINGLE_KEY = 'SINGLE_KEY',
  MULTI_KEY = 'MULTI_KEY',
}

function ImportWallets({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { importWallet } = translations;
  const [showRecreateModal, setShowRecreateModal] = useState(false);
  const [selectedRecreateOption, setSelectedRecreateOption] = useState(RecreateOptions.SINGLE_KEY);

  const recreateOptions = [
    {
      name: RecreateOptions.SINGLE_KEY,
      title: 'Single-key',
      subTitle: 'Single-sig wallet',
      icon: <SingleKey />,
    },
    {
      name: RecreateOptions.MULTI_KEY,
      title: 'Multi-key',
      subTitle: 'Multisig vault',
      icon: <MultiKey />,
    },
  ];

  const RecreateModalContent = () => {
    return (
      <Box
        style={{
          marginVertical: 5,
          gap: 2,
          flexDirection: 'row',
        }}
      >
        {recreateOptions &&
          recreateOptions.map((option) => (
            <SignerCard
              key={option.name}
              isSelected={selectedRecreateOption === option.name}
              isFullText={true}
              name={option.title}
              subtitle={option.subTitle}
              icon={option.icon}
              onCardSelect={() => {
                setSelectedRecreateOption(option.name);
              }}
              colorMode="light"
            />
          ))}
      </Box>
    );
  };

  return (
    <Box>
      <OptionCard
        title={importWallet.recreateWallet}
        description={importWallet.recreateWalletSubtitle}
        LeftIcon={<RecreateWalletIcon />}
        callback={() => setShowRecreateModal(true)}
      />
      <OptionCard
        title={importWallet.usingConfigFile}
        description={importWallet.usingConfigFileSubtitle}
        LeftIcon={<ConfigurationIcon />}
        callback={() => navigation.navigate('VaultConfigurationCreation')}
      />
      <OptionCard
        title={importWallet.importXpub}
        description={importWallet.importXpubSubtitle}
        LeftIcon={<WatchOnlyIcon />}
        callback={() => navigation.navigate('ImportWallet')}
      />
      <OptionCard
        title={importWallet.importVaultFromSigner}
        description={importWallet.importVaultFromSignerSubtitle}
        LeftIcon={<SignerImportIcon />}
        callback={() => navigation.navigate('SigningDeviceConfigRecovery')}
      />
      <KeeperModal
        visible={showRecreateModal}
        close={() => setShowRecreateModal(false)}
        title={importWallet.recreateWalletModalTitle}
        subTitle={importWallet.recreateWalletModalSubtitle}
        buttonText={'Proceed'}
        buttonCallback={() => {
          switch (selectedRecreateOption) {
            case RecreateOptions.SINGLE_KEY:
              navigation.navigate('EnterWalletDetail', {
                name: '',
                description: '',
                type: WalletType.DEFAULT,
                isHotWallet: false,
              });
              break;
            case RecreateOptions.MULTI_KEY:
              navigation.dispatch(
                CommonActions.navigate({ name: 'VaultSetup', params: { scheme: { m: 2, n: 3 } } })
              );
              break;
          }
        }}
        Content={RecreateModalContent}
      />
    </Box>
  );
}

export default ImportWallets;
