import React from 'react';
import { Box } from 'native-base';

type ContentWrapperProps = {
  backgroundColor?: string;
  children?: React.ReactNode;
  padding?: number;
};

const ContentWrapper = ({ backgroundColor, children, padding = 0 }: ContentWrapperProps) => {
  return (
    <Box safeAreaBottom flex={1} background={backgroundColor} style={{ padding }}>
      {children}
    </Box>
  );
};

export default ContentWrapper;
