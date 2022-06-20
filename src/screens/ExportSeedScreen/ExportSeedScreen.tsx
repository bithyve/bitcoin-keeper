import React, { useState } from 'react';
import { Box, Text, useToast } from 'native-base';
import { FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import StatusBarComponent from 'src/components/StatusBarComponent';
import HeaderTitle from 'src/components/HeaderTitle';
import Buttons from 'src/components/Buttons';
import { windowHeight } from 'src/common/data/responsiveness/responsive';

const ExportSeedScreen = ({ route }) => {
  const Toast = useToast();
  const navigtaion = useNavigation();
  const seed = route.params.seed;

  const [showSeedWord, setShowSeedWord] = useState('');

  const SeedCard = ({ item, index }: { item; index }) => {
    return (
      <TouchableOpacity style={{ width: '50%' }} onPress={() => setShowSeedWord(item)}>
        <Box
          backgroundColor={'light.lightYellow'}
          flexDirection={'row'}
          padding={4}
          borderRadius={10}
          marginX={3}
          marginY={1.5}
          opacity={showSeedWord == item ? 1 : 0.5}
        >
          <Text
            fontSize={20}
            fontWeight={300}
            letterSpacing={1.64}
            marginRight={5}
            color={'light.greenText2'}
          >
            {index < 9 ? '0' : null}
            {index + 1}
          </Text>
          <Text
            fontSize={20}
            fontWeight={200}
            backgroundColor={'green.700'}
            letterSpacing={1}
            color={'light.seedText'}
          >
            {showSeedWord == item ? item : '******'}
          </Text>
        </Box>
      </TouchableOpacity>
    );
  };

  const renderSeedCard = ({ item, index }: { item; index }) => {
    return <SeedCard item={item} index={index} />;
  };

  return (
    <Box flex={1} padding={5} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={30} />
      <HeaderTitle
        title="Export Seeds"
        subtitle="Make sure you keep them safe"
        color="light.ReceiveBackground"
        onPressHandler={() => navigtaion.goBack()}
      />

      <Box marginTop={10} height={windowHeight / 1.5}>
        <FlatList
          data={seed.split(' ')}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={renderSeedCard}
          keyExtractor={(item) => item}
        />
      </Box>
      <Text
        marginX={2}
        marginTop={5}
        fontSize={12}
        fontWeight={200}
        letterSpacing={0.6}
        marginRight={10}
        color={'light.GreyText'}
      >
        Use these to create any other wallet and that wallet will be linked to Keeper (will show
        along with other wallets)
      </Text>
    </Box>
  );
};

export default ExportSeedScreen;
