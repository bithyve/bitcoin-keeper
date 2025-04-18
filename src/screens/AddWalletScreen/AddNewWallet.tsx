import { Box, HStack, useColorMode } from 'native-base';
import React, { useContext, useState, useEffect } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { Pressable, StyleSheet, Vibration } from 'react-native';
import Text from 'src/components/KeeperText';
import KeeperModal from 'src/components/KeeperModal';
import ImportWalletIcon from 'src/assets/images/vault_icon.svg';
import AdvanceCustomizationIcon from 'src/assets/images/other_light.svg';
import { CommonActions } from '@react-navigation/native';
import WalletHeader from 'src/components/WalletHeader';
import { hp, windowWidth, wp } from 'src/constants/responsive';

import NewWalletIcon from 'src/assets/images/wallet-white-small.svg';
import Buttons from 'src/components/Buttons';
import DashedCta from 'src/components/DashedCta';
import SettingIcon from 'src/assets/images/new_icon_settings.svg';
import DarkSettingIcon from 'src/assets/images/settings-icon-white.svg';
import CheckIcon from 'src/assets/images/planCheckMarkSelected.svg';
import CheckDarkIcon from 'src/assets/images/check-dark-icon.svg';
import usePlan from 'src/hooks/usePlan';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import UpgradeSubscription from '../InheritanceToolsAndTips/components/UpgradeSubscription';
import { MiniscriptTypes } from 'src/services/wallets/enums';
import WalletUtilities from 'src/services/wallets/operations/utils';
import useVault from 'src/hooks/useVault';
import { TouchableOpacity } from 'react-native-gesture-handler';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Colors from 'src/theme/Colors';
import PrivateSetting from 'src/assets/images/private-setting-gold.svg';

export function NumberInput({ value, onDecrease, onIncrease }) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  return (
    <HStack
      style={styles.inputContainer}
      backgroundColor={`${colorMode}.seashellWhite`}
      borderColor={`${colorMode}.greyBorder`}
    >
      <TouchableOpacity testID="btn_decreaseValue" style={styles.button} onPress={onDecrease}>
        <Text style={styles.buttonText} color={`${colorMode}.greenText`}>
          -
        </Text>
      </TouchableOpacity>
      <Box
        style={{ height: 30, borderLeftWidth: 0.2, paddingHorizontal: 0.4 }}
        backgroundColor={isDarkMode ? Colors.primaryCream : Colors.secondaryLightGrey}
      />
      <Text style={styles.buttonValue} bold color={`${colorMode}.greenText`}>
        {value}
      </Text>
      <Box
        style={{ height: 30, borderRightWidth: 0.2, paddingHorizontal: 0.4 }}
        backgroundColor={isDarkMode ? Colors.primaryCream : Colors.secondaryLightGrey}
      />
      <TouchableOpacity testID="increaseValue" style={styles.button} onPress={onIncrease}>
        <Text style={styles.buttonText} color={`${colorMode}.greenText`}>
          +
        </Text>
      </TouchableOpacity>
    </HStack>
  );
}

function AddNewWallet({ navigation, route }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultTranslations, common } = translations;
  const [selectedWalletType, setSelectedWalletType] = useState('');
  const [customConfigModalVisible, setCustomConfigModalVisible] = useState(false);
  const [showEnhancedOptionsModal, setShowEnhancedOptionsModal] = useState(false);
  const { vaultId } = route.params || {};
  const { isOnL4 } = usePlan();
  const { activeVault } = useVault({ vaultId });
  const [scheme, setScheme] = useState(
    activeVault ? { m: activeVault.scheme.m, n: activeVault.scheme.n } : { m: 2, n: 3 }
  );
  const [inheritanceKeySelected, setInheritanceKeySelected] = useState(
    activeVault?.scheme?.miniscriptScheme?.usedMiniscriptTypes?.includes(
      MiniscriptTypes.INHERITANCE
    ) ||
      route.isAddInheritanceKeyFromParams ||
      false
  );

  const [emergencyKeySelected, setEmergencyKeySelected] = useState(
    activeVault?.scheme?.miniscriptScheme?.usedMiniscriptTypes?.includes(
      MiniscriptTypes.EMERGENCY
    ) ||
      route.isAddEmergencKeyFromParams ||
      false
  );
  const isDarkMode = colorMode === 'dark';
  const [currentBlockHeight, setCurrentBlockHeight] = useState(null);
  const { showToast } = useToastMessage();

  useEffect(() => {
    // TODO: Add more as new options are added
    const isMiniscriptEnabled = inheritanceKeySelected || emergencyKeySelected;
    if (isMiniscriptEnabled && !currentBlockHeight) {
      WalletUtilities.fetchCurrentBlockHeight()
        .then(({ currentBlockHeight }) => {
          setCurrentBlockHeight(currentBlockHeight);
        })
        .catch((err) => console.log('Failed to fetch the current chain data:', err));
    }
  }, [inheritanceKeySelected, emergencyKeySelected]);

  const CREATE_WALLET_OPTIONS = [
    {
      icon: <NewWalletIcon />,
      title: 'Single-key',
      onPress: () => {
        Vibration.vibrate(50);
        setScheme({ m: 1, n: 1 });
        setSelectedWalletType('singleKey');
      },
      id: 'singleKey',
    },
    {
      icon: <ImportWalletIcon />,
      title: '2 of 3 multi-key',
      onPress: () => {
        Vibration.vibrate(50);
        setScheme({ m: 2, n: 3 });
        setSelectedWalletType('2Of3');
      },
      id: '2Of3',
    },
    {
      icon: <AdvanceCustomizationIcon />,
      title: '3 of 5 multi-key',
      onPress: () => {
        Vibration.vibrate(50);
        setScheme({ m: 3, n: 5 });
        setSelectedWalletType('3Of5');
      },
      id: '3Of5',
    },
  ];

  const onDecreaseM = () => {
    if (scheme.m > 1) {
      Vibration.vibrate(50);
      setScheme({ ...scheme, m: scheme.m - 1 });
    }
  };
  const onIncreaseM = () => {
    if (scheme.m > 0 && scheme.m < scheme.n) {
      Vibration.vibrate(50);
      setScheme({ ...scheme, m: scheme.m + 1 });
    }
  };
  const onDecreaseN = () => {
    if (scheme.n > 1 && scheme.n > scheme.m) {
      Vibration.vibrate(50);
      setScheme({ ...scheme, n: scheme.n - 1 });
    }
  };
  const onIncreaseN = () => {
    if (scheme.n < 10) {
      Vibration.vibrate(50);
      setScheme({ ...scheme, n: scheme.n + 1 });
    }
  };

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title="Select your wallet type" />
      <Box style={styles.addWalletOptionsList}>
        {CREATE_WALLET_OPTIONS.map((option, index) => (
          <OptionItem
            key={index}
            option={option}
            colorMode={colorMode}
            active={selectedWalletType === option.id}
          />
        ))}
        <Pressable
          onPress={() => {
            setCustomConfigModalVisible(true);
          }}
        >
          <Box
            style={[styles.optionCTR, styles.customOption]}
            backgroundColor={isDarkMode ? Colors.seperatorDark : `${colorMode}.separator`}
            borderColor={
              selectedWalletType === 'custom'
                ? `${colorMode}.pantoneGreen`
                : `${colorMode}.primaryBackground`
            }
          >
            <Text
              color={`${colorMode}.greenText`}
              fontSize={14}
              medium
              style={{ textAlign: 'center', flex: 1 }}
            >
              Select custom setup{' '}
              {selectedWalletType === 'custom' ? `: ${scheme.m} of ${scheme.n}` : ''}
            </Text>
          </Box>
        </Pressable>
      </Box>
      <Box style={styles.footer}>
        <DashedCta
          textPosition="left"
          backgroundColor={`${colorMode}.dullGreen`}
          hexagonBackgroundColor={isDarkMode ? Colors.DeepCharcoalGreen : `${colorMode}.dullGreen`}
          textColor={isDarkMode ? Colors.headerWhite : `${colorMode}.pantoneGreen`}
          name="Enhanced Security Options"
          description="Secure your funds and future—your way"
          callback={() => setShowEnhancedOptionsModal(true)}
          icon={isOnL4 ? <PrivateSetting /> : isDarkMode ? <DarkSettingIcon /> : <SettingIcon />}
          iconWidth={22}
          iconHeight={20}
          cardStyles={styles.enhancedVaultsCustomStyles}
          titleSize={15}
          borderColor={
            isOnL4
              ? `${colorMode}.pantoneGreen`
              : isDarkMode
              ? Colors.primaryCream
              : `${colorMode}.pantoneGreen`
          }
        />
        <Buttons
          primaryText="Proceed"
          primaryDisable={!selectedWalletType}
          primaryCallback={() => {
            if (scheme.m === 1 && emergencyKeySelected) {
              showToast(
                scheme.n === 1
                  ? 'Single-key wallet cannot use Emergency Key, only Inheritance Key.'
                  : 'Multi-key wallets with a threshold of 1 cannot use Emergency Key, only Inheritance Key.',
                <ToastErrorIcon />
              );
              return;
            }
            navigation.dispatch(
              CommonActions.navigate({
                name: 'AddSigningDevice',
                params: {
                  scheme,
                  isTimeLock: false,
                  currentBlockHeight,
                  isAddInheritanceKey: inheritanceKeySelected,
                  isAddEmergencyKey: emergencyKeySelected,
                  isNewSchemeFlow: true,
                  vaultId,
                },
              })
            );
          }}
          fullWidth
        />
      </Box>
      <KeeperModal
        visible={customConfigModalVisible}
        close={() => setCustomConfigModalVisible(false)}
        title="Create a custom wallet"
        subTitle="Select the total number of keys"
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        buttonText={common.confirm}
        buttonCallback={() => {
          setCustomConfigModalVisible(false);
          setSelectedWalletType('custom');
        }}
        Content={() => {
          return (
            <Box>
              <Text
                style={{ marginBottom: hp(10) }}
                fontSize={14}
                medium
                color={`${colorMode}.primaryText`}
                testID="text_totalKeys"
              >
                Total Keys For Wallet Configuration
              </Text>
              <Text
                style={{ fontSize: 12 }}
                color={`${colorMode}.secondaryText`}
                testID="text_totalKeys_subTitle"
              >
                {vaultTranslations.selectTheTotalNumberOfKeys}
              </Text>
              <NumberInput value={scheme.n} onDecrease={onDecreaseN} onIncrease={onIncreaseN} />
              <Text
                style={{ marginBottom: hp(10) }}
                fontSize={14}
                medium
                color={`${colorMode}.primaryText`}
                testID="text_requireKeys"
              >
                {vaultTranslations.requiredKeys}
              </Text>
              <Text
                style={{ fontSize: 12 }}
                color={`${colorMode}.secondaryText`}
                testID="text_requireKeys_subTitle"
              >
                {vaultTranslations.minimumNumberOfKeysToSignATransaction}
              </Text>
              <NumberInput value={scheme.m} onDecrease={onDecreaseM} onIncrease={onIncreaseM} />
            </Box>
          );
        }}
      />
      <EnhancedSecurityModal
        isVisible={showEnhancedOptionsModal}
        onClose={() => setShowEnhancedOptionsModal(false)}
        inheritanceKeySelected={inheritanceKeySelected}
        setInheritanceKeySelected={setInheritanceKeySelected}
        emergencyKeySelected={emergencyKeySelected}
        setEmergencyKeySelected={setEmergencyKeySelected}
        navigation={navigation}
      />
    </ScreenWrapper>
  );
}

const OptionItem = ({ option, colorMode, active }) => {
  const borderColor = active ? `${colorMode}.dashedButtonBorderColor` : `${colorMode}.separator`;
  return (
    <Pressable onPress={option.onPress}>
      <Box
        style={styles.optionCTR}
        backgroundColor={`${colorMode}.boxSecondaryBackground`}
        borderColor={borderColor}
      >
        <Box style={styles.optionIconCtr} backgroundColor={`${colorMode}.pantoneGreen`}>
          {option.icon}
        </Box>
        <Box>
          <Text color={`${colorMode}.secondaryText`} fontSize={16} medium>
            {option.title}
          </Text>
        </Box>
      </Box>
    </Pressable>
  );
};

const EnhancedSecurityModal = ({
  isVisible,
  onClose,
  inheritanceKeySelected,
  setInheritanceKeySelected,
  emergencyKeySelected,
  setEmergencyKeySelected,
  navigation,
}) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const [pendingInheritanceKeySelected, setPendingInheritanceKeySelected] =
    useState(inheritanceKeySelected);
  const [pendingEmergencyKeySelected, setPendingEmergencyKeySelected] =
    useState(emergencyKeySelected);

  // Reset pending state when modal opens
  useEffect(() => {
    if (isVisible) {
      setPendingInheritanceKeySelected(inheritanceKeySelected);
      setPendingEmergencyKeySelected(emergencyKeySelected);
    }
  }, [isVisible, inheritanceKeySelected, emergencyKeySelected]);

  const { plan } = usePlan();
  const isDiamondHand =
    plan === SubscriptionTier.L3.toUpperCase() || plan === SubscriptionTier.L4.toUpperCase();

  return (
    <KeeperModal
      visible={isVisible}
      close={() => {
        onClose();
      }}
      textColor={`${colorMode}.textGreen`}
      subTitleColor={`${colorMode}.modalSubtitleBlack`}
      title="Enhanced Security Options"
      subTitle="You'll be prompted to configure your enhanced options after you select your normal wallet keys"
      buttonText="Save Changes"
      buttonCallback={() => {
        onClose();
        setInheritanceKeySelected(pendingInheritanceKeySelected);
        setEmergencyKeySelected(pendingEmergencyKeySelected);
      }}
      Content={() => {
        return (
          <Box style={styles.enhancedOptionsContainer}>
            {!isDiamondHand && (
              <Box>
                <UpgradeSubscription
                  type={SubscriptionTier.L3}
                  customStyles={styles.upgradeButtonCustomStyles}
                  navigation={navigation}
                  onPress={() => {
                    onClose();
                  }}
                />
              </Box>
            )}
            <Pressable
              disabled={!isDiamondHand}
              onPress={() => setPendingInheritanceKeySelected(!pendingInheritanceKeySelected)}
            >
              <Box
                style={styles.optionBox}
                backgroundColor={`${colorMode}.boxSecondaryBackground`}
                borderColor={`${colorMode}.border`}
              >
                <Box style={styles.optionHeader}>
                  <Text
                    fontSize={16}
                    color={
                      !isDiamondHand ? `${colorMode}.secondaryGrey` : `${colorMode}.greenWhiteText`
                    }
                  >
                    Inheritance Key
                  </Text>
                  {pendingInheritanceKeySelected ? (
                    <Box
                      style={styles.checkmark}
                      backgroundColor={`${colorMode}.dashedButtonBorderColor`}
                    >
                      {isDarkMode ? (
                        <CheckDarkIcon height={12} width={12} />
                      ) : (
                        <CheckIcon height={12} width={12} />
                      )}
                    </Box>
                  ) : (
                    <Box
                      style={[styles.checkmark, { opacity: 0.2 }]}
                      backgroundColor={`${colorMode}.secondaryGrey`}
                    ></Box>
                  )}
                </Box>
                <Text
                  fontSize={12}
                  color={
                    !isDiamondHand ? `${colorMode}.secondaryGrey` : `${colorMode}.secondaryText`
                  }
                >
                  An extra key which will be added to your wallet quorum after a certain time
                </Text>
              </Box>
            </Pressable>

            <Pressable
              disabled={!isDiamondHand}
              onPress={() => setPendingEmergencyKeySelected(!pendingEmergencyKeySelected)}
            >
              <Box
                style={styles.optionBox}
                backgroundColor={`${colorMode}.boxSecondaryBackground`}
                borderColor={`${colorMode}.border`}
              >
                <Box style={styles.optionHeader}>
                  <Text
                    fontSize={16}
                    color={
                      !isDiamondHand ? `${colorMode}.secondaryGrey` : `${colorMode}.greenWhiteText`
                    }
                  >
                    Emergency Key
                  </Text>
                  {pendingEmergencyKeySelected ? (
                    <Box
                      style={styles.checkmark}
                      backgroundColor={`${colorMode}.dashedButtonBorderColor`}
                    >
                      {isDarkMode ? (
                        <CheckDarkIcon height={12} width={12} />
                      ) : (
                        <CheckIcon height={12} width={12} />
                      )}
                    </Box>
                  ) : (
                    <Box
                      style={[styles.checkmark, { opacity: 0.2 }]}
                      backgroundColor={`${colorMode}.secondaryGrey`}
                    ></Box>
                  )}
                </Box>
                <Text
                  fontSize={12}
                  color={
                    !isDiamondHand ? `${colorMode}.secondaryGrey` : `${colorMode}.secondaryText`
                  }
                >
                  A key with delayed full control to recover from extended key loss
                </Text>
              </Box>
            </Pressable>
          </Box>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  addWalletOptionsList: {
    gap: wp(15),
    marginTop: hp(30),
    flex: 1,
  },
  optionIconCtr: {
    height: hp(35),
    width: wp(35),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  optionCTR: {
    flexDirection: 'row',
    paddingHorizontal: wp(15),
    paddingVertical: hp(22),
    alignItems: 'center',
    gap: wp(16),
    borderRadius: 12,
    borderWidth: 1.2,
  },
  footer: {
    marginHorizontal: '3%',
    gap: hp(20),
    marginVertical: hp(10),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(15),
    paddingVertical: hp(17),
    marginTop: hp(10),
  },
  enhancedOptionsContainer: {
    gap: hp(15),
  },
  optionBox: {
    padding: wp(15),
    borderRadius: 10,
    gap: hp(8),
    borderWidth: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkmark: {
    width: wp(12),
    height: hp(12),
    borderRadius: wp(100),
    padding: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  enhancedVaultsCustomStyles: {
    padding: 15,
    gap: 10,
    width: windowWidth * 0.88,
  },
  upgradeButtonCustomStyles: {
    container: {
      borderTopWidth: 0,
      justifyContent: 'space-between',
    },
    learnMoreContainer: {
      paddingVertical: hp(3),
      paddingHorizontal: wp(14),
      fontSize: 13,
    },
    unlockAtText: {
      fontSize: 15,
      verticalAlign: 'bottom',
    },
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 37,
    lineHeight: hp(36),
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  buttonValue: {
    fontSize: 17,
    lineHeight: hp(20),
    margin: 10,
    flex: 1,
    textAlign: 'center',
  },
  inputContainer: {
    height: hp(50),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: hp(20),
    borderWidth: 1,
  },
});

export default AddNewWallet;
