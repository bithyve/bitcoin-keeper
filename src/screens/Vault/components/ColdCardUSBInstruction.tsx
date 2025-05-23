import React, { useContext } from 'react';
import { Box, useColorMode, VStack } from 'native-base';
import { StyleSheet } from 'react-native';
import openLink from 'src/utils/OpenLink';
import { KEEPER_WEBSITE_BASE_URL } from 'src/utils/service-utilities/config';
import Text from 'src/components/KeeperText';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const ColdCardUSBInstruction = () => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { coldcard } = translations;
  const steps = [
    <Text>
      {coldcard.downloadKeepr}{' '}
      <Text
        color={`${colorMode}.greenWhiteText`}
        bold
        onPress={() => openLink(`${KEEPER_WEBSITE_BASE_URL}/desktop`)}
        style={styles.link}
      >
        {coldcard.desktopApp}
      </Text>
    </Text>,
    coldcard.scanQRonDesktop,
    coldcard.followInstructions,
  ];

  return (
    <Box backgroundColor={`${colorMode}.dullGrey`}>
      <Text medium style={{ marginBottom: 20 }}>
        {coldcard.followThisStep}
      </Text>
      <VStack space={4}>
        {steps.map((step, index) => (
          <Box key={index} style={styles.stepContainer}>
            <Box style={styles.circle} backgroundColor={`${colorMode}.pantoneGreen`}>
              <Text bold fontSize={11} color={`${colorMode}.buttonText`}>
                {index + 1}
              </Text>
            </Box>

            <Text>{step}</Text>

            {index < steps.length - 1 && (
              <Box style={styles.line} backgroundColor={`${colorMode}.pantoneGreen`} />
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    marginBottom: 10,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  line: {
    position: 'absolute',
    left: 10,
    top: 20,
    width: 1,
    height: 40,
  },
  link: {
    textDecorationLine: 'underline',
  },
});

export default ColdCardUSBInstruction;
