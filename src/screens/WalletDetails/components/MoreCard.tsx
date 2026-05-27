import React from 'react';
import { Box } from '@gluestack-ui/themed-native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useColorMode } from '@gluestack-ui/themed-native-base';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import Colors from 'src/theme/Colors';

type Props = {
  Icon?: React.ReactNode;
  title?: string;
  callBack?: () => void;
  showDot?: boolean;
};

const MoreCard = ({ Icon, title, callBack, showDot = false }: Props) => {
  const { colorMode } = useColorMode();

  return (
    <TouchableOpacity onPress={callBack}>
      <Box
        style={styles.cardContainer}
        borderColor={`${colorMode}.separator`}
        backgroundColor={`${colorMode}.primaryBackground`}
      >
        <Box style={styles.infoContainer}>
          <View>
            <CircleIconWrapper width={40} icon={Icon} backgroundColor={`${colorMode}.pantoneGreen`} />
            {showDot && <View style={styles.dot} />}
          </View>
          <Text medium style={styles.cardName} color={`${colorMode}.primaryText`} numberOfLines={1}>
            {title}
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default MoreCard;

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardName: {
    marginLeft: 10,
    fontSize: 14,
  },
  dot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.CrimsonRed,
    borderWidth: 1,
    borderColor: 'white',
  },
});
