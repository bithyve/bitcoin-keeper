import { StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { hp, windowWidth, wp } from 'src/constants/responsive';

type FooterItem = {
  Icon: any;
  text: string;
  onPress: () => void;
  disabled?: boolean;
  hideItem?: boolean;
};
export function KeeperFooter({
  items,
  wrappedScreen = true,
  marginX = 10,
}: {
  items: FooterItem[];
  marginX?: number;
  wrappedScreen?: boolean;
}) {
  const { colorMode } = useColorMode();
  const footerItemsToRender = items.filter((item) => !item.hideItem);
  const itemWidth = (windowWidth * 0.9) / footerItemsToRender.length - marginX * 2; // Ensure each item fits within the screen width

  return (
    <Box bottom={wrappedScreen ? -10 : undefined}>
      <Box style={styles.border} borderColor={`${colorMode}.separator`} />
      <Box
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        marginX={marginX}
        marginTop={3}
        flexWrap="nowrap"
      >
        {footerItemsToRender.map((item) => {
          return (
            <TouchableOpacity
              testID={`btn_${item.text}`}
              key={item.text}
              style={[styles.IconWrapper, { width: itemWidth }]}
              onPress={item.onPress}
              disabled={item.disabled}
            >
              <Box style={styles.icon}>
                <item.Icon size={24} />
              </Box>
              <Text
                color={`${colorMode}.primaryText`}
                style={[
                  styles.footerText,
                  { maxWidth: (windowWidth * 0.9) / footerItemsToRender.length },
                ]}
                numberOfLines={2}
                semiBold
              >
                {item.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Box>
    </Box>
  );
}

export default KeeperFooter;

const styles = StyleSheet.create({
  footerText: {
    fontSize: 14,
    letterSpacing: 0.36,
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  IconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  border: {
    borderTopWidth: 1,
    paddingTop: hp(15),
  },
  circle: {
    width: 38,
    height: 38,
    borderRadius: 38 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: wp(24),
    height: hp(24),
  },
});
