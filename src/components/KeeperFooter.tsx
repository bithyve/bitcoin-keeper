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
export const KeeperFooter = ({
  items,
  wrappedScreen = true,
}: {
  items: FooterItem[];
  wrappedScreen?: boolean;
}) => {
  const { colorMode } = useColorMode();
  const footerItemsToRender = items.filter((item) => !item.hideItem);
  return (
    <Box bottom={wrappedScreen ? -10 : undefined}>
      <Box style={styles.border} borderColor={`${colorMode}.GreyText`} />
      <Box
        flexDirection="row"
        justifyContent={footerItemsToRender.length > 2 ? 'space-between' : 'space-around'}
        marginX={10}
        marginTop={3}
        alignItems={'flex-start'}
      >
        {footerItemsToRender.map((item) => {
          return (
            <TouchableOpacity
              testID={`btn_${item.text}`}
              key={item.text}
              style={styles.IconWrapper}
              onPress={item.onPress}
              disabled={item.disabled}
            >
              <item.Icon />
              <Text
                color={`${colorMode}.primaryText`}
                style={[styles.footerText, { maxWidth: windowWidth / footerItemsToRender.length }]}
                numberOfLines={2}
              >
                {item.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Box>
    </Box>
  );
};

export default KeeperFooter;

const styles = StyleSheet.create({
  footerText: {
    fontSize: 12,
    letterSpacing: 0.84,
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  IconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  border: {
    borderWidth: 0.5,
    opacity: 0.2,
  },
});
