import { StyleSheet } from 'react-native';
import React from 'react';
import LinearGradient from 'src/components/KeeperGradient';
import { hp } from 'src/common/data/responsiveness/responsive';

function GradientIcon({ height, Icon, gradient = ['#9BB4AF', '#9BB4AF'] }: any) {
  return (
    <LinearGradient
      colors={gradient}
      start={[0, 0]}
      end={[1, 1]}
      style={{
        height: hp(height),
        width: hp(height),
        borderRadius: height,
        ...styles.center,
      }}
    >
      <Icon />
    </LinearGradient>
  );
}

export default GradientIcon;

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
