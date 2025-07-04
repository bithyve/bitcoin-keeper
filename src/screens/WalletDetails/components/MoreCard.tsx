import React from 'react';
import { Box } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useColorMode } from 'native-base';
import CircleIconWrapper from 'src/components/CircleIconWrapper';

type Props = {
  Icon?: React.ReactNode;
  title?: string;
  callBack?: () => void;
};

const MoreCard = ({ Icon, title, callBack }: Props) => {
  const { colorMode } = useColorMode();

  return (
    <TouchableOpacity onPress={callBack}>
      <Box
        style={styles.cardContainer}
        borderColor={`${colorMode}.separator`}
        backgroundColor={`${colorMode}.primaryBackground`}
      >
        <Box style={styles.infoContainer}>
          <CircleIconWrapper width={40} icon={Icon} backgroundColor={`${colorMode}.pantoneGreen`} />
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
});
