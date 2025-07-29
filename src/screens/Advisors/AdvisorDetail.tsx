import React, { useContext, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AdvisorProfileHeader from './component/AdvisorProfileHeader';
import { wp } from 'src/constants/responsive';
import { Box, ScrollView, useColorMode } from 'native-base';
import MapPin from 'src/assets/images/MapPinIcon.svg';
import Colors from 'src/theme/Colors';
import Text from 'src/components/KeeperText';
import KeeperModal from 'src/components/KeeperModal';
import openLink from 'src/utils/OpenLink';
import Buttons from 'src/components/Buttons';
import sha256 from 'crypto-js/sha256';
import ConnectAdvisor from 'src/assets/images/connect-advisor.svg';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const getColorForLabel = (label: string, colorsArray: string[]) => {
  const hash = sha256(label).toString();
  const hashNum = parseInt(hash.slice(0, 8), 16);
  return colorsArray[hashNum % colorsArray.length];
};

function DetailCard({ title, desc, isLast }) {
  const { colorMode } = useColorMode();
  return (
    <Box
      style={[
        styles.detailBox,
        isLast && { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
      ]}
      borderBottomColor={`${colorMode}.separator`}
    >
      <Box style={styles.detailColumnLeft}>
        <Text fontSize={12} color={`${colorMode}.primaryText`}>
          {title}
        </Text>
      </Box>
      <Box style={styles.detailColumnRight}>
        <Text fontSize={12} color={`${colorMode}.primaryText`}>
          {desc}
        </Text>
      </Box>
    </Box>
  );
}

const AdvisorDetail = ({ route }) => {
  const { advisor } = route.params;
  const { colorMode } = useColorMode();
  const [showModal, setShowModal] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { concierge } = translations;
  const previewLength = 150;
  const isLong = advisor.description.length > previewLength;
  const previewText = isLong
    ? `${advisor.description.slice(0, previewLength)}...`
    : advisor.description;

  const viewAll_color = ThemedColor({ name: 'viewAll_color' });

  function ExpertiesPill({ name }: { name: string }) {
    const tagColors = Object.entries(Colors)
      .filter(([key]) => key.startsWith('TagLight'))
      .map(([, value]) => value);

    const backgroundColor = getColorForLabel(name, tagColors);

    return (
      <Box style={styles.pill} backgroundColor={backgroundColor}>
        <Text color={Colors.WarmIvory} fontSize={11}>
          {name}
        </Text>
      </Box>
    );
  }

  const ADVISOR_DETAILS = [
    { title: concierge.timeZone, key: 'timezone' },
    { title: concierge.Experience, key: 'experience' },
    { title: concierge.language, key: 'languages' },
    { title: concierge.sessionDuration, key: 'duration' },
  ];
  return (
    <Box flex={1} backgroundColor={`${colorMode}.primaryBackground`}>
      <AdvisorProfileHeader advisorImage={advisor.image} />

      <ScrollView flex={1} style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text fontSize={18} medium>
            {advisor.title}
          </Text>
          <Box style={styles.pinContainer}>
            <MapPin />
            <Text fontSize={13} color={Colors.lightGrayBeige}>
              {advisor.country}
            </Text>
          </Box>

          <Box style={styles.pillsScrollWrapper}>
            <Box style={styles.PillsContainer}>
              {advisor?.expertise?.map((item, index) => (
                <ExpertiesPill key={index} name={item} />
              ))}
            </Box>
          </Box>

          <Box style={styles.advisorContainer}>
            <Text fontSize={14} semiBold color={`${colorMode}.primaryText`}>
              {concierge.advisorDetail}:
            </Text>
            <Text fontSize={12} color={`${colorMode}.primaryText`}>
              {previewText}
              {isLong && (
                <Text color={viewAll_color} bold onPress={() => setShowModal(true)}>
                  {' '}
                  {concierge.readMore}
                </Text>
              )}
            </Text>
          </Box>

          <Box style={styles.advisorContainer}>
            <Text fontSize={14} semiBold color={`${colorMode}.primaryText`}>
              {concierge.advisorDetails}
            </Text>
            <Box
              style={styles.detailsContainer}
              borderColor={`${colorMode}.separator`}
              backgroundColor={`${colorMode}.textInputBackground`}
            >
              {ADVISOR_DETAILS.map((item, index) => {
                const desc =
                  item.key === 'languages' ? advisor.languages.join(', ') : advisor[item.key];
                return (
                  <DetailCard
                    key={item.title}
                    title={item.title}
                    desc={desc}
                    isLast={index === ADVISOR_DETAILS.length - 1}
                  />
                );
              })}
            </Box>
          </Box>
        </View>
      </ScrollView>
      <Box style={styles.fixedButtonContainer}>
        <Buttons
          primaryText={concierge.scheduleCall}
          primaryCallback={() => openLink(advisor.link)}
          fullWidth
          RightIcon={ConnectAdvisor}
        />
      </Box>

      <KeeperModal
        visible={showModal}
        close={() => setShowModal(false)}
        title={advisor.title}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <Box style={styles.modalContent}>
            <Text fontSize={12} color={`${colorMode}.primaryText`}>
              {advisor.description}
            </Text>
          </Box>
        )}
        buttonText={concierge.scheduleCall}
        buttonCallback={() => {
          setShowModal(false);
          openLink(advisor.link);
        }}
      />
    </Box>
  );
};

export default AdvisorDetail;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(22),
  },
  scrollContent: {
    marginTop: wp(65),
    marginBottom: wp(100),
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
  advisorContainer: {
    gap: wp(6),
    marginBottom: wp(20),
    marginTop: wp(10),
  },
  modalContent: {
    marginTop: wp(-10),
  },
  detailsContainer: {
    paddingHorizontal: wp(10),
    paddingVertical: wp(18),
    borderWidth: 1,
    borderRadius: 10,
    marginTop: wp(8),
  },
  detailBox: {
    flexDirection: 'row',
    paddingBottom: wp(10),
    marginBottom: wp(10),
    borderBottomWidth: 1,
  },
  detailColumnLeft: {
    flex: 1,
    paddingRight: wp(50),
    paddingLeft: wp(15),
    justifyContent: 'center',
  },
  detailColumnRight: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: wp(20),
    left: wp(20),
    right: wp(20),
    marginBottom: wp(10),
  },
});
