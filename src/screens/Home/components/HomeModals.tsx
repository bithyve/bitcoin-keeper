import RampModal from '../../WalletDetails/components/RampModal';
import { DowngradeModal } from '../components/DowngradeModal';
import ElectrumDisconnectModal from '../components/ElectrumDisconnectModal';

export function HomeModals({
  electrumErrorVisible,
  showBuyRampModal,
  setElectrumErrorVisible,
  setShowBuyRampModal,
  receivingAddress,
  balance,
  presentationName,
  navigation,
}) {
  return (
    <>
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
