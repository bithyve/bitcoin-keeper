import React from 'react';
import { ScrollView, VStack } from 'native-base';
import TicketItem from './TicketItem';
import { hp } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';
import { tickets } from './constants';
import { CommonActions, useNavigation } from '@react-navigation/native';

const TicketList = () => {
  const navigation = useNavigation();
  const handlePress = (ticket) => {
    navigation.dispatch(CommonActions.navigate({ name: 'TicketDetails', params: { ticket } }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <VStack style={styles.ticketContainer}>
        {tickets.map((ticket, index) => (
          <TicketItem key={index} ticket={ticket} handlePress={() => handlePress(ticket)} />
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
