import React from 'react';
import { Box, useColorMode } from 'native-base';
import LinkIcon from 'src/assets/images/link_black.svg';
import LinkDarkIcon from 'src/assets/images/link-white.svg';
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
    <TouchableOpacity testID={`btn_${heading}`} onPress={() => openLink(link)}>
      <Box style={styles.NavButtonContainer} backgroundColor={`${colorMode}.seashellWhite`}>
        <Box style={styles.headingWrapper}>
          {icon}
          <Box>
            <Text color={`${colorMode}.termsText`} style={styles.heading}>
              {heading}
            </Text>
          </Box>
        </Box>
        <Box style={styles.link}>{colorMode === 'dark' ? <LinkDarkIcon /> : <LinkIcon />}</Box>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  NavButtonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    height: hp(45),
    borderRadius: 10,
    marginBottom: hp(8),
    alignItems: 'center',
    gap: 8,
  },
  headingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heading: {
    fontSize: 13,
    letterSpacing: 0.13,
    lineHeight: 16,
  },
  link: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NavButton;
