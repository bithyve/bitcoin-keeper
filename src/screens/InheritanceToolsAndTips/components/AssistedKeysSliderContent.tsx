import React, { useContext } from 'react';
import Text from 'src/components/KeeperText';
import { Box, ScrollView, useColorMode } from 'native-base';
import { Dimensions, StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import DashedButton from 'src/components/DashedButton';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const { width } = Dimensions.get('window');
function AssistedKeysContentSlider(props) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  return (
    <ScrollView>
      <Box style={styles.wrapper}>
        <Text
          semiBold
          width={'80%'}
          fontSize={20}
          color={`${colorMode}.headerWhite`}
          letterSpacing={0.2}
        >
          {props.title}
        </Text>
        <Text
          width={'80%'}
          fontSize={14}
          mb={hp(15)}
          color={`${colorMode}.headerWhite`}
          letterSpacing={0.2}
        >
          {props.description}
        </Text>
        <Box width={'87%'}>
          <Text fontSize={14} color={`${colorMode}.headerWhite`}>
            {props.paragraph}
          </Text>
        </Box>
        <Box style={styles.icon}>{props.icon}</Box>
        <Box width={'87%'}>
          <Text color={`${colorMode}.headerWhite`}>{props.paragraph2}</Text>
        </Box>
        <Box width={'90%'} marginTop={hp(30)} marginBottom={hp(5)} mt={hp(15)}>
          <DashedButton
            name={props.buttonTitle}
            description={props.buttonDescription}
            callback={props.callback}
            icon={props.buttonIcon}
          />
        </Box>
        <Box width={'90%'} mt={hp(15)}>
          <Text bold color={`${colorMode}.headerWhite`}>
            {common.note}:{' '}
          </Text>
          <Text color={`${colorMode}.headerWhite`}>{props.note}</Text>
        </Box>
      </Box>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    width,
    paddingHorizontal: 5,
    paddingBottom: 5,
    paddingTop: 40,
    flex: 1,
  },
  icon: {
    marginVertical: hp(20),
    alignItems: 'center',
    paddingRight: wp(45),
  },
});
export default AssistedKeysContentSlider;
