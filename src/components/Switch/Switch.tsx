import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Box } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {
    borderRadius: wp(5),
    // height: wp(8),
    // with: wp(12),
  },
});

type Props = {
  value: boolean;
  onValueChange: Function;
};

const Switch = ({ value, onValueChange }: Props) => {
  return (
    <TouchableOpacity onPress={() => onValueChange(!value)}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
        colors={value ? ['#2C3E50', '#00836A'] : ['#4E5C6A', '#4E5C6A']}
      >
        <Box
          height={8}
          width={12}
          borderRadius={10}
          justifyContent={'center'}
          alignItems={'center'}
        >
          {value ? (
            <Box
              height={6}
              width={6}
              borderRadius={15}
              backgroundColor={'#fcfcfc'}
              alignSelf="flex-end"
              mx={1}
            />
          ) : (
            <Box
              height={6}
              width={6}
              borderRadius={15}
              backgroundColor={'#fbfbfb'}
              alignSelf="flex-start"
              mx={1}
            />
          )}
        </Box>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default Switch;
