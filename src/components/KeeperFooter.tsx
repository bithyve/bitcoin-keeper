import { StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { hp, windowWidth } from 'src/constants/responsive';

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
  const itemWidth = (windowWidth * 0.9) / footerItemsToRender.length - marginX * 2;

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
              <Box style={[styles.iconContainer]}>
                <item.Icon size={24} />
              </Box>
              <Text
                color={`${colorMode}.primaryText`}
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
            </TouchableOpacity>
          );
        })}
      </Box>
    </Box>
  );
}

export default KeeperFooter;

const styles = StyleSheet.create({
  container: {
    marginBottom: hp(10),
  },
  footerText: {
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  IconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    minWidth: 60,
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
});
