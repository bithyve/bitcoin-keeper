import React from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { useColorMode } from 'native-base';
import FeeInsightsContent from 'src/screens/FeeInsights/FeeInsightsContent';
import useOneDayInsight from 'src/hooks/useOneDayInsight';

interface Props {
  showModal: boolean;
  toogleInsights: () => void;
}

const FeeInsightModal = (props: Props) => {
  const { showModal, toogleInsights } = props;
  const { colorMode } = useColorMode();
  const OneDayHistoricalFee = useOneDayInsight();
  return (
    <KeeperModal
      visible={showModal}
      close={toogleInsights}
      showCloseIcon={false}
      modalBackground={`${colorMode}.modalWhiteBackground`}
      subTitleColor={`${colorMode}.secondaryText`}
      textColor={`${colorMode}.primaryText`}
      buttonTextColor={`${colorMode}.white`}
      buttonText={'Done'}
      buttonCallback={toogleInsights}
      Content={() => <FeeInsightsContent oneDayFeeRate={OneDayHistoricalFee} />}
    />
  );
};

export default FeeInsightModal;

