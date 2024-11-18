import React, { useState } from 'react';
import { Box, Text } from 'native-base';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorMode } from 'native-base';
import useBalance from 'src/hooks/useBalance';
import BTC from 'src/assets/images/btc.svg';
import { useAppSelector } from 'src/store/hooks';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import RightArrowGrey from 'src/assets/images/icon_arrow_grey.svg';
import RightArrowWhite from 'src/assets/images/icon_arrow_white.svg';
import { hp } from 'src/constants/responsive';

interface TransferCardProps {
  title: string;
  subTitle?: string;
  amount?: number;
  titleFontSize?: number;
  titleFontWeight?: number | string;
  titleColor?: string;
  subTitleFontSize?: number;
  subTitleFontWeight?: number | string;
  subTitleColor?: string;
  amountFontSize?: number;
  amountFontWeight?: number | string;
  amountColor?: string;
  unitFontSize?: number;
  unitColor?: string;
  unitFontWeight?: number | string;
  type?: 'default' | 'cta' | 'list';
  list?: { address: string; amount: number }[];
  onPress?: Function;
}

const TransferCard: React.FC<TransferCardProps> = ({
  title,
  subTitle = '',
  amount,
  titleFontSize,
  titleFontWeight,
  titleColor,
  subTitleFontSize,
  subTitleFontWeight,
  subTitleColor,
  amountFontSize,
  amountFontWeight,
  amountColor,
  unitFontSize,
  unitFontWeight,
  unitColor,
  type = 'default',
  list = [],
  onPress,
}) => {
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();
  const { colorMode } = useColorMode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const isCurrentCurrencyFiat = currentCurrency === CurrencyKind.FIAT;
  const currencyCode = useCurrencyCode();
  const isDarkMode = colorMode === 'dark';
  const isDefaultType = type === 'default';
  const isCTAType = type === 'cta';
  const isListType = type === 'list';
  const [showList, setShowList] = useState(false);

  return (
    <>
      <TouchableOpacity
        disabled={isDefaultType}
        onPress={() => (isListType ? setShowList((value) => !value) : onPress())}
      >
        <Box style={[styles.container, (isCTAType || isListType) && styles.rowContainer]}>
          <Text
            color={titleColor || `${colorMode}.primaryText`}
            fontSize={titleFontSize || 15}
            fontWeight={titleFontWeight}
          >
            {title}
          </Text>

          {(isCTAType || isListType) && (
            <Box>
              <Box
                style={[
                  styles.ctaContainer,
                  isListType && {
                    transform: [{ rotate: showList ? '-90deg' : '90deg' }],
                  },
                ]}
              >
                {isDarkMode ? <RightArrowWhite /> : <RightArrowGrey />}
              </Box>
            </Box>
          )}

          {isDefaultType && (
            <Box style={styles.subtitleContainer}>
              <Text
                color={subTitleColor || `${colorMode}.textGreenGrey`}
                fontSize={subTitleFontSize || 14}
                fontWeight={subTitleFontWeight}
              >
                {subTitle}
              </Text>
              {amount && (
                <Box style={styles.amountContainer}>
                  {!isCurrentCurrencyFiat &&
                    getCurrencyIcon(BTC, colorMode === 'light' ? 'dark' : 'light')}
                  <Text
                    color={amountColor || `${colorMode}.textGreenGrey`}
                    fontSize={amountFontSize || 15}
                    fontWeight={amountFontWeight}
                  >
                    {` ${getBalance(amount)} `}
                  </Text>

                  <Text
                    color={unitColor || `${colorMode}.textGreenGrey`}
                    fontSize={unitFontSize || 12}
                    fontWeight={unitFontWeight}
                  >
                    {getSatUnit()}
                    {isCurrentCurrencyFiat && currencyCode}
                  </Text>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </TouchableOpacity>
      {showList && (
        <>
          <Box style={styles.horizontalLineStyle} borderBottomColor={`${colorMode}.Border`} />
          <ScrollView style={{ maxHeight: hp(150) }}>
            {list.map((item, index) => (
              <>
                <Box style={styles.spacer} borderBottomColor={`${colorMode}.Border`} />
                <Box key={index} style={styles.listItemContainer}>
                  <Box maxWidth={'60%'}>
                    <Text
                      color={`${colorMode}.secondaryText`}
                      fontSize={10}
                      fontWeight={500}
                      ellipsizeMode="middle"
                    >
                      {item.address}
                    </Text>
                  </Box>
                  <Box
                    color={unitColor || `${colorMode}.secondaryText`}
                    fontSize={13}
                    fontWeight={unitFontWeight}
                    flexDirection={'row'}
                    alignItems={'center'}
                  >
                    {!isCurrentCurrencyFiat &&
                      getCurrencyIcon(BTC, colorMode === 'light' ? 'dark' : 'light')}
                    <Text>{`${getBalance(item.amount)} ${getSatUnit()}`}</Text>
                  </Box>
                </Box>
              </>
            ))}
          </ScrollView>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    gap: 2.5,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: hp(18),
  },
  ctaContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalLineStyle: {
    borderBottomWidth: 0.5,
    marginTop: hp(12),
    marginBottom: hp(6),
    opacity: 0.5,
  },
  spacer: {
    height: 10,
  },
  listItemContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingHorizontal: hp(18),
    alignItems: 'flex-start',
  },
});

export default TransferCard;
