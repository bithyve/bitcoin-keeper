import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import BackLightButton from 'src/assets/images/back-white.svg';
import BackDarkButton from 'src/assets/images/back-secondary-white.svg';
import Text from 'src/components/KeeperText';
import { hp, windowHeight, wp } from 'src/constants/responsive';

type ConciergeHeaderProps = {
  title?: string;
  onPressHandler?: () => void;
  enableBack?: boolean;
  rightComponent?: Element;
};

const BackButton = ({ onPress }: { onPress: () => void }) => {
  const { colorMode } = useColorMode();
  const Icon = colorMode === 'light' ? BackLightButton : BackDarkButton;

  return (
    <TouchableOpacity onPress={onPress} style={styles.backButton}>
      <Icon />
    </TouchableOpacity>
  );
};

const ConciergeHeader = ({ title, onPressHandler, rightComponent }: ConciergeHeaderProps) => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();

  return (
    <Box style={styles.container}>
      <Box style={styles.header}>
        <BackButton onPress={onPressHandler || navigation.goBack} />
        {title && (
          <Text style={styles.title} color={`${colorMode}.seashellWhiteText`}>
            {title}
          </Text>
        )}
      </Box>
      {rightComponent && <Box style={styles.rightComponentContainer}>{rightComponent}</Box>}
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingLeft: wp(12),
    paddingTop: windowHeight > 680 ? hp(15) : hp(7),
    paddingBottom: hp(10),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  backButton: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
  },
  rightComponentContainer: {},
});

export default ConciergeHeader;
