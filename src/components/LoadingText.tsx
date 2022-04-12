import React, { useState } from 'react'
import { HStack, Spinner, CheckIcon } from 'native-base';
import { Text } from 'react-native';

const LoadingText = ({ text, timeOut }) => {
  const [loading, setLoading] = useState(true);

  setTimeout(() => {
    setLoading(false);
  }, timeOut * 500);

  return (
    <HStack space={2} justifyContent="center" minHeight={16} alignItems={'center'}>
      {loading ? (
        <Spinner accessibilityLabel="Loading posts" color={'#D8A572'} />
      ) : (
        <CheckIcon size="5" mt="0.5" color="emerald.500" />
      )}
      <Text>{text}</Text>
    </HStack>
  );
};

export default LoadingText;