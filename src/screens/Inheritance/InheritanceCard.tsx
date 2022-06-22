import React from 'react';
import { Box, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { View, StyleSheet } from 'react-native';


type Props = {
    number: string;
    title: string;
    description: string;
  };

const InheritanceCard = ({
    number = 'Number',
    title = 'Name',
    description = 'Description',
  }: Props) => {
  return (
    <Box m={5}>
    <Box bg={'light.lightYellow'} flexDirection={'row'} p={15} borderRadius={10}>
      <View style={styles.inheritenceView}>
          <Text fontWeight={'extrabold'}> {number} </Text>
      </View>
        <View style = {{flexDirection: 'column'}}>
        <Text color={'light.headerText'} fontSize={RFValue(13)} fontFamily={'heading'}>
        {title}
        </Text>
        <Text color={'light.GreyText'} fontSize={RFValue(12)} marginRight={10} fontFamily={'body'}>
        {description}
          </Text>
        </View>
      </Box>
    </Box>
  );
};

export default InheritanceCard;

const styles = StyleSheet.create( {
    inheritenceView:{
        alignItems:'center',
        justifyContent:'center',
        width:30,
        height:30,
        backgroundColor:'#E3E3E3',
        borderRadius:30,
        marginRight: 20,
        alignSelf: 'center',
    }
})
