import AddWalletModal from '../components/AddWalletModal';
import RampModal from '../../WalletDetails/components/RampModal';
import { DowngradeModal } from '../components/DowngradeModal';
import ElectrumDisconnectModal from '../components/ElectrumDisconnectModal';

export function HomeModals({
  addImportVisible,
  electrumErrorVisible,
  showBuyRampModal,
  setAddImportVisible,
  setElectrumErrorVisible,
  setShowBuyRampModal,
  receivingAddress,
  balance,
  presentationName,
  navigation,
  wallets,
  collaborativeWallets,
  setDefaultWalletCreation,
}) {
  return (
    <>
      <AddWalletModal
        navigation={navigation}
        visible={addImportVisible}
        setAddImportVisible={setAddImportVisible}
        wallets={wallets}
        collaborativeWallets={collaborativeWallets}
        setDefaultWalletCreation={setDefaultWalletCreation}
      />
      <RampModal
        showBuyRampModal={showBuyRampModal}
        setShowBuyRampModal={setShowBuyRampModal}
        receivingAddress={receivingAddress}
        balance={balance}
        name={presentationName}
      />
      <DowngradeModal navigation={navigation} />
      <ElectrumDisconnectModal
        electrumErrorVisible={electrumErrorVisible}
        setElectrumErrorVisible={setElectrumErrorVisible}
      />
    </>
  );
}
