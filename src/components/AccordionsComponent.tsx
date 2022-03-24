import React, { useState } from 'react';
import { View } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { scale, ScaledSheet } from 'react-native-size-matters';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { List } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

import DownArrowIcon from 'src/assets/Images/svgs/down_arrow.svg';
import Fonts from 'src/common/Fonts';
import { customTheme } from 'src/common/themes';

const Colors = customTheme.colors.light;

const AccordionsComponent = ({ item }) => {
  const [expanded, setExpanded] = useState(true);
  const handlePress = () => setExpanded(!expanded);

  return (
    <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 3 }} colors={['#ECD1B600', '#ECD1B6', '#ECD1B6']} style={styles.linearGradient}>
      <List.Section>
        <List.Accordion
          style={styles.accordionContainer}
          theme={{ colors: { background: 'transparent' } }}
          accessibilityLabel="false"
          title={item?.heading}
          titleNumberOfLines={1}
          titleStyle={styles.accordionTitle}
          description={item.description}
          descriptionNumberOfLines={1}
          descriptionStyle={styles.accordionDescription}
          right={({ isExpanded }) =>
          (isExpanded && item?.items.length !== 0 ? <View style={styles.arrowIcon}><DownArrowIcon /></View>
            :
            <View style={{ marginRight: scale(10) }}><DownArrowIcon /></View>)}>
          {item?.items.map((x, index) => {
            const Icon = x?.icon
            return (<List.Item
              key={index}
              style={styles.itemStyle}
              titleStyle={styles.listItem}
              title={x.title}
              titleNumberOfLines={1}
              description={x?.description}
              descriptionNumberOfLines={1}
              descriptionStyle={styles.itemDescription}
              right={() => <View style={{ justifyContent: 'center', transform: [{ rotate: '270deg' }], marginRight: scale(15) }}><DownArrowIcon /></View>}
              left={() => <View style={{ justifyContent: 'center', padding: scale(7) }}><Icon /></View>}
              onPress={() => { }}
            />)
          })}
        </List.Accordion>
      </List.Section>
    </LinearGradient>
  );
};

const styles = ScaledSheet.create({
  linearGradient: {
    borderRadius: 6,
    marginTop: hp(3),
  },
  arrowIcon: {
    transform: [{ rotate: '180deg' }],
    marginRight: '8@s'
  },
  accordionContainer: {
    height: hp('10@s'),
    justifyContent: 'center'

  },
  itemStyle: {
  },
  accordionTitle: {
    color: Colors.greenText,
    fontSize: RFValue(14),
    fontFamily: Fonts.RobotoCondensedRegular,
    letterSpacing: 0.7

  },
  accordionDescription: {
    letterSpacing: 0.24,
    fontFamily: Fonts.RobotoCondensedLight,
    fontSize: RFValue(12),
    color: Colors.textBlack,
    fontWeight: '100'
  },
  listItem: {
    fontSize: RFValue(12),
    letterSpacing: 0.24,
    color: Colors.greenText,
    fontFamily: Fonts.RobotoCondensedRegular,

  },
  itemDescription: {
    fontSize: RFValue(10),
    fontFamily: Fonts.RobotoCondensedLight,
    letterSpacing: 0.5,
    color: Colors.lightBlack,
    fontWeight: '100',
    width: wp('55%')
  }
});
export default AccordionsComponent;
