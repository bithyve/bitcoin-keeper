import { Box, Image, ScrollView, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';
import MapPin from 'src/assets/images/MapPinIcon.svg';
import Buttons from 'src/components/Buttons';
import ViewProfile from 'src/assets/images/view-profile.svg';

type Props = {
  advisor?: any;
};

function ExpertiesPill({ name }: { name: string }) {
  return (
    <Box style={styles.pill} backgroundColor={'red.300'}>
      <Text color={Colors.WarmIvory} fontSize={11}>
        {name}
      </Text>
    </Box>
  );
}

const AdvisorCard = ({ advisor }: Props) => {
  const { colorMode } = useColorMode();

  return (
    <Box
      style={styles.container}
      backgroundColor={`${colorMode}.textInputBackground`}
      borderColor={`${colorMode}.separator`}
    >
      <Box style={styles.header}>
        <Box
          style={styles.circle}
          borderColor={`${colorMode}.pantoneGreen`}
          backgroundColor={Colors.headerWhite}
        >
          <Image source={{ uri: advisor.image }} style={styles.image} />
        </Box>

        <Box>
          <Box>
            <Text>{advisor.title}</Text>
            <Box style={styles.pinContainer}>
              <MapPin />
              <Text fontSize={13} color={Colors.lightGrayBeige}>
                {advisor.country}
              </Text>
            </Box>
          </Box>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Box style={styles.pillsScrollWrapper}>
              <Box style={styles.PillsContainer}>
                {advisor?.expertise?.map((item, index) => (
                  <ExpertiesPill key={index} name={item} />
                ))}
              </Box>
            </Box>
          </ScrollView>
          <Box style={styles.timeContainer}>
            <Text fontSize={12} medium color={`${colorMode}.black`}>
              Time zone:
            </Text>
            <Text color={`${colorMode}.textGreen`} fontSize={12}>
              {advisor.timezone}
            </Text>
          </Box>
          <Box style={styles.timeContainer}>
            <Text fontSize={12} medium color={`${colorMode}.black`}>
              Language:
            </Text>
            <Text color={`${colorMode}.textGreen`} fontSize={12}>
              {advisor.languages.join(', ')}
            </Text>
          </Box>
        </Box>
      </Box>
      <Box style={styles.ButtonContainer}>
        <Buttons primaryText="View Profile" fullWidth RightIcon={ViewProfile} />
      </Box>
    </Box>
  );
};

export default AdvisorCard;

const styles = StyleSheet.create({
  container: {
    padding: wp(20),
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: wp(15),
    top: wp(25),
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    gap: wp(10),
    marginBottom: wp(10),
  },
  circle: {
    width: wp(40),
    height: wp(40),
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  pinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: wp(5),
    marginBottom: wp(10),
    gap: wp(5),
  },
  PillsContainer: {
    flexDirection: 'row',
    gap: wp(5),
    paddingRight: wp(20),
    marginRight: wp(30),
  },
  pillsScrollWrapper: {
    height: wp(30),
    marginBottom: wp(8),
  },
  pill: {
    paddingHorizontal: wp(10),
    height: wp(22),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(30),
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(5),
    marginBottom: wp(10),
  },
  ButtonContainer: {
    marginTop: wp(5),
  },
  image: {
    width: wp(35),
    height: hp(20),
    borderRadius: 10,
  },
});
