import React from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { View, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import LinearGradient from 'react-native-linear-gradient';
import Laptop from '../../../../assets/images/svgs/laptop.svg';
import Next from '../../../../assets/images/svgs/next.svg';
import { BACKUP_KEYS } from 'src/common/data/defaultData/defaultData';

type Props = {
  title: string,
  subtitle: string,
  Icon: React.SFC<React.SVGProps<SVGSVGElement>>,
  item: BACKUP_KEYS,
  onPress: any,
  showAccordian?: boolean,
  touchable?: boolean,
};

const BackupListComponent = ({
  title = '',
  subtitle = '',
  Icon = null,
  item,
  onPress,
  showAccordian = true,
  touchable = true,
}: Props) => {
  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 3 }}
      colors={['#ECD1B600', '#ECD1B6', '#ECD1B6']}
      style={styles.linearGradient}
    >
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => touchable && onPress(item)}
        disabled={!touchable}
      >
        <View style={{ flexDirection: 'row' }}>
          <Icon />
          <View style={{ marginLeft: wp(2) }}>
            <Text style={styles.title} fontFamily="body" fontWeight="200" color="light.textBlack">
              {title}
            </Text>
            <Text
              style={styles.subtitle}
              fontFamily="body"
              fontWeight="100"
              color="light.textBlack"
            >
              {subtitle}
            </Text>
          </View>
        </View>
        {showAccordian && (
          <View style={{ paddingRight: wp(2) }}>
            <Next />
          </View>
        )}
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
  },
  linearGradient: {
    borderRadius: 6,
    marginTop: hp(2),
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
    fontWeight: '100'
  },
});
export default BackupListComponent;
