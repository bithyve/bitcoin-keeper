import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { wp } from 'src/constants/responsive';
import EditIcon from 'src/assets/images/Edit-Icon.svg';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { numberWithCommas } from 'src/utils/utilities';

type Props = {
  signingServer?: any;
  navigation?: any;
  maxTransaction?: any;
  timelimit?: any;
  delayTime?: any;
};

const ServerKeyPolicyCard = (props: Props) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const handleSpendingLimit = () => {
    props.navigation.navigate('SpendingLimit', {
      totalSats: props.maxTransaction,
      totalTime: props.timelimit,
    });
  };
  const handleDelay = () => {
    props.navigation.navigate('SigningDelay', {
      totalDelay: props.delayTime,
    });
  };
  return (
    <Box backgroundColor={`${colorMode}.textInputBackground`} style={styles.container}>
      <Text color={`${colorMode}.modalSubtitleBlack`} style={styles.title} medium>
        {props.signingServer.configureLimit}
      </Text>
      <Text fontSize={12} color={`${colorMode}.modalSubtitleBlack`}>
        {props.signingServer.configureLimitSubTitle}
      </Text>
      <TouchableOpacity onPress={handleSpendingLimit}>
        <Box
          backgroundColor={
            isDarkMode ? `${colorMode}.primaryBackground` : `${colorMode}.learMoreTextcolor`
          }
          style={styles.inputContainer}
        >
          <Box style={styles.alignCenter}>
            <Text>{props.maxTransaction ? numberWithCommas(props.maxTransaction) : 'Off'} </Text>
            {props.maxTransaction ? (
              <Text>
                sats{' '}
                {props.timelimit && props?.timelimit?.value !== 0
                  ? '/' + ' ' + props.timelimit?.label
                  : ''}
              </Text>
            ) : (
              ''
            )}
          </Box>
          <EditIcon />
        </Box>
      </TouchableOpacity>
      <Box backgroundColor={`${colorMode}.dullGreyBorder`} style={styles.separator} />
      <Text color={`${colorMode}.modalSubtitleBlack`} style={styles.title} medium>
        {props.signingServer.signigDelay}
      </Text>
      <Text color={`${colorMode}.modalSubtitleBlack`} fontSize={12}>
        {props.signingServer.signigDelaySubTitle}
      </Text>
      <TouchableOpacity onPress={handleDelay}>
        <Box
          backgroundColor={
            isDarkMode ? `${colorMode}.primaryBackground` : `${colorMode}.learMoreTextcolor`
          }
          style={styles.inputContainer}
        >
          <Box style={styles.alignCenter}>
            <Text>{props.delayTime ? props.delayTime?.label : 'Off'} </Text>
          </Box>
          <EditIcon />
        </Box>
      </TouchableOpacity>
    </Box>
  );
};

export default ServerKeyPolicyCard;

const styles = StyleSheet.create({
  container: {
    padding: wp(20),
    borderRadius: wp(15),
  },
  inputContainer: {
    padding: wp(15),
    borderRadius: wp(10),
    marginTop: wp(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    marginBottom: wp(8),
  },
  alignCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    alignSelf: 'center',
    width: '100%',
    marginVertical: wp(30),
  },
});
