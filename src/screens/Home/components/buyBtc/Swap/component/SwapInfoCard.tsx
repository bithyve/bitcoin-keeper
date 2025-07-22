import { Box } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { useColorMode } from 'native-base';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';

type SwapInfoCardProps = {
  title: string;
  description?: string;
  width?: number;
  showIcon?: boolean;
  letterSpacing?: number;
  numberOfLines?: number;
  Icon?: React.ReactNode;
  Content?: React.ElementType;
};

export default function SwapInfoCard({
  title,
  description = '',
  width = 340,
  showIcon = false,
  letterSpacing = 1,
  numberOfLines = 1,
  Icon = null,
  Content = null,
}: SwapInfoCardProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const viewAll_color = ThemedColor({ name: 'viewAll_color' });

  return (
    <Box width={wp(width)} style={styles.infoCardContainer}>
      <Box
        style={[
          showIcon && {
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
          },
        ]}
      >
        <Box width={showIcon ? '92%' : '100%'}>
          <Box style={styles.titleWrapper}>
            <Text
              color={viewAll_color}
              style={[styles.titleText, { letterSpacing }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {showIcon && Icon}
          </Box>

          {Content ? (
            <Content />
          ) : (
            <Text
              style={styles.descText}
              color={isDark ? `${colorMode}.greenWhiteText` : `${colorMode}.greenishGreyText`}
              width="85%"
              numberOfLines={numberOfLines}
            >
              {description}
            </Text>
          )}
        </Box>
      </Box>
      <Box style={styles.divider} backgroundColor={`${colorMode}.border`} />
    </Box>
  );
}

const styles = StyleSheet.create({
  infoCardContainer: {
    justifyContent: 'center',
    paddingLeft: wp(8),
    paddingHorizontal: 3,
    paddingBottom: hp(10),
    paddingTop: hp(5),
  },
  infoCardsWrapper: {
    alignItems: 'center',
    marginTop: hp(20),
    justifyContent: 'center',
  },
  titleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 14,
    width: '100%',
  },
  descText: {
    marginTop: hp(5),
    fontSize: 13,
  },
  transDateText: {
    fontSize: 11,
  },
  transIDText: {
    fontSize: 14,
  },

  noteContainer: {
    width: windowWidth * 0.8,
  },
  divider: {
    marginTop: hp(15),
    height: 1,
    width: windowWidth * 0.835,
  },
});
