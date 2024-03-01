import { Box, useColorMode } from 'native-base';
import React, { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';

type Props = {
  totalScreens: number;
  currentScreen: number;
};

function Breadcrumbs({ totalScreens, currentScreen }: Props) {
  const { colorMode } = useColorMode();
  const length = totalScreens;
  const array = Array.from({ length }, () => 'value');
  return (
    <Box style={styles.container}>
      {array.map((elem, index) => {
        return (
          <Box
            key={index}
            style={[
              styles.screenIndicator,
              {
                width: index + 1 === currentScreen ? wp(26) : wp(6),
              },
            ]}
            backgroundColor={
              index + 1 === currentScreen ? `${colorMode}.pantoneGreen` : `${colorMode}.RussetBrown`
            }
          />
        );
      })}
    </Box>
  );
}

export default Breadcrumbs;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
  },
  screenIndicator: {
    height: hp(4),
    borderRadius: 4,
  },
});
