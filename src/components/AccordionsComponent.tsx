import React,{useState} from 'react';
import { View, Text } from 'native-base';
import { ImageBackground, Touchable, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { List } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

import DownArrowIcon from '../assets/Images/svgs/down_arrow.svg';
import { baseFontSize } from 'native-base/lib/typescript/theme/tools';
import Fonts from 'src/common/Fonts';
import AddNewIcon from '../assets/Images/svgs/add_key.svg';

const AccordionsComponent = () => {
  const [expanded, setExpanded] = useState(true);

  const handlePress = () => setExpanded(!expanded);
  const ListItemComponent = () => {
    return <Text>
      hello
    </Text>
  }
  return (
    <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 3}} colors={['#ECD1B600', '#ECD1B6', '#ECD1B6']} style={styles.linearGradient}>
      <List.Section>
        <List.Accordion
          style={styles.accordionContainer}
          theme={{ colors: { background: 'transparent' } }}
          accessibilityLabel="false"
          title="Hexa Wallets"
          titleNumberOfLines={1}
          titleStyle={styles.accordionTitle}
          description="Lorem ipsum dolor sit amet"
          descriptionNumberOfLines={1}
          descriptionStyle={styles.accordionDescription}
          right={({ isExpanded }) =>
          (isExpanded ? <View style={styles.arrowIcon}><DownArrowIcon /></View>
            :
          <DownArrowIcon />)}>
          <List.Item titleStyle={styles.listItem} title= 'Single-sig Wallet'>
            <ListItemComponent/>
          </List.Item>
          <List.Item title="Second item" />
        </List.Accordion>
      </List.Section>
    </LinearGradient>
  );
};

const styles = ScaledSheet.create({
  linearGradient: {
    borderRadius: 6,
    marginTop:hp(3),
  },
  arrowIcon: {
    transform: [{ rotate: '180deg' }]
  },
  accordionContainer: {
    height: hp('10@s'),
    justifyContent:'center'
  },
  accordionTitle: {
    color: '#073E39',
    fontSize: RFValue(14),
    fontFamily: Fonts.RobotoCondensedRegular,
    letterSpacing:0.7
    
  },
  accordionDescription:{
    letterSpacing: 0.24,
    fontFamily:Fonts.RobotoCondensedLight,
    fontSize:RFValue(12)
  },
  listItem:{
    fontSize:RFValue(12),
    letterSpacing: 0.24,
    color: '#073E39',
    fontFamily: Fonts.RobotoCondensedRegular
  }
});
export default AccordionsComponent;
