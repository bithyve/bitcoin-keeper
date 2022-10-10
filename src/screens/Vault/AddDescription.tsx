import {
  TextInput,
} from 'react-native';
// libraries
import { Box, Text } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import Colors from 'src/theme/Colors';
import Header from 'src/components/Header';
import Tapsigner from 'src/assets/images/svgs/Tapsigner_brown.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
// components
import StatusBarComponent from 'src/components/StatusBarComponent';
import { useDispatch } from 'react-redux';
import Buttons from 'src/components/Buttons';

const AddDescription = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  return (
    <Box
      style={styles.Container}
    >
      <StatusBarComponent padding={50} />
      <Box marginX={3} >
        <Box width={wp(200)}>
          <Header
            title={'Add Description'}
            subtitle={'Optionally you can add a short description to the Signing Device'}
            onPressHandler={() => navigation.goBack()}
            headerTitleColor={'light.textBlack'}
          />
        </Box>
        {/* {card} */}
        <Box
          flexDirection={'row'}
          alignItems={'center'}
          marginTop={hp(91)}
        >
          <Tapsigner />
          <Box>
            <Text
              fontWeight={200}
              fontSize={14}
              letterSpacing={1.12}
            >
              TapSigner
            </Text>
            <Text
              fontWeight={200}
              fontSize={10}
              letterSpacing={1}
              color={'light.modalText'}
            >
              Added on 12 January 2022
            </Text>
          </Box>
        </Box>

        {/* send manually option */}
        <Box
          marginTop={hp(20)}
          width={'100%'}
        >
          <Text
            textAlign={'right'}
            fontWeight={200}
            fontSize={10}
            letterSpacing={1}
          >
            2/10
          </Text>
          <TextInput
            placeholder="Add Description"
            style={styles.textInput}
            placeholderTextColor={'#073E39'}

          />
        </Box>
        {/* {buttons} */}
        <Box marginTop={hp(70)}>
          <Buttons
            primaryText='Proceed'
            primaryCallback={() => { }}
            secondaryText='Skip'
            secondaryCallback={() => { }}
          />
        </Box>
      </Box>



    </Box>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
    backgroundColor: 'light.ReceiveBackground',
  },
  linearGradient: {
    borderRadius: 6,
    marginTop: hp(3),
  },
  cardContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: RFValue(12),
    letterSpacing: '0.24@s',
  },
  subtitle: {
    fontSize: RFValue(10),
    letterSpacing: '0.20@s',
  },

  textInput: {
    width: '100%',
    backgroundColor: '#FDF7F0',
    borderRadius: 10,
    opacity: 0.5,
    padding: 15,
  },



});
export default AddDescription;
