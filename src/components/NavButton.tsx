import { Box, Pressable, useColorMode } from 'native-base';
import Text from './KeeperText';
import LinkIcon from 'src/assets/images/link.svg';
import openLink from 'src/utils/OpenLink';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';

type NavButtonProps = {
  icon: Element;
  heading: string;
  link: string;
};

function NavButton({ icon, heading, link }: NavButtonProps) {
  const { colorMode } = useColorMode();

  return (
    <Pressable onPress={() => openLink(link)}>
      <Box style={styles.NavButtonContainer} backgroundColor={Colors.Ivory}>
        <Box style={styles.headingWrapper}>
          {icon}
          <Box style={{ marginLeft: wp(10) }}>
            <Text color={`${colorMode}.textColor2`} style={styles.heading}>
              {heading}
            </Text>
          </Box>
        </Box>
        <Box style={styles.link}>
          <LinkIcon />
        </Box>
      </Box>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  NavButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    height: hp(45),
    width: wp(166),
    borderRadius: 8,
    marginBottom: hp(8),
    alignItems: 'center',
  },
  headingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp(3),
  },
  heading: {
    fontWeight: '400',
    fontSize: 13,
    letterSpacing: 0.79,
  },
  link: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NavButton;
