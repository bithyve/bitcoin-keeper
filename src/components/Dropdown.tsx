import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from './KeeperText';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { hp } from 'src/constants/responsive';
import { useState } from 'react';

type Props = {
  label: string;
  options: string[];
  onOptionSelect: any;
};

function Dropdown({ label, options, onOptionSelect }: Props) {
  const { colorMode } = useColorMode();

  const [isOpen, setIsOpen] = useState(false);

  const handlePress = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Box>
      <TouchableOpacity onPress={handlePress}>
        <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.dropdownContainer}>
          <Text color={`${colorMode}.primaryText`} style={styles.labelText}>
            {label}
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
      </TouchableOpacity>
      <Box style={{ position: 'relative' }}>
        {isOpen && (
          <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.optionsContainer}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  onOptionSelect(option);
                  setIsOpen(false);
                }}
              >
                <Text style={styles.labelText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </Box>
        )}
      </Box>
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
    fontSize: 13,
    letterSpacing: 0.39,
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
    position: 'absolute',
    alignSelf: 'center',
    top: 10,
    zIndex: 999,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
});
