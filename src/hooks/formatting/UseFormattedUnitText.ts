
import { useMemo } from 'react'
import BitcoinUnit, { displayNameForBitcoinUnit } from 'src/common/data/enums/BitcoinUnit';
import CurrencyKind from 'src/common/data/enums/CurrencyKind';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';

export type Props = {
    bitcoinUnit?: BitcoinUnit;
    currencyKind?: CurrencyKind;
};

export default function useFormattedUnitText({
    bitcoinUnit = BitcoinUnit.SATS,
    currencyKind = useAppSelector((state) => state?.settings?.currencyKind),
}: Props): string {
    const fiatCurrencyCode = useCurrencyCode()
    const prefersBitcoin: boolean = useMemo(() => {
        return currencyKind === CurrencyKind.BITCOIN
    }, [currencyKind])

    if (prefersBitcoin) {
        return displayNameForBitcoinUnit(bitcoinUnit)
    } else {
        return fiatCurrencyCode
    }
}
