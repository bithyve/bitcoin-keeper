import React from 'react';
import { Box, Image, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import { Shadow } from 'react-native-shadow-2';
import Colors from 'src/theme/Colors';
import MapPinLight from 'src/assets/images/map-pin-light.svg';
import MapPinDark from 'src/assets/images/map-pin-dark.svg';
import PersonLight from 'src/assets/images/person-light.svg';
import PersonDark from 'src/assets/images/person-dark.svg';
import CardPill from 'src/components/CardPill';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { sha256 } from 'bitcoinjs-lib/src/crypto';

interface ExpertCardProps {
  advisorData: {
    name: string;
    location: string;
    expertise: string[];
    details: {
      timeZone: string;
      experience: string;
      language: string;
    };
  };
}

interface DetailItemProps {
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.detailItemContainer}>
      <Text color={`${colorMode}.pitchBlackText`} fontSize={12} medium>
        {label}:
      </Text>
      <Text color={`${colorMode}.greenishGreyText`} fontSize={12}>
        {value || 'Not available'}
      </Text>
    </Box>
  );
};

const ExpertCard: React.FC<ExpertCardProps> = ({ advisorData }) => {
  const { name, location, expertise, details } = advisorData;
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const shadowStyles = isDarkMode
    ? {}
    : {
        distance: 9,
        startColor: Colors.lightGrey,
        offset: [0, 4],
        radius: hp(10),
      };

  const handleViewProfile = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ExpertProfile',
        params: { advisorData },
      })
    );
  };

  function getTagColor(tag) {
    const tagHash = sha256(tag).toString('hex');
    const num = parseInt(tagHash.slice(0, 8), 16);
    const labelColorsCount = 10;
    const colorIndex = (num % labelColorsCount) + 1;
    return `${colorMode}.tagColor${colorIndex}`;
  }

  return (
    <Shadow {...shadowStyles}>
      <Box
        style={styles.container}
        borderColor={`${colorMode}.dullGreyBorder`}
        backgroundColor={`${colorMode}.boxThirdBackground`}
      >
        <Box style={styles.contentContainer}>
          <Box style={styles.leftContainer}>
            <Image
              source={require('src/assets/images/person-placeholder-1.jpeg')}
              style={{ width: wp(34), height: wp(34), borderRadius: wp(34) / 2 }}
              borderWidth={1}
              borderColor={`${colorMode}.pantoneGreen`}
            />
          </Box>
          <Box style={styles.rightContainer}>
            <Box style={styles.titleContainer}>
              <Text style={styles.title} color={`${colorMode}.primaryText`} fontSize={16} medium>
                {name}
              </Text>
              <Box style={styles.locationContainer}>
                {isDarkMode ? <MapPinDark /> : <MapPinLight />}
                <Text color={`${colorMode}.GreyText`} fontSize={13}>
                  {location}
                </Text>
              </Box>
            </Box>
            <Box style={styles.expertiseContainer}>
              {expertise.slice(0, 2).map((item, index) => (
                <CardPill
                  key={index}
                  heading={item}
                  backgroundColor={getTagColor(item)}
                  headingColor={`${colorMode}.seashellWhiteText`}
                />
              ))}
              {expertise.length > 2 && (
                <CardPill
                  heading={`+${expertise.length - 2}`}
                  headingColor={`${colorMode}.seashellWhiteText`}
                  backgroundColor={`${colorMode}.brownBackground`}
                  cardStyle={styles.extraExpertiseContainer}
                />
              )}
            </Box>
            <Box style={styles.detailsContainer}>
              {details && (
                <>
                  <DetailItem label="Time zone" value={details.timeZone} />
                  <DetailItem label="Experience" value={details.experience} />
                  <DetailItem label="Language" value={details.language} />
                </>
              )}
            </Box>
          </Box>
        </Box>
        <Box style={styles.CTAContainer}>
          <Buttons
            primaryText={'View Profile'}
            primaryCallback={handleViewProfile}
            RightIcon={isDarkMode ? PersonDark : PersonLight}
            fullWidth
            paddingVertical={hp(10)}
            primaryFontWeight="500"
          />
        </Box>
      </Box>
    </Shadow>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: hp(235),
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: wp(20),
    paddingVertical: hp(19),
  },
  disabledContainer: {
    opacity: 0.6,
  },
  CTAContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: hp(10),
  },
  leftContainer: {
    marginTop: hp(4),
    width: '14%',
    height: '100%',
  },
  rightContainer: {
    width: '86%',
  },
  titleComponentContainer: {
    marginLeft: wp(5),
  },
  titleContainer: {
    width: '97%',
  },
  title: {
    marginBottom: hp(3),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginTop: hp(-3),
  },
  expertiseContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: wp(5),
    marginTop: hp(10),
  },
  extraExpertiseContainer: {
    borderRadius: 21 / 2,
    paddingHorizontal: wp(4),
  },
  detailsContainer: {
    marginTop: hp(10),
    gap: hp(2.5),
  },
  detailItemContainer: {
    flexDirection: 'row',
    gap: wp(5),
    marginBottom: hp(2),
  },
});

export default ExpertCard;
