import { Box, Image } from 'native-base';
import React from 'react';
import { StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';
import Fonts from 'src/constants/Fonts';
import { hp, wp } from 'src/constants/responsive';
import BackWhiteButton from 'src/assets/images/leftarrowCampainlight.svg';
import ProfileArrow from 'src/assets/images/profile-arrow.svg';
import { useNavigation } from '@react-navigation/native';
import Colors from 'src/theme/Colors';

const AdvisorProfileHeader = ({ advisorImage }) => {
  const backgroundColor = ThemedColor({ name: 'homeScreen_header_background' });

  const navigation = useNavigation();

  return (
    <Box backgroundColor={backgroundColor}>
      <StatusBar barStyle={'light-content'} />
      <Box backgroundColor={backgroundColor} style={[styles.wrapper]}>
        <Box width="90%" style={styles.padding}>
          <Box style={styles.headerData}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.backButton}
            >
              <BackWhiteButton />
            </TouchableOpacity>
            <Text style={styles.headerText} color="#fff">
              Expert Profile
            </Text>
          </Box>

          <Box style={styles.headerData}>
            <ProfileArrow />
          </Box>
        </Box>
      </Box>
      <Box style={styles.circle} backgroundColor={Colors.headerWhite}>
        <Image source={{ uri: advisorImage }} style={styles.image} alt="image" />
      </Box>
    </Box>
  );
};

export default AdvisorProfileHeader;

const styles = StyleSheet.create({
  padding: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(64),
  },

  wrapper: {
    paddingHorizontal: wp(5),
    height: hp(164),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  headerData: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontFamily: Fonts.LoraMedium,
  },
  backButton: {
    height: hp(40),
    width: wp(25),
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    bottom: -hp(50),
    left: wp(22),
    width: wp(105),
    height: wp(105),
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  image: {
    width: wp(70),
    height: hp(70),
    borderRadius: 10,
  },
});
