import { StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';

type FooterItem = {
  Icon: any;
  text: string;
  onPress: () => void;
  disabled?: boolean;
  hideItem?: boolean;
};

export function FooterActions({
  items,
  wrappedScreen = true,
  marginX = 10,
  fontSize = 14,
  backgroundColor = 'transparent',
}: {
  items: FooterItem[];
  marginX?: number;
  wrappedScreen?: boolean;
  fontSize?: number;
  backgroundColor?: string;
}) {
  const { colorMode } = useColorMode();
  const footerItemsToRender = items.filter((item) => !item.hideItem);

  return (
    <Box
      bottom={wrappedScreen ? -10 : undefined}
      style={styles.container}
      backgroundColor={backgroundColor}
    >
      <Box style={styles.border} borderColor={`${colorMode}.dullGreyBorder`} />
      <Box
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        marginX={marginX}
        marginTop={3}
        flexWrap="nowrap"
        backgroundColor={`${colorMode}.pantoneGreen`}
        style={styles.iconWrapper}
      >
        {footerItemsToRender.map((item) => {
          return (
            <TouchableOpacity
              testID={`btn_${item.text}`}
              key={item.text}
              onPress={item.onPress}
              disabled={item.disabled}
            >
              <Box style={styles.iconText}>
                <Box style={[styles.iconContainer]}>
                  <item.Icon size={24} />
                </Box>
                <Text
                  color={Colors.headerWhite}
                  style={[
                    styles.footerText,
                    { maxWidth: (windowWidth * 0.9) / footerItemsToRender.length },
                  ]}
                  fontSize={fontSize}
                  numberOfLines={2}
                  semiBold
                >
                  {item.text}
                </Text>
              </Box>
            </TouchableOpacity>
          );
        })}
      </Box>
    </Box>
  );
}

export default FooterActions;

const styles = StyleSheet.create({
  container: {
    paddingBottom: hp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  iconWrapper: {
    width: wp(287),
    minHeight: hp(58),
    borderRadius: 70,
    gap: 30,
  },

  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 24,
    minWidth: 24,
    maxWidth: '100%',
  },
  border: {
    borderTopWidth: 1,
    paddingTop: hp(15),
  },
  iconText: {
    flexDirection: 'row',
    gap: 5,
  },
});
