import React, { useContext } from 'react';
import { Box, Text } from 'native-base';
import { FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import StatusBarComponent from 'src/components/StatusBarComponent';
import HeaderTitle from 'src/components/HeaderTitle';
import Buttons from 'src/components/Buttons';
import { windowHeight } from 'src/common/data/responsiveness/responsive';
import { LocalizationContext } from 'src/common/content/LocContext';

const ExportSeedScreen = ({ route }) => {
  const navigtaion = useNavigation();
  const seed = route.params.seed;

  const { translations } = useContext( LocalizationContext )
  const seed = translations[ 'seed' ]
  const SeedCard = ({ item, index }: { item; index }) => {
    return (
      <Box
        backgroundColor={'light.lightYellow'}
        flexDirection={'row'}
        padding={4}
        borderRadius={10}
        marginX={3}
        width={'82%'}
        marginY={1.5}
      >
        <Text
          fontSize={20}
          fontWeight={300}
          letterSpacing={1.64}
          marginRight={10}
          color={'light.light'}
        >
          {index + 1}
        </Text>
        <Text fontSize={20} fontWeight={200} backgroundColor={'green.700'} letterSpacing={1} color={'light.seedText'} >
          {seed.longing}
        </Text>
      </Box>
    );
  };

  const renderSeedCard = ({ item, index }: { item; index }) => {
    return <SeedCard item={item} index={index} />;
  };

  return (
    <Box flex={1} padding={5} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={30} />
      <HeaderTitle
        title={seed.ExportSeed}
        subtitle={seed.SeedDesc}
        color='light.ReceiveBackground'
        onPressHandler={() => navigtaion.goBack()}
      />

      <Box marginTop={5} height={windowHeight / 1.8}>
        <FlatList
          data={seed.split(' ')}
          showsVerticalScrollIndicator={false}
          renderItem={renderSeedCard}
          keyExtractor={(item) => item}
        />
      </Box>
      <Text marginX={2} marginTop={5} fontSize={12} fontWeight={200} letterSpacing={0.60} marginRight={10} color={'light.GreyText'}>
        {seed.desc}
      </Text>
      <Box marginX={2} marginTop={5}>
        <Buttons primaryText="Next" primaryCallback={navigtaion.goBack} />
      </Box>
    </Box>
  );
};

export default ExportSeedScreen;
