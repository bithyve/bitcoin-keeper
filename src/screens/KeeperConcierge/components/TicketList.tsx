import React from 'react';
import { ScrollView, VStack } from 'native-base';
import TicketItem from './TicketItem';
import { hp } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useAppSelector } from 'src/store/hooks';

const TicketList = () => {
  const { tickets } = useAppSelector((state) => state.concierge);
  const navigation = useNavigation();
  const handlePress = (ticketId, ticketStatus) => {
    navigation.dispatch(
      CommonActions.navigate({ name: 'TicketDetails', params: { ticketId, ticketStatus } })
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <VStack style={styles.ticketContainer}>
        {tickets.map((ticket, index) => (
          <TicketItem
            key={index}
            ticket={ticket}
            handlePress={() => handlePress(ticket.id, ticket.status)}
          />
        ))}
      </VStack>
    </ScrollView>
  );
};

export default TicketList;

const styles = StyleSheet.create({
  container: {
    paddingBottom: hp(100),
  },
  ticketContainer: {
    marginTop: hp(5),
  },
});
