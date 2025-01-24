import { Box, useColorMode } from 'native-base';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import UpgradeSubscription from 'src/screens/InheritanceToolsAndTips/components/UpgradeSubscription';

type CTACardDottedProps = {
  title: string;
  subTitle: string;
  icon: any;
  isActive?: boolean;
  onPress: () => void;
};

export const CTACardDotted = ({
  title,
  subTitle,
  icon,
  isActive = false,
  onPress,
}: CTACardDottedProps) => {
  const { colorMode } = useColorMode();
  const color = isActive ? `${colorMode}.noteTextClosed` : `${colorMode}.placeHolderTextColor`;

  return (
    <Pressable onPress={onPress}>
      <Box
        style={styles.container}
        borderColor={color}
        backgroundColor={
          isActive ? `${colorMode}.SeaweedGreenTranslucentBG` : `${colorMode}.graphiteTranslucentBG`
        }
      >
        <Box>{icon}</Box>
        <Box style={styles.textContainer}>
          <Box style={styles.titleRow}>
            <Text fontSize={15} medium color={color}>
              {title}
            </Text>
            {!isActive && (
              <UpgradeSubscription
                showText={false}
                type={'DH'}
                customStyles={{ container: styles.upgradeIconContainer }}
              />
            )}
          </Box>
          <Text fontSize={12} color={color}>
            {subTitle}
          </Text>
        </Box>
      </Box>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  upgradeIconContainer: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  container: {
    flexDirection: 'row',
    width: windowWidth * 0.88,
    paddingHorizontal: wp(16),
    paddingVertical: hp(14),
    borderRadius: 11,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: wp(10),
  },
  textContainer: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
