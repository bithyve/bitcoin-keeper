import React, { useContext } from 'react';
import { Box, Image, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import Buttons from 'src/components/Buttons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { wp, hp } from 'src/constants/responsive';
import StackedCirclesList from 'src/screens/Vault/components/StackedCircleList';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const DisabledExpertGuidance = () => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { concierge } = translations;

  const placeHolders = [
    {
      Icon: (
        <Image
          source={require('src/assets/images/person-placeholder-1.jpeg')}
          style={{ width: wp(52), height: wp(52) }}
        />
      ),
      backgroundColor: `${colorMode}.greyBackground`,
    },
    {
      Icon: (
        <Image
          source={require('src/assets/images/person-placeholder-2.jpeg')}
          style={{ width: wp(52), height: wp(52) }}
        />
      ),
      backgroundColor: `${colorMode}.greyBackground`,
    },
  ];

  return (
    <Box style={styles.disabledContainer}>
      <StackedCirclesList
        reverse
        width={wp(52)}
        height={wp(52)}
        itemDistance={wp(-24)}
        borderColor={`${colorMode}.pantoneGreen`}
        items={placeHolders}
      />
      <Box style={styles.disabledTextContainer}>
        <Text color={`${colorMode}.pitchBlackText`} fontSize={25} bold>
          {concierge.talkToExperts}
        </Text>
        <Text color={`${colorMode}.pitchBlackText`} fontSize={14} medium>
          {concierge.unlockAtDiamondOrHodler}
        </Text>
      </Box>
      <Buttons
        primaryText={concierge.upgradeToAccess}
        primaryCallback={() => {
          navigation.dispatch(CommonActions.navigate('ChoosePlan'));
        }}
        fullWidth
        primaryFontWeight="500"
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  disabledContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(40),
    paddingHorizontal: wp(32),
  },
  disabledTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: hp(20),
    paddingBottom: hp(40),
  },
});

export default DisabledExpertGuidance;
