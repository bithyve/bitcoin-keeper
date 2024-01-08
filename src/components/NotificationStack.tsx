import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
const { width } = Dimensions.get('window');
import {
  Directions,
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import Text from './KeeperText';
import { Box, ColorMode, useColorMode } from 'native-base';
import { useContext, useState } from 'react';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import CustomGreenButton from './CustomButton/CustomGreenButton';

const data = [
  { id: 1, title: 'Card 1', content: 'Content for Card 1' },
  { id: 2, title: 'Card 2', content: 'Content for Card 2' },
  { id: 3, title: 'Card 3', content: 'Content for Card 3' },
  { id: 4, title: 'Card 4', content: 'Content for Card 4' },
  { id: 5, title: 'Card 5', content: 'Content for Card 5' },
];

const _size = width * 0.9;
const layout = {
  borderRadius: 16,
  width: _size,
  height: 90,
  spacing: 12,
  cardsGap: 10,
};
const maxVisibleItems = 3;

type CardProps = {
  totalLength: number;
  index: number;
  info: (typeof data)[0];
  activeIndex: SharedValue<number>;
  removeCard: () => void;
};

function Card({ info, index, totalLength, activeIndex, removeCard }: CardProps) {
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { colorMode } = useColorMode();
  const styles = getStyles(colorMode);

  const animations = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      zIndex: totalLength - index,
      opacity: interpolate(
        activeIndex.value,
        [index - 1, index, index + 1],
        [1 - 1 / maxVisibleItems, 1, 1]
      ),
      transform: [
        {
          translateY: interpolate(
            activeIndex.value,
            [index - 1, index, index + 1],
            [layout.cardsGap, 0, layout.height + layout.cardsGap]
          ),
        },
        {
          scale: interpolate(activeIndex.value, [index - 1, index, index + 1], [0.96, 1, 1]),
        },
      ],
    };
  });

  return (
    <Animated.View style={[animations]}>
      <Box style={styles.card} backgroundColor={`${colorMode}.seashellWhite`}>
        <Text color={`${colorMode}.RussetBrown`} style={styles.title}>
          {info.title}
        </Text>
        <Box style={styles.contentContainer}>
          <Text color={`${colorMode}.GreenishGrey`} style={styles.content} numberOfLines={1}>
            {info.content}
          </Text>
          <Box style={styles.buttonContainer}>
            <TouchableOpacity style={{ alignSelf: 'center' }} onPress={removeCard}>
              <Text color={`${colorMode}.RussetBrown`} style={styles.skip}>
                SKIP
              </Text>
            </TouchableOpacity>
            <Box>
              <CustomGreenButton value={common['action']} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Animated.View>
  );
}

export default function NotificationStack() {
  const { colorMode } = useColorMode();
  const styles = getStyles(colorMode);

  const [notifications, setNotifications] = useState(data);
  const activeIndex = useSharedValue(0);

  const removeCard = () => {
    setNotifications(notifications.slice(1));
  };

  const flingUp = Gesture.Fling()
    .direction(Directions.UP)
    .onStart(() => {
      runOnJS(removeCard)();
    });

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={Gesture.Exclusive(flingUp)}>
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            justifyContent: 'flex-end',
            marginBottom: layout.cardsGap * 2,
          }}
          pointerEvents="box-none"
        >
          {notifications.map((c, index) => {
            return (
              <Card
                info={c}
                key={c.id}
                index={index}
                totalLength={notifications.length - 1}
                activeIndex={activeIndex}
                removeCard={removeCard}
              />
            );
          })}
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const getStyles = (colorMode: ColorMode) =>
  StyleSheet.create({
    container: {
      position: 'relative',
    },
    card: {
      borderRadius: layout.borderRadius,
      width: layout.width,
      height: layout.height,
      padding: 10,
      shadowColor: `${colorMode}.Greige`,
      shadowRadius: 10,
      shadowOpacity: 1,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      elevation: 5,
    },
    title: {
      fontSize: 12,
      fontWeight: '600',
    },
    content: {
      fontSize: 14,
      fontWeight: '600',
      width: '50%',
    },
    contentContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    skip: {
      fontSize: 12,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 20,
    },
  });
