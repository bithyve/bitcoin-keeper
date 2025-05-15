import { Box, Pressable, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { hp, wp } from 'src/constants/responsive';
import { useEffect, useState } from 'react';
import Text from 'src/components/KeeperText';
import TickIcon from 'src/assets/images/icon_check.svg';
import KeeperModal from './KeeperModal';
import PrivateTickIcon from 'src/assets/privateImages/tick-icon.svg';
import { useSelector } from 'react-redux';
import ThemedColor from './ThemedColor/ThemedColor';

type Option = {
  label: string;
  value: number | String;
};

type Props = {
  label: string;
  options: Option[];
  selectedOption: Option | null;
  onOptionSelect: (option: Option) => void;
};

function SelectableDropdown({ label, options, selectedOption, onOptionSelect }: Props) {
  const { colorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelectedOption, setInternalSelectedOption] = useState<Option | null>(
    selectedOption
  );
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateTheme = themeMode === 'PRIVATE';
  const optionTextColor = ThemedColor({ name: 'optionTextColor' });

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

  const optionsContent = (
    <Box
      style={styles.optionsContainer}
      backgroundColor={privateTheme && `${colorMode}.charcolBrown`}
    >
      {options.map((option, index) => (
        <Pressable key={option.value} onPress={() => handleOptionSelect(option)}>
          <Box
            style={styles.optionContainer}
            backgroundColor={privateTheme && `${colorMode}.charcolBrown`}
          >
            <Text
              color={
                internalSelectedOption?.value === option?.value
                  ? optionTextColor
                  : `${colorMode}.DarkGreyText`
              }
              style={styles.optionText}
              medium
            >
              {option.label}
            </Text>
            {internalSelectedOption?.value === option?.value &&
              (privateTheme ? <PrivateTickIcon /> : <TickIcon />)}
          </Box>
          {index !== options.length - 1 && (
            <Box style={styles.separator} backgroundColor={`${colorMode}.dullGreyBorder`} />
          )}
        </Pressable>
      ))}
    </Box>
  );

  return (
    <Box>
      <Pressable onPress={handlePress}>
        <Box
          backgroundColor={`${colorMode}.seashellWhite`}
          borderColor={`${colorMode}.dullGreyBorder`}
          style={styles.dropdownContainer}
        >
          <Text
            medium
            color={isOpen ? `${colorMode}.SlateGreen` : `${colorMode}.greenText`}
            style={styles.labelText}
          >
            {selectedOption ? `${selectedOption.label}` : label}
          </Text>

          <Box style={styles.arrowContainer}>
            <Box backgroundColor={`${colorMode}.dullGreyBorder`} style={styles.emptyView} />
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

      <KeeperModal
        visible={isOpen}
        close={() => setIsOpen(false)}
        showCloseIcon={false}
        Content={() => optionsContent}
        modalBackground={privateTheme && `${colorMode}.charcolBrown`}
      />
    </Box>
  );
}

export default SelectableDropdown;

const styles = StyleSheet.create({
  dropdownContainer: {
    borderRadius: 10,
    height: hp(50),
    paddingHorizontal: wp(20),
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
    fontSize: 14,
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
    paddingVertical: hp(10),
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: hp(10),
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: hp(10),
    paddingBottom: hp(15),
  },
  separator: {
    height: 1,
  },
});
