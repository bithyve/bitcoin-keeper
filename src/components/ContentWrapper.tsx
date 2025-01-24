import React from 'react';
import { Box } from 'native-base';
import { StyleSheet } from 'react-native';
import { hp } from 'src/constants/responsive';

type ContentWrapperProps = {
  backgroundColor?: string;
  children?: React.ReactNode;
  padding?: number;
};

const ContentWrapper = ({ backgroundColor, children, padding = 0 }: ContentWrapperProps) => {
  return (
    <Box flex={1} background={backgroundColor} style={[style.Container, { padding: padding }]}>
      {children}
    </Box>
  );
};

export default ContentWrapper;
const style = StyleSheet.create({
  Container: {
    marginBottom: hp(10),
  },
});
