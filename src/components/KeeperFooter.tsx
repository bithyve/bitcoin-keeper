import { StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { windowWidth } from 'src/constants/responsive';

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
  const itemWidth = windowWidth / footerItemsToRender.length - marginX * 2; // Ensure each item fits within the screen width

  return (
    <Box bottom={wrappedScreen ? -10 : undefined}>
      <Box style={styles.border} borderColor={`${colorMode}.GreyText`} />
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
              <Box backgroundColor={`${colorMode}.BrownNeedHelp`} style={styles.circle}>
                <item.Icon />
              </Box>
              <Text
                color={`${colorMode}.primaryText`}
                style={[styles.footerText, { maxWidth: windowWidth / footerItemsToRender.length }]}
                numberOfLines={2}
                medium
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
    fontSize: 12,
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
    borderWidth: 0.5,
    opacity: 0.2,
    marginBottom: 10,
  },
  circle: {
    width: 38,
    height: 38,
    borderRadius: 38 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
