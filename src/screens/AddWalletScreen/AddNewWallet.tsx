import { Box, useColorMode } from 'native-base';
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
import { hp, wp } from 'src/constants/responsive';

import NewWalletIcon from 'src/assets/images/wallet-white-small.svg';
import Buttons from 'src/components/Buttons';
import { NumberInput } from '../Vault/VaultSetup';
import DashedCta from 'src/components/DashedCta';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import SettingIcon from 'src/assets/images/new_icon_settings.svg';
import CheckIcon from 'src/assets/images/planCheckMarkSelected.svg';
import usePlan from 'src/hooks/usePlan';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import UpgradeSubscription from '../InheritanceToolsAndTips/components/UpgradeSubscription';
import { MiniscriptTypes, SignerType } from 'src/services/wallets/enums';
import WalletUtilities from 'src/services/wallets/operations/utils';
import useVault from 'src/hooks/useVault';

function AddNewWallet({ navigation, route }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultTranslations, common } = translations;
  const [selectedWalletType, setSelectedWalletType] = useState('');
  const [customConfigModalVisible, setCustomConfigModalVisible] = useState(false);
  const [showEnhancedOptionsModal, setShowEnhancedOptionsModal] = useState(false);
  const { vaultId } = route.params || {};
  const { activeVault } = useVault({ vaultId });
  const [scheme, setScheme] = useState(
    activeVault ? { m: activeVault.scheme.m, n: activeVault.scheme.n } : { m: 2, n: 3 }
  );
  const [inheritanceKeySelected, setInheritanceKeySelected] = useState(
    activeVault?.scheme?.miniscriptScheme?.usedMiniscriptTypes?.includes(
      MiniscriptTypes.INHERITANCE
    ) || false
  );
  const isDarkMode = colorMode === 'dark';
  const [currentBlockHeight, setCurrentBlockHeight] = useState(null);

  useEffect(() => {
    // TODO: Add more as new options are added
    const isMiniscriptEnabled = inheritanceKeySelected;
    if (isMiniscriptEnabled && !currentBlockHeight) {
      WalletUtilities.fetchCurrentBlockHeight()
        .then(({ currentBlockHeight }) => {
          setCurrentBlockHeight(currentBlockHeight);
        })
        .catch((err) => console.log('Failed to fetch the current chain data:', err));
    }
  }, [inheritanceKeySelected]);

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
    if (scheme.n > 2 && scheme.n > scheme.m) {
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
            backgroundColor={`${colorMode}.separator`}
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
          backgroundColor={isDarkMode ? 'rgba(21, 27, 25, 1)' : `${colorMode}.DashedButtonCta`}
          hexagonBackgroundColor={
            isDarkMode ? 'rgba(21, 27, 25, 1)' : `${colorMode}.DashedButtonCta`
          }
          textColor={isDarkMode ? Colors.White : `${colorMode}.pantoneGreen`}
          name="Enhanced Security Options"
          description="Secure your funds and future—your way"
          callback={() => setShowEnhancedOptionsModal(true)}
          icon={<SettingIcon />}
          iconWidth={22}
          iconHeight={20}
          cardStyles={styles.enhancedVaultsCustomStyles}
          titleSize={15}
        />
        <Buttons
          primaryText="Proceed"
          primaryDisable={!selectedWalletType}
          primaryCallback={() => {
            navigation.dispatch(
              CommonActions.navigate({
                name: 'AddSigningDevice',
                params: {
                  scheme,
                  isTimeLock: false,
                  currentBlockHeight,
                  isAddInheritanceKey: inheritanceKeySelected,
                  vaultId,
                  // TODO: Instead of filter out use the disable with reason modal
                  ...(inheritanceKeySelected && {
                    signerFilters: [
                      SignerType.MY_KEEPER,
                      SignerType.TAPSIGNER,
                      SignerType.BITBOX02,
                      SignerType.COLDCARD,
                      SignerType.JADE,
                      SignerType.LEDGER,
                      SignerType.SPECTER,
                      SignerType.SEED_WORDS,
                    ],
                  }),
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
        subTitle=""
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
              <Text
                style={{ marginBottom: hp(10) }}
                fontSize={14}
                medium
                color={`${colorMode}.primaryText`}
                testID="text_totalKeys"
              >
                Total Keys in Wallet
              </Text>
              <Text
                style={{ fontSize: 12 }}
                color={`${colorMode}.secondaryText`}
                testID="text_totalKeys_subTitle"
              >
                {vaultTranslations.selectTheTotalNumberOfKeys}
              </Text>
              <NumberInput value={scheme.n} onDecrease={onDecreaseN} onIncrease={onIncreaseN} />
            </Box>
          );
        }}
      />
      <EnhancedSecurityModal
        isVisible={showEnhancedOptionsModal}
        onClose={() => setShowEnhancedOptionsModal(false)}
        inheritanceKeySelected={inheritanceKeySelected}
        setInheritanceKeySelected={setInheritanceKeySelected}
        navigation={navigation}
      />
    </ScreenWrapper>
  );
}

const OptionItem = ({ option, colorMode, active }) => {
  const borderColor = active ? `${colorMode}.pantoneGreen` : `${colorMode}.separator`;
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
  navigation,
}) => {
  const { colorMode } = useColorMode();
  const [pendingInheritanceKeySelected, setPendingInheritanceKeySelected] =
    useState(inheritanceKeySelected);

  // Reset pending state when modal opens
  useEffect(() => {
    if (isVisible) {
      setPendingInheritanceKeySelected(inheritanceKeySelected);
    }
  }, [isVisible, inheritanceKeySelected]);

  const { plan } = usePlan();
  const isDiamondHand = plan === SubscriptionTier.L3.toUpperCase();

  return (
    <KeeperModal
      visible={isVisible}
      close={() => {
        onClose();
      }}
      title="Enhanced Security Options"
      subTitle="You'll be prompted to configure your enhanced options after you select your normal wallet keys"
      buttonText="Save Changes"
      buttonCallback={() => {
        onClose();
        setInheritanceKeySelected(pendingInheritanceKeySelected);
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
                      !isDiamondHand ? `${colorMode}.secondaryGrey` : `${colorMode}.whiteButtonText`
                    }
                  >
                    Inheritance Key
                  </Text>
                  {pendingInheritanceKeySelected ? (
                    <Box style={styles.checkmark} backgroundColor={`${colorMode}.pantoneGreen`}>
                      <CheckIcon height={12} width={12} />
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

            <Pressable disabled={!isDiamondHand}>
              <Box
                style={styles.optionBox}
                backgroundColor={`${colorMode}.boxSecondaryBackground`}
                borderColor={`${colorMode}.border`}
              >
                <Box style={styles.optionHeader}>
                  <Text
                    fontSize={16}
                    color={
                      !isDiamondHand ? `${colorMode}.secondaryGrey` : `${colorMode}.whiteButtonText`
                    }
                  >
                    Emergency Key
                  </Text>
                  <Box
                    style={styles.comingSoon}
                    backgroundColor={
                      !isDiamondHand ? `${colorMode}.secondaryGrey` : `${colorMode}.brownBackground`
                    }
                  >
                    <Text fontSize={10} color={`${colorMode}.white`} medium>
                      Coming Soon
                    </Text>
                  </Box>
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
  comingSoon: {
    paddingHorizontal: wp(8),
    paddingVertical: hp(4),
    borderRadius: 20,
  },
  modalFooter: {
    padding: wp(15),
    paddingTop: 0,
  },
  enhancedVaultsCustomStyles: {
    padding: 15,
    gap: 15,
    width: wp(320),
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
});

export default AddNewWallet;
