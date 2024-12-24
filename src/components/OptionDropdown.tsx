import { Box, Pressable, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { hp, wp } from 'src/constants/responsive';
import { useEffect, useState } from 'react';
import Text from 'src/components/KeeperText';
import TickIcon from 'src/assets/images/icon_check.svg';

type Option = {
  label: string;
  value: string | number;
};

type Props = {
  label: string;
  options: Option[];
  selectedOption: Option | null;
  onOptionSelect: (option: Option) => void;
};

function OptionDropdown({ label, options, selectedOption, onOptionSelect }: Props) {
  const { colorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelectedOption, setInternalSelectedOption] = useState<Option | null>(
    selectedOption
  );

  const handlePress = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option: Option) => {
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
        <Box
          backgroundColor={`${colorMode}.boxSecondaryBackground`}
          borderColor={`${colorMode}.dullGreyBorder`}
          style={styles.dropdownContainer}
        >
          <Text
            medium
            color={
              selectedOption && !isOpen
                ? `${colorMode}.primaryText`
                : `${colorMode}.placeHolderTextColor`
            }
            style={styles.labelText}
          >
            {selectedOption ? `${selectedOption.label}` : label}
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
        <Box
          backgroundColor={`${colorMode}.boxSecondaryBackground`}
          style={styles.optionsContainer}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.value.toString()}
              onPress={() => handleOptionSelect(option)}
            >
              <Box style={styles.optionContainer}>
                <Text
                  color={
                    internalSelectedOption?.value === option.value
                      ? `${colorMode}.greenText`
                      : `${colorMode}.GreyText`
                  }
                  style={styles.optionText}
                >
                  {`${option.label}`}
                </Text>
                {internalSelectedOption?.value === option.value && <TickIcon />}
              </Box>
              {index !== options.length - 1 && (
                <Box backgroundColor={`${colorMode}.dullGreyBorder`} style={styles.separator} />
              )}
            </TouchableOpacity>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default OptionDropdown;

const styles = StyleSheet.create({
  dropdownContainer: {
    borderRadius: 10,
    height: hp(50),
    paddingRight: wp(20),
    paddingLeft: wp(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  arrowContainer: {
    flexDirection: 'row',
    height: '100%',
    gap: wp(20),
  },
  labelText: {
    fontSize: 12,
  },
  optionText: {
    fontSize: 13,
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
    paddingTop: hp(10),
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: hp(10),
    zIndex: 999,
    marginTop: hp(5),
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: hp(10),
    paddingBottom: hp(15),
    paddingHorizontal: wp(20),
  },
  separator: {
    height: 1,
    alignSelf: 'center',
    width: '90%',
  },
});
