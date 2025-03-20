import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import TimerOutlineLight from 'src/assets/images/timer-outline.svg';
import { useContext } from 'react';
import { LocalizationContext } from 'src/context/Localization/LocContext';

interface IKSInfocardProps {
  name: string;
  description?: string;
  Icon: Element;
  duration?: string;
}

const IKSInfocard: React.FC<IKSInfocardProps> = ({ name, description, Icon, duration }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText } = translations;

  return (
    <Box
      style={styles.infoCard}
      backgroundColor={`${colorMode}.boxSecondaryBackground`}
      borderColor={`${colorMode}.dullGreyBorder`}
    >
      <Box style={styles.iconWrapper}>
        <HexagonIcon
          width={44}
          height={38}
          backgroundColor={isDarkMode ? Colors.DullGreenDark : Colors.primaryGreen}
          icon={Icon}
        />
      </Box>
      <Box style={styles.infoWrapper}>
        <Text color={`${colorMode}.greenText`} medium style={styles.titleText}>
          {name}
        </Text>
        {description ? (
          <Text fontSize={12} color={`${colorMode}.secondaryText`}>
            {description}
          </Text>
        ) : null}
        {duration ? (
          <Box style={styles.durationContainer}>
            {duration !== vaultText.IKAlreadyActive && <TimerOutlineLight />}
            <Text fontSize={12} color={`${colorMode}.secondaryText`}>
              {duration}
            </Text>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default IKSInfocard;

const styles = StyleSheet.create({
  infoCard: {
    flexDirection: 'row',
    paddingHorizontal: wp(17),
    paddingTop: hp(20),
    paddingBottom: hp(10),
    minHeight: hp(80),
    borderRadius: 10,
    borderWidth: 1,
  },
  infoWrapper: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 20,
  },
  iconWrapper: {
    marginRight: 10,
  },
  titleText: {
    fontSize: 14,
  },
  durationContainer: {
    marginTop: hp(10),
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: wp(5),
  },
});
