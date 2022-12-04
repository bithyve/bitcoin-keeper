import { Box, Text } from 'native-base';
import { FlatList, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

// asserts
import BackIcon from 'src/assets/icons/back.svg';
import Change from 'src/assets/images/svgs/change.svg';
import DotView from 'src/components/DotView';
import Edit from 'src/assets/images/svgs/edit.svg';
import Heathcheck from 'src/assets/images/svgs/heathcheck.svg';
import LinearGradient from 'react-native-linear-gradient';
// libraries
import { RFValue } from 'react-native-responsive-fontsize';
import React from 'react';
import Server from 'src/assets/images/svgs/server.svg';
import Settings from 'src/assets/images/svgs/settings_brown.svg';
// Components
import StatusBarComponent from 'src/components/StatusBarComponent';

function SigningServer({ navigation }) {
  function GradientIcon({ height, Icon }) {
    return (
      <LinearGradient
        colors={['#694B2E', '#694B2E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          height: hp(height),
          width: hp(height),
          borderRadius: height,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icon />
      </LinearGradient>
    );
  }
  function SimpleIcon({ height, Icon }) {
    return (
      <Box
        style={{
          height: hp(height),
          width: hp(height),
          borderRadius: height,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FAC48B',
        }}
      >
        <Icon />
      </Box>
    );
  }

  function Description({ text }) {
    return (
      <Text
        color="light.inActiveMsg"
        fontSize={RFValue(12)}
        fontWeight="200"
        letterSpacing={0.6}
      >
        {text}
      </Text>
    );
  }
  function HistoryCard() {
    return (
      <Box>
        <Box
          zIndex={99}
          position="absolute"
          left={-8}
          bg="light.ReceiveBackground"
          p={2}
          borderRadius={15}
        >
          <DotView height={2} width={2} color="#E3BE96" />
        </Box>
        <Text
          color="light.GreyText"
          fontSize={RFValue(10)}
          fontWeight="300"
          ml={5}
          opacity={0.7}
        >
          15 March ’21
        </Text>
        <Box borderLeftColor="#E3BE96" borderLeftWidth={1} ml={wp(3.5)} position="relative">
          <Box
            backgroundColor="light.lightYellow"
            my={2}
            p={5}
            marginLeft={wp(15)}
            borderRadius={10}
          >
            <Text
              color="light.recieverAddress"
              fontSize={RFValue(14)}
              fontWeight={200}
              letterSpacing={0.96}
            >
              Health Check Skipped
            </Text>
            <Description
              text="Lorem ipsum dolor sit amet, cons ectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et"
            />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F7F2EC',
      }}
    >
      <StatusBarComponent padding={hp(2)} />

      <Box
        flexDirection="row"
        justifyContent="space-between"
        style={{
          paddingLeft: wp(30),
          paddingRight: wp(20),
          marginTop: hp(20),
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
        <Box
          height={hp(20)}
          width={wp(70)}
          borderColor="light.brownborder"
          borderWidth={0.5}
          borderRadius={5}
          backgroundColor="light.yellow2"
          justifyContent="center"
          alignItems="center"
        >
          <Text color="light.brownborder" fontWeight={200} letterSpacing={0.6} fontSize={12}>
            Learn More
          </Text>
        </Box>
      </Box>

      <Box alignItems="center" justifyContent="center" flexDirection="row" marginTop={hp(35)}>
        <Box marginRight={wp(17)}>
          <GradientIcon Icon={Server} height={hp(50)} />
        </Box>
        <Box>
          <Text
            fontSize={RFValue(14)}
            fontWeight="200"
            letterSpacing={1.12}
            color="light.lightBlack"
          >
            Signing Server
          </Text>
          <Text
            fontSize={RFValue(10)}
            fontWeight="200"
            letterSpacing={1}
            color="light.modalText"
          >
            Added on 12 January 2022
          </Text>
          <Text
            color="light.GreyText"
            fontSize={RFValue(12)}
            fontFamily="body"
            letterSpacing={0.6}
          >
            Lorem ipsum dolor sit amet
          </Text>
        </Box>
        <Box marginLeft={wp(40)}>
          <Edit />
        </Box>
      </Box>

      <Box mx={wp(30)} marginTop={hp(50)} height={hp(380)}>
        <FlatList
          data={[1, 2, 3, 4, 5]}
          contentContainerStyle={{ flexGrow: 1 }}
          renderItem={({ item }) => <HistoryCard />}
          keyExtractor={(item) => `${item}`}
          showsVerticalScrollIndicator={false}
        />
      </Box>
      <Box
        style={{
          marginHorizontal: wp(40),
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          style={{
            marginVertical: hp(20),
          }}
        >
          <Text color="light.modalText" fontWeight={200} fontSize={13} letterSpacing={0.65}>
            You will be reminded in 90 days for the health check
          </Text>
        </Box>
        <Box
          marginLeft={2}
          width={wp(318)}
          backgroundColor="light.Border"
          opacity={0.1}
          height={0.5}
        />
        <Box
          width={wp(256)}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginTop={hp(18)}
        >
          <TouchableOpacity style={styles.IconText}>
            <SimpleIcon Icon={Change} height={hp(38)} />
            <Text
              color="light.lightBlack"
              fontSize={12}
              letterSpacing={0.84}
              marginY={1}
              width={wp(52)}
              textAlign="center"
              numberOfLines={2}
            >
              Change Signer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.IconText}>
            <SimpleIcon Icon={Heathcheck} height={hp(38)} />
            <Text
              color="light.lightBlack"
              fontSize={12}
              letterSpacing={0.84}
              marginY={1}
              width={wp(52)}
              numberOfLines={2}
              textAlign="center"
            >
              Health Check
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.IconText}>
            <SimpleIcon Icon={Settings} height={hp(38)} />
            <Text
              color="light.lightBlack"
              fontSize={12}
              letterSpacing={0.84}
              marginY={1}
              width={wp(60)}
              numberOfLines={2}
              textAlign="center"
            >
              Advanced Options
            </Text>
          </TouchableOpacity>
        </Box>
      </Box>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  IconText: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SigningServer;
