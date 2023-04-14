import { Box } from 'native-base';
import React, { useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
// hooks, components, data
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { hp, windowWidth } from 'src/common/data/responsiveness/responsive';
import { setWhirlpoolSwiperModal } from 'src/store/reducers/settings';
import { swiperData } from './swiperModalData';
// colors, aserts
import Colors from 'src/theme/Colors';
import SwiperModalIcon from 'src/assets/images/swiper_modal_icon.svg';

const SwiperModalContent = ({ contentTitle, contentSubTitle }) => {
  return (
    <Box style={styles.contentContaner}>
      <Box>
        <Text bold italic style={styles.modalTitle}>
          {contentTitle}
        </Text>
        <Text style={styles.modalSubTitle}>{contentSubTitle}</Text>
      </Box>
    </Box>
  );
};

const renderItem = ({ item }) => {
  return (
    <Box>
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
};

const List = () => {
  const [currentPosition, setCurrentPosition] = useState(0);

  const onViewRef = React.useRef((viewableItems) => {
    setCurrentPosition(viewableItems.changed[0].index);
  });
  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <Box>
      <FlatList
        data={swiperData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        nestedScrollEnabled={true}
        horizontal
        snapToInterval={windowWidth}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
      />
      <Box style={styles.paginationDots}>
        {
          currentPosition === 0 && <>
            <Box style={styles.selectedDot} />
            <Box style={styles.unSelectedDot} />
          </>
        }
      </Box>
    </Box>
  );
};


const SwiperModal = () => {

  const { whirlpoolSwiperModal } = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();

  return (
    <KeeperModal
      visible={whirlpoolSwiperModal}
      close={() => { dispatch(setWhirlpoolSwiperModal(false)) }}
      title="Some Definitions:"
      modalBackground={['light.gradientStart', 'light.gradientEnd']}
      textColor="light.white"
      Content={() => {
        return <List />;
      }}
      DarkCloseIcon
      learnMore
    />
  );
}

const styles = StyleSheet.create({
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 6
  },
  selectedDot: {
    width: 25,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#E3BE96',
    marginEnd: 5,
  },
  unSelectedDot: {
    width: 6,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#89AEA7',
    marginEnd: 5,
  },
  contentContaner: {
    width: hp(290),
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
    color: Colors.White,
  },
  modalSubTitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'left',
    letterSpacing: 0.65,
    color: Colors.White,
    marginBottom: hp(15),
    maxWidth: hp(270),
  },
});

export default SwiperModal
