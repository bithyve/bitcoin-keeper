import React from 'react';
import { Box, HStack, VStack, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';

const TicketItem = ({ ticket, handlePress }) => {
  const { colorMode } = useColorMode();
  const isReply = ticket.isReply;

  return (
    <TouchableOpacity onPress={handlePress}>
      <Box
        style={styles.box}
        backgroundColor={`${colorMode}.primaryBackground`}
        borderColor={`${colorMode}.dullGreyBorder`}
      >
        <HStack style={styles.header}>
          <Text color={`${colorMode}.primaryText`} fontSize={15} semiBold>
            Support Team{'  '}
            <Text color={`${colorMode}.greenText`} fontSize={15}>
              #{ticket.ticketId}
            </Text>
          </Text>
          <Text color={`${colorMode}.primaryText`} fontSize={12}>
            {ticket.time}
          </Text>
        </HStack>
        <VStack style={{ marginTop: !isReply ? hp(12) : hp(2.5) }}>
          {isReply ? (
            <HStack>
              <VStack style={styles.lineContainer}>
                <Box style={styles.circle} backgroundColor={`${colorMode}.secondaryGrey`} />
                <Box style={styles.dottedLine} borderColor={`${colorMode}.secondaryGrey`} />
                <Box style={styles.circle} backgroundColor={`${colorMode}.secondaryGrey`} />
              </VStack>

              <VStack style={{ flex: 1, marginLeft: wp(8) }}>
                <Text
                  color={`${colorMode}.primaryText`}
                  semiBold
                  fontSize={12}
                  numberOfLines={1}
                  style={styles.text}
                >
                  {ticket.replyHeader}
                </Text>
                <Text
                  color={`${colorMode}.greenishGreyText`}
                  fontSize={12}
                  numberOfLines={1}
                  style={styles.replyContent}
                >
                  {ticket.replyContent}
                </Text>
              </VStack>
            </HStack>
          ) : (
            <Text
              color={`${colorMode}.greenishGreyText`}
              fontSize={12}
              numberOfLines={2}
              style={styles.text}
            >
              {ticket.content}
            </Text>
          )}
        </VStack>
      </Box>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  box: {
    minHeight: hp(99),
    paddingVertical: hp(16),
    paddingLeft: wp(24),
    paddingRight: wp(26),
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lineContainer: {
    alignItems: 'center',
    marginTop: hp(6),
  },
  circle: {
    width: wp(5),
    height: wp(5),
    borderRadius: wp(5),
  },
  dottedLine: {
    borderStyle: 'dotted',
    borderWidth: 1,
    height: hp(23),
  },
  replyContent: {
    marginTop: hp(10),
    width: '95%',
  },
  text: {
    width: '95%',
  },
});

export default TicketItem;
