import { Box, useColorMode } from 'native-base';
import { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useAppSelector } from 'src/store/hooks';
import AmountDetails from './AmountDetails';
import ReceiptWrapper from './ReceiptWrapper';
import TransferCard from './TransferCard';
import Text from 'src/components/KeeperText';
import { hp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';

function SendSuccessfulContent({
  transactionPriority,
  amounts,
  sender,
  recipients,
  addresses,
  primaryText,
  primaryCallback,
  secondaryText,
  secondaryCallback,
  SecondaryIcon,
  primaryButtonWidth,
}) {
  const { colorMode } = useColorMode();
  const txFeeInfo = useAppSelector((state) => state.sendAndReceive.transactionFeeInfo);
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTransactions } = translations;

  return (
    <Box style={styles.container}>
      <ReceiptWrapper>
        {amounts.flatMap((amount, index) => [
          <TransferCard
            title="Send from"
            subTitle={sender?.presentationData?.name}
            titleFontSize={15}
            titleFontWeight={300}
            amount={amount}
            subTitleFontSize={14}
            subTitleFontWeight={200}
            amountFontSize={14}
            amountFontWeight={200}
            unitFontSize={12}
            unitFontWeight={300}
            unitColor={`${colorMode}.modalUnitColor`}
          />,
          <TransferCard
            title="Send to"
            titleFontWeight={300}
            subTitle={
              !addresses[index] ? recipients[index]?.presentationData?.name : addresses[index]
            }
            subTitleFontWeight={200}
            titleFontSize={15}
            subTitleFontSize={14}
          />,
        ])}
      </ReceiptWrapper>
      <Box style={styles.detailsContainer}>
        <AmountDetails
          title={walletTransactions.totalAmount}
          titleFontSize={15}
          titleFontWeight={200}
          titleColor={`${colorMode}.textGreenGrey`}
          amount={amounts.reduce((sum, amount) => sum + amount, 0)}
          amountFontSize={15}
          amountFontWeight={200}
          amountColor={`${colorMode}.primaryText`}
          unitFontSize={12}
          unitFontWeight={300}
          unitColor={`${colorMode}.modalUnitColor`}
        />
        <AmountDetails
          title={walletTransactions.totalFees}
          titleFontSize={15}
          titleFontWeight={200}
          titleColor={`${colorMode}.textGreenGrey`}
          amount={txFeeInfo[transactionPriority?.toLowerCase()]?.amount}
          amountFontSize={15}
          amountFontWeight={200}
          amountColor={`${colorMode}.primaryText`}
          unitFontSize={12}
          unitFontWeight={300}
          unitColor={`${colorMode}.modalUnitColor`}
        />
        <Box style={styles.horizontalLineStyle} borderBottomColor={`${colorMode}.receiptBorder`} />
        <AmountDetails
          title={walletTransactions.total}
          titleFontSize={15}
          titleFontWeight={200}
          titleColor={`${colorMode}.primaryText`}
          amount={
            amounts.reduce((sum, amount) => sum + amount, 0) +
            txFeeInfo[transactionPriority?.toLowerCase()]?.amount
          }
          amountFontSize={16}
          amountFontWeight={200}
          amountColor={`${colorMode}.primaryText`}
          unitFontSize={14}
          unitFontWeight={300}
          unitColor={`${colorMode}.modalUnitColor`}
        />
      </Box>
      <Box style={styles.sendSuccessfullNote}>
        <Text color={`${colorMode}.placeHolderTextColor`} fontSize={13}>
          {walletTransactions.sendTransSuccessMsg}
        </Text>
      </Box>
      <Box>
        <Buttons
          primaryText={primaryText}
          primaryCallback={primaryCallback}
          primaryTextColor={`${colorMode}.buttonText`}
          secondaryText={secondaryText}
          secondaryCallback={secondaryCallback}
          SecondaryIcon={SecondaryIcon}
          width={primaryButtonWidth}
        />
      </Box>
    </Box>
  );
}

export default SendSuccessfulContent;

const styles = StyleSheet.create({
  container: {
    marginTop: -15,
  },
  horizontalLineStyle: {
    borderBottomWidth: 1,
    marginTop: hp(10),
    marginBottom: hp(5),
  },
  detailsContainer: {
    marginTop: hp(30),
    gap: 5,
  },
  sendSuccessfullNote: {
    marginTop: hp(10),
    marginBottom: hp(20),
  },
});
