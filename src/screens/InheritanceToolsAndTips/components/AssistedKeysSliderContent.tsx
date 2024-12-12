import React from 'react';
import Text from 'src/components/KeeperText';
import { Box, ScrollView, useColorMode } from 'native-base';
import { Dimensions, StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import DashedButton from 'src/components/DashedButton';

const { width } = Dimensions.get('window');
function AssistedKeysContentSlider(props) {
  const { colorMode } = useColorMode();

  return (
    <ScrollView>
      <Box style={styles.wrapper}>
        <Text
          semiBold
          width={'80%'}
          fontSize={20}
          color={`${colorMode}.modalGreenContent`}
          letterSpacing={0.2}
        >
          {props.title}
        </Text>
        <Text
          width={'80%'}
          fontSize={14}
          mb={hp(15)}
          color={`${colorMode}.modalGreenContent`}
          letterSpacing={0.2}
        >
          {props.description}
        </Text>
        <Box width={'87%'}>
          <Text fontSize={14} color={`${colorMode}.modalGreenContent`}>
            {props.paragraph}
          </Text>
        </Box>
        <Box style={styles.icon}>{props.icon}</Box>
        <Box width={'87%'}>
          <Text color={`${colorMode}.modalGreenContent`}>{props.paragraph2}</Text>
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
          <Text bold color={`${colorMode}.modalGreenContent`}>
            Note:{' '}
          </Text>
          <Text color={`${colorMode}.modalGreenContent`}>{props.note}</Text>
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
