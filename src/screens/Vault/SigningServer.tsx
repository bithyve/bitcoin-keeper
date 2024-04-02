/* eslint-disable react/no-unstable-nested-components */
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import { FlatList, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from 'src/constants/responsive';

import BackIcon from 'src/assets/images/back.svg';
import Change from 'src/assets/images/change.svg';
import DotView from 'src/components/DotView';
import Edit from 'src/assets/images/edit.svg';
import Heathcheck from 'src/assets/images/heathcheck.svg';
// libraries
import React from 'react';
import Server from 'src/assets/images/server.svg';
import Settings from 'src/assets/images/settings_brown.svg';
import StatusBarComponent from 'src/components/StatusBarComponent';

function SigningServer({ navigation }) {
  const { colorMode } = useColorMode();
  function GradientIcon({ height, Icon }) {
    return (
      <Box
        style={{
          height: hp(height),
          width: hp(height),
          borderRadius: height,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        backgroundColor={`${colorMode}.coffeeBackground`}
      >
        <Icon />
      </Box>
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
          backgroundColor: `${colorMode}.lightAccent`,
        }}
      >
        <Icon />
      </Box>
    );
  }

  function Description({ text }) {
    return (
      <Text color={`${colorMode}.inActiveMsg`} fontSize={12} letterSpacing={0.6}>
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
          backgroundColor={`${colorMode}.secondaryBackground`}
          padding={2}
          borderRadius={15}
        >
          <DotView height={2} width={2} color={`${colorMode}.lightAccent`} />
        </Box>
        <Text color={`${colorMode}.GreyText`} fontSize={10} bold ml={5} opacity={0.7}>
          15 March ’21
        </Text>
        <Box
          borderLeftColor={`${colorMode}.lightAccent`}
          borderLeftWidth={1}
          ml={wp(3.5)}
          position="relative"
        >
          <Box
            backgroundColor={`${colorMode}.primaryBackground`}
            my={2}
            padding={5}
            marginLeft={wp(15)}
            borderRadius={10}
          >
            <Text color={`${colorMode}.recieverAddress`} fontSize={14} letterSpacing={0.96}>
              Health Check Skipped
            </Text>
            <Description text="Lorem ipsum dolor sit amet, cons ectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et" />
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
          borderColor={`${colorMode}.learnMoreBorder`}
          borderWidth={0.5}
          borderRadius={5}
          backgroundColor={`${colorMode}.lightAccent`}
          justifyContent="center"
          alignItems="center"
        >
          <Text color={`${colorMode}.learnMoreBorder`} letterSpacing={0.6} fontSize={12}>
            Learn More
          </Text>
        </Box>
      </Box>

      <Box alignItems="center" justifyContent="center" flexDirection="row" marginTop={hp(35)}>
        <Box marginRight={wp(17)}>
          <GradientIcon Icon={Server} height={hp(50)} />
        </Box>
        <Box>
          <Text fontSize={14} letterSpacing={1.12} color={`${colorMode}.primaryText`}>
            Signing Server
          </Text>
          <Text fontSize={10} letterSpacing={1} color={`${colorMode}.greenText`}>
            Added on 12 January 2022
          </Text>
          <Text color={`${colorMode}.GreyText`} fontSize={12} letterSpacing={0.6}>
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
          <Text color={`${colorMode}.greenText`} fontSize={13} letterSpacing={0.65}>
            You will be reminded in 90 days for the health check
          </Text>
        </Box>
        <Box
          marginLeft={2}
          width={wp(318)}
          backgroundColor={`${colorMode}.Border`}
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
              color={`${colorMode}.primaryText`}
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
              color={`${colorMode}.primaryText`}
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
              color={`${colorMode}.primaryText`}
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
