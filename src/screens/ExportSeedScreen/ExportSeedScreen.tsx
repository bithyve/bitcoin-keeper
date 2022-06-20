import React, { useState, useContext } from 'react';
import { Box, Text } from 'native-base';
import { FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import StatusBarComponent from 'src/components/StatusBarComponent';
import HeaderTitle from 'src/components/HeaderTitle';
import { windowHeight } from 'src/common/data/responsiveness/responsive';
import { LocalizationContext } from 'src/common/content/LocContext';

const ExportSeedScreen = ({ route }) => {
  const navigtaion = useNavigation();
  const seed = route.params.seed;

  const [showSeedWord, setShowSeedWord] = useState('');

  const { translations } = useContext(LocalizationContext);
  const seedText = translations['seed'];

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
        title={seedText.ExportSeed}
        subtitle={seedText.SeedDesc}
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
        {seedText.desc}
      </Text>
    </Box>
  );
};

export default ExportSeedScreen;
