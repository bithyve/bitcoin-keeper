import { Box, Pressable, ScrollView, useColorMode } from 'native-base';
import { useContext, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import IconArrow from 'src/assets/images/icon_arrow_grey.svg';
import { DerivationPurpose, EntityKind } from 'src/services/wallets/enums';
import WalletUtilities from 'src/services/wallets/operations/utils';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import TickIcon from 'src/assets/images/icon_check.svg';
import { useAppSelector } from 'src/store/hooks';
const purposeList = [
  { label: 'P2WPKH: native segwit, single-sig', value: DerivationPurpose.BIP84 },
  { label: 'P2TR: taproot, single-sig', value: DerivationPurpose.BIP86 },
];

function DerivationPathModalContent({
  initialPath,
  initialPurpose,
  closeModal,
  setSelectedPath,
  setSelectedPurpose,
}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common, settings, wallet } = translations;
  const { bitcoinNetworkType } = useAppSelector((state) => state.settings);

  const [purpose, setPurpose] = useState(initialPurpose);
  const [showPurpose, setShowPurpose] = useState(false);
  const [arrow, setArrow] = useState(false);
  const [path, setPath] = useState(initialPath);

  useEffect(() => {
    const path = WalletUtilities.getDerivationPath(false, bitcoinNetworkType, 0, purpose);
    setPath(path);
  }, [purpose]);

  const onDropDownClick = () => {
    if (showPurpose) {
      setShowPurpose(false);
      setArrow(false);
    } else {
      setShowPurpose(true);
      setArrow(true);
    }
  };

  const onSave = () => {
    setSelectedPath(path);
    setSelectedPurpose(purpose);
    closeModal();
  };

  return (
    <Box style={styles.container}>
      <Box>
        <Box
          backgroundColor={`${colorMode}.seashellWhite`}
          borderColor={`${colorMode}.separator`}
          borderWidth={1}
          style={styles.textInputWrapper}
        >
          <Text bold>{path}</Text>
        </Box>
        <Box style={{ position: 'relative' }}>
          <Pressable
            style={[
              styles.dropDownContainer,
              showPurpose
                ? { borderTopRightRadius: 10, borderTopLeftRadius: 10 }
                : { borderRadius: 10 },
            ]}
            backgroundColor={`${colorMode}.seashellWhite`}
            onPress={onDropDownClick}
            borderColor={`${colorMode}.separator`}
            borderWidth={1}
          >
            <Text fontSize={12} bold color={`${colorMode}.textGreen`}>
              {purpose
                ? purposeList.find((item) => item.value === purpose).label
                : wallet.chooseWalletPurpose}
            </Text>
            <Box
              style={[
                {
                  transform: [{ rotate: arrow ? '-90deg' : '90deg' }],
                  marginRight: 15,
                },
              ]}
            >
              {colorMode === 'light' ? <RightArrowIcon /> : <IconArrow />}
            </Box>
          </Pressable>
          {showPurpose && (
            <ScrollView
              style={styles.langScrollViewWrapper}
              backgroundColor={`${colorMode}.seashellWhite`}
            >
              {purposeList.map((item, index) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => {
                    setShowPurpose(false);
                    setArrow(false);
                    setPurpose(item.value);
                  }}
                  style={styles.flagWrapper1}
                  testID={`purpose_item_${item.value}`}
                >
                  <Box style={styles.labelContainer}>
                    <Text
                      style={styles.purposeText}
                      semiBold={purpose === item.value}
                      color={
                        purpose === item.value ? `${colorMode}.textGreen` : `${colorMode}.GreyText`
                      }
                    >
                      {item.label}
                    </Text>
                    {purpose === item.value && <TickIcon />}
                  </Box>
                  {index !== purposeList.length - 1 && (
                    <Box
                      backgroundColor={`${colorMode}.LightGreenish`}
                      style={{ width: '100%', height: 2, opacity: 0.2 }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Box>
      </Box>
      <Buttons
        secondaryText={common.back}
        secondaryCallback={closeModal}
        primaryText={settings.SaveChanges}
        primaryCallback={onSave}
        paddingHorizontal={15}
      />
    </Box>
  );
}

export default DerivationPathModalContent;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    height: hp(400),
  },
  textInputWrapper: {
    borderRadius: 10,
    height: hp(50),
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  dropDownContainer: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: hp(50),
    marginTop: 10,
  },
  langScrollViewWrapper: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 10,
    marginTop: 5,
    position: 'absolute',
    alignSelf: 'center',
    width: '100%',
    top: 65,
    paddingVertical: 10,
  },
  flagWrapper1: {
    height: wp(50),
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 10,
  },
  purposeText: {
    fontSize: 13,
    letterSpacing: 0.39,
    marginLeft: wp(10),
  },
  labelContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
  },
});
