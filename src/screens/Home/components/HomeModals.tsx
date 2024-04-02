import { DowngradeModal } from '../components/DowngradeModal';
import ElectrumDisconnectModal from '../components/ElectrumDisconnectModal';

export function HomeModals({ electrumErrorVisible, setElectrumErrorVisible, navigation }) {
  return (
    <>
      <DowngradeModal navigation={navigation} />
      <ElectrumDisconnectModal
        electrumErrorVisible={electrumErrorVisible}
        setElectrumErrorVisible={setElectrumErrorVisible}
      />
    </>
  );
}
