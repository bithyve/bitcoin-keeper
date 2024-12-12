import React from 'react';
import { Box, HStack, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import { timeFromTimeStamp } from 'src/utils/utilities';
import { useSelector } from 'react-redux';
import Colors from 'src/theme/Colors';
import CardPill from 'src/components/CardPill';
import { ConciergeTicketStatus } from 'src/models/enums/ConciergeTag';

const TicketItem = ({ ticket, handlePress }) => {
  const { colorMode } = useColorMode();
  const { commentsCounter } = useSelector((store) => store.concierge);
  const newComment = ticket.comment_count > commentsCounter[ticket.id];
  const isSolved = ticket.status == ConciergeTicketStatus.SOLVED;

  return (
    <TouchableOpacity onPress={handlePress}>
      <Box
        style={styles.box}
        backgroundColor={`${colorMode}.primaryBackground`}
        borderColor={`${colorMode}.dullGreyBorder`}
      >
        <HStack style={styles.header}>
          <Box alignItems={'center'} flexDirection={'row'}>
            <Text color={`${colorMode}.primaryText`} fontSize={15} semiBold>
              {'Support Team '}
              <Text color={`${colorMode}.greenText`} fontSize={15}>
                #{ticket.id}
              </Text>
            </Text>
            {newComment && <Box style={styles.redDot} />}
          </Box>
          <Text color={`${colorMode}.primaryText`} fontSize={12}>
            {timeFromTimeStamp(ticket.created_at)}
          </Text>
        </HStack>
        <HStack style={{ marginTop: hp(2.5), justifyContent: 'space-between' }}>
          <Text
            color={`${colorMode}.greenishGreyText`}
            fontSize={12}
            numberOfLines={2}
            style={styles.text}
          >
            {ticket.description}
          </Text>
          <Box justifyContent={'center'}>
            <CardPill
              heading={isSolved ? ConciergeTicketStatus.SOLVED : ConciergeTicketStatus.OPEN}
              headingColor={Colors.White}
              backgroundColor={isSolved ? Colors.ForestGreen : Colors.FadeBlue}
            />
          </Box>
        </HStack>
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
  text: {
    width: '80%',
  },
  redDot: {
    height: hp(8),
    width: wp(8),
    borderRadius: wp(16),
    marginLeft: wp(10),
    alignSelf: 'center',
    backgroundColor: Colors.AlertRed,
  },
});

export default TicketItem;
