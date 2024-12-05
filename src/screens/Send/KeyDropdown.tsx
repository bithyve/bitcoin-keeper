import { Box, Pressable, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { hp } from 'src/constants/responsive';
import { useEffect, useState } from 'react';
import Colors from 'src/theme/Colors';
import Text from 'src/components/KeeperText';
import TickIcon from 'src/assets/images/icon_check.svg';
import { Signer, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { getKeyUID } from 'src/utils/utilities';

type Props = {
  label: string;
  options: VaultSigner[];
  selectedOption: VaultSigner | null;
  onOptionSelect: (option: VaultSigner) => void;
};

function KeyDropdown({ label, options, selectedOption, onOptionSelect }: Props) {
  const { colorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelectedOption, setInternalSelectedOption] = useState<VaultSigner | null>(
    selectedOption
  );

  const handlePress = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option: VaultSigner) => {
    setInternalSelectedOption(option);
    onOptionSelect(option);
    setIsOpen(false);
  };

  useEffect(() => {
    if (selectedOption) {
      setInternalSelectedOption(selectedOption);
    }
  }, [selectedOption]);

  return (
    <Box>
      <Pressable onPress={handlePress}>
        <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.dropdownContainer}>
          <Text
            medium
            color={isOpen ? `${colorMode}.greenTextDisabled` : `${colorMode}.greenText`}
            style={styles.labelText}
          >
            {selectedOption
              ? `${selectedOption.signerName} - ${selectedOption.masterFingerprint}`
              : label}
          </Text>

          <Box style={styles.arrowContainer}>
            <Box backgroundColor={`${colorMode}.dropdownSeparator`} style={styles.emptyView} />
            <Box
              style={[
                styles.icArrow,
                {
                  transform: [{ rotate: isOpen ? '-90deg' : '90deg' }],
                },
              ]}
            >
              <RightArrowIcon />
            </Box>
          </Box>
        </Box>
      </Pressable>
      {isOpen && (
        <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.optionsContainer}>
          {options.map((option, index) => (
            <TouchableOpacity key={getKeyUID(option)} onPress={() => handleOptionSelect(option)}>
              <Box
                style={styles.optionContainer}
                borderBottomWidth={index === options.length - 1 ? 0 : 1}
              >
                <Text
                  color={
                    getKeyUID(internalSelectedOption) === getKeyUID(option)
                      ? `${colorMode}.greenText`
                      : `${colorMode}.DarkGreyText`
                  }
                  style={styles.optionText}
                >
                  {`${`${option?.signerName} - ${option.masterFingerprint}`}`}
                </Text>
                {getKeyUID(internalSelectedOption) === getKeyUID(option) && <TickIcon />}
              </Box>
            </TouchableOpacity>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default KeyDropdown;

const styles = StyleSheet.create({
  dropdownContainer: {
    borderRadius: 10,
    height: hp(50),
    marginHorizontal: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowContainer: {
    flexDirection: 'row',
    height: '100%',
    gap: 20,
  },
  labelText: {
    fontSize: 14,
    lineHeight: 24,
    letterSpacing: 0.39,
  },
  optionText: {
    fontSize: 13,
    letterSpacing: 0.39,
    paddingBottom: 10,
    paddingTop: 5,
  },
  emptyView: {
    height: hp(23),
    alignSelf: 'center',
    width: 2,
    opacity: 0.23,
  },
  icArrow: {
    alignSelf: 'center',
  },
  optionsContainer: {
    width: '95%',
    alignSelf: 'center',
    zIndex: 999,
    marginTop: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: Colors.SilverMist,
  },
});
