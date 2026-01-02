import { Box } from 'native-base';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';

export const FAB = ({ icon, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Box style={styles.container}>{icon}</Box>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: wp(56),
    width: wp(56),
    borderRadius: wp(56),
    backgroundColor: Colors.primaryGreen,
    // position
    position: 'absolute',
    bottom: wp(16),
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
});
