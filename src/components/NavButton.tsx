import React from 'react';
import { Box, useColorMode } from 'native-base';
import LinkIcon from 'src/assets/images/link.svg';
import openLink from 'src/utils/OpenLink';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import Text from './KeeperText';

type NavButtonProps = {
  icon: Element;
  heading: string;
  link: string;
};

function NavButton({ icon, heading, link }: NavButtonProps) {
  const { colorMode } = useColorMode();

  return (
    <TouchableOpacity onPress={() => openLink(link)}>
      <Box style={styles.NavButtonContainer} backgroundColor={`${colorMode}.seashellWhite`}>
        <Box style={styles.headingWrapper}>
          {icon}
          <Box>
            <Text color={`${colorMode}.textColor2`} style={styles.heading}>
              {heading}
            </Text>
          </Box>
        </Box>
        <Box style={styles.link}>
          <LinkIcon />
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  NavButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: hp(45),
    width: wp(166),
    borderRadius: 8,
    marginBottom: hp(8),
    alignItems: 'center',
  },
  headingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
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
