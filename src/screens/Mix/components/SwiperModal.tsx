import { Box, Pressable, useColorMode } from 'native-base';
import React, { useRef, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';
import openLink from 'src/utils/OpenLink';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { hp, windowWidth, wp, windowHeight } from 'src/constants/responsive';
import { setWhirlpoolSwiperModal } from 'src/store/reducers/settings';
import SwiperModalIcon from 'src/assets/images/swiper_modal_icon.svg';
import CloseGreen from 'src/assets/images/modal_close_green.svg';
import { KEEPER_KNOWLEDGEBASE } from 'src/utils/service-utilities/config';
import { swiperData } from '../swiperModalData';

function SwiperModalContent({ contentTitle, contentSubTitle }) {
  const { colorMode } = useColorMode();
  return (
    <Box>
      <Box>
        <Text bold italic style={styles.modalTitle} color={`${colorMode}.headerWhite`}>
          {contentTitle}
        </Text>
        <Text style={styles.modalSubTitle} color={`${colorMode}.headerWhite`}>
          {contentSubTitle}
        </Text>
      </Box>
    </Box>
  );
}

const RenderItem = ({ item, currentPosition }) => (
  <Box style={{ width: windowHeight < 650 ? wp(286) : currentPosition == 0 ? wp(310) : wp(300) }}>
    <SwiperModalContent
      contentTitle={item.firstContentHeading.contentTitle}
      contentSubTitle={item.firstContentHeading.contentSubTitle}
    />
    <SwiperModalContent
      contentTitle={item.secondContentHeading.contentTitle}
      contentSubTitle={item.secondContentHeading.contentSubTitle}
    />
    <Box style={styles.swiperModalIcon}>
      <SwiperModalIcon />
    </Box>
    <SwiperModalContent
      contentTitle={item.firstContentFooter.contentTitle}
      contentSubTitle={item.firstContentFooter.contentSubTitle}
    />
    <SwiperModalContent
      contentTitle={item.secondContentFooter.contentTitle}
      contentSubTitle={item.secondContentFooter.contentSubTitle}
    />
  </Box>
);

function List() {
  const { colorMode } = useColorMode();
  const listRef = useRef(null);
  const dispatch = useAppDispatch();
  const [currentPosition, setCurrentPosition] = useState(0);

  const onViewRef = React.useRef((viewableItems) => {
    setCurrentPosition(viewableItems.changed[0].index);
    // closeRef.current = viewableItems.changed[0].index !== 0
  });
  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 });

  const pressNext = () => {
    listRef.current.scrollToEnd({ animated: true });
  };

  return (
    <Box>
      {currentPosition !== 0 ? (
        <TouchableOpacity
          style={styles.close}
          onPress={() => dispatch(setWhirlpoolSwiperModal(false))}
        >
          <CloseGreen />
        </TouchableOpacity>
      ) : null}
      <Box style={styles.headerContainer}>
        <Text style={styles.title} color={`${colorMode}.headerWhite`}>
          Some Definitions:
        </Text>
      </Box>
      <FlatList
        ref={listRef}
        data={swiperData}
        renderItem={({ item }) => <RenderItem item={item} currentPosition={currentPosition} />}
        keyExtractor={(item) => item.id}
        nestedScrollEnabled
        horizontal
        snapToInterval={windowWidth}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
      />
      <Box style={styles.ctaWrapper}>
        <Box
          borderColor={`${colorMode}.lightAccent`}
          backgroundColor={`${colorMode}.modalGreenLearnMore`}
          style={styles.learnMoreContainer}
        >
          <Pressable
            onPress={() => {
              openLink(`${KEEPER_KNOWLEDGEBASE}sections/17237989295773-Whirlpool`);
            }}
          >
            <Text color={`${colorMode}.lightAccent`} style={styles.seeFAQs} bold>
              See FAQs
            </Text>
          </Pressable>
        </Box>
        <Box>
          <TouchableOpacity
            onPress={() =>
              currentPosition === 0 ? pressNext() : dispatch(setWhirlpoolSwiperModal(false))
            }
            testID={`${currentPosition === 0 ? 'next' : 'proceed'}`}
          >
            <Box backgroundColor={`${colorMode}.modalWhiteButton`} style={styles.cta}>
              <Text style={styles.ctaText} color={`${colorMode}.textGreen`} bold>
                {currentPosition === 0 ? 'Next' : 'Proceed'}
              </Text>
            </Box>
          </TouchableOpacity>
        </Box>
      </Box>
    </Box>
  );
}

function SwiperModal({ enable }) {
  const { colorMode } = useColorMode();
  const { whirlpoolSwiperModal } = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();
  return (
    <KeeperModal
      visible={enable && whirlpoolSwiperModal}
      close={() => {
        dispatch(setWhirlpoolSwiperModal(false));
      }}
      title=""
      modalBackground={`${colorMode}.pantoneGreen`}
      textColor={`${colorMode}.headerWhite`}
      Content={() => <List />}
      showCloseIcon={false}
    />
  );
}
const styles = StyleSheet.create({
  contentContaner: {
    width: windowHeight < 650 ? wp(286) : wp(295),
  },
  swiperModalIcon: {
    alignSelf: 'center',
    marginTop: hp(-15),
    marginBottom: hp(8),
  },
  modalTitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'left',
    letterSpacing: 0.65,
  },
  modalSubTitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'left',
    letterSpacing: 0.65,
    marginBottom: hp(15),
    maxWidth: wp(270),
  },
  seeFAQs: {
    fontSize: 13,
  },
  learnMoreContainer: {
    borderRadius: hp(40),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: hp(34),
    width: wp(110),
  },
  ctaWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cta: {
    borderRadius: 10,
    width: wp(110),
    height: hp(45),
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 13,
    letterSpacing: 1,
  },
  headerContainer: {
    alignSelf: 'flex-start',
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
    width: '90%',
  },
  title: {
    fontSize: 19,
    letterSpacing: 1,
    marginVertical: 20,
  },
  close: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

export default SwiperModal;
