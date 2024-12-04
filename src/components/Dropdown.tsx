import { Box, useColorMode, Pressable } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from './KeeperText';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import TickIcon from 'src/assets/images/icon_check.svg';
import { hp } from 'src/constants/responsive';
import { useState, useEffect } from 'react';

type Props = {
  label: string;
  options: string[];
  selectedOption: string | null;
  onOptionSelect: (option: string) => void;
};

function Dropdown({ label, options, selectedOption, onOptionSelect }: Props) {
  const { colorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelectedOption, setInternalSelectedOption] = useState<string | null>(
    selectedOption
  );

  const handlePress = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option: string) => {
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
            {internalSelectedOption || label}
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
            <TouchableOpacity key={option} onPress={() => handleOptionSelect(option)}>
              <Box
                style={styles.optionContainer}
                borderBottomWidth={index === options.length - 1 ? 0 : 1}
              >
                <Text
                  color={
                    internalSelectedOption === option
                      ? `${colorMode}.greenText`
                      : `${colorMode}.DarkGreyText`
                  }
                  style={styles.optionText}
                >
                  {option}
                </Text>
                {internalSelectedOption === option && <TickIcon />}
              </Box>
            </TouchableOpacity>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default Dropdown;

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
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});
