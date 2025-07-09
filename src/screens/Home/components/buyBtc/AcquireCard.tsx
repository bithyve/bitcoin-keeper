import React from 'react';
import { Box, useColorMode } from 'native-base';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import { wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import Colors from 'src/theme/Colors';
import { StyleSheet, TouchableOpacity } from 'react-native';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';

interface AcquireCardProps {
  icon?: React.ReactElement;
  circleBackground?: string;
  amount?: any;
  name?: string;
  analysis?: string;
  analysisColor?: string;
  graphContent?: any;
  buyCallback?: () => void;
  sellCallback?: () => void;
}

const AcquireCard: React.FC<AcquireCardProps> = ({
  icon,
  circleBackground,
  amount,
  name,
  analysis,
  analysisColor,
  graphContent = null,
  buyCallback = () => {},
  sellCallback = () => {},
}) => {
  const { colorMode } = useColorMode();
  return (
    <Box
      style={styles.container}
      borderColor={`${colorMode}.separator`}
      backgroundColor={`${colorMode}.textInputBackground`}
    >
      {/* Header */}
      <Box style={styles.header}>
        <CircleIconWrapper width={wp(40)} icon={icon} backgroundColor={circleBackground} />
        <Box>
          <Text fontSize={16} semiBold color={`${colorMode}.AcquireText`}>
            {name}
          </Text>
          <Box style={styles.amountContainer}>
            <Text medium>{amount}</Text>
            <Text fontSize={12} color={analysisColor}>
              {analysis}
            </Text>
          </Box>
        </Box>
      </Box>
      {graphContent ? <Box>{graphContent}</Box> : null}
      {/* footer  */}
      <Box style={styles.footer}>
        <TouchableOpacity
          onPress={() => {
            buyCallback();
          }}
        >
          <Box
            borderColor={`${colorMode}.separator`}
            backgroundColor={`${colorMode}.greybeige`}
            style={styles.button}
          >
            <ThemedSvg name={'acquire_send_arrow'} />
            <Text semiBold color={`${colorMode}.AcquireText`}>
              Buy*
            </Text>
          </Box>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            sellCallback();
          }}
        >
          <Box
            style={styles.button}
            borderColor={`${colorMode}.separator`}
            backgroundColor={`${colorMode}.greybeige`}
          >
            <ThemedSvg name={'acquire_sell_arrow'} />
            <Text semiBold color={`${colorMode}.AcquireText`}>
              Sell*
            </Text>
          </Box>
        </TouchableOpacity>
      </Box>
    </Box>
  );
};

export default AcquireCard;

const styles = StyleSheet.create({
  container: {
    padding: wp(16),
    borderWidth: 1,
    borderRadius: wp(10),
    paddingVertical: wp(20),
  },
  header: {
    flexDirection: 'row',
    gap: wp(10),
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(5),
  },
  footer: {
    flexDirection: 'row',
    gap: wp(15),
    marginTop: wp(20),
  },
  button: {
    flexDirection: 'row',
    gap: wp(10),
    paddingVertical: wp(10),
    paddingHorizontal: wp(20),
    borderRadius: wp(8),
    borderWidth: 1,
    width: wp(135),
    height: wp(50),
    alignItems: 'center',
  },
});
