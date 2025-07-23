import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import Text from 'src/components/KeeperText';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import AskQuestionIcon from 'src/assets/images/ask-question.svg';
import HireAdvisorIcon from 'src/assets/images/hire-advisor.svg';
import TakeMeThereIcon from 'src/assets/images/take-me-there.svg';
import ConnectAdvisor from 'src/assets/images/connect-advisor.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';

type ConciergeItem = {
  title: string;
  subtitle: string;
  iconName: any;
  buttonText: string;
  callback: () => void;
  buttonIcon?: any;
};

const ConciergeComponent = () => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { concierge: conciergeText } = translations;

  const conciergeData: ConciergeItem[] = [
    {
      title: conciergeText.askQuestion,
      subtitle: conciergeText.submitTicket,
      iconName: <AskQuestionIcon />,
      buttonText: conciergeText.takeMeThere,
      callback: () => {},
      buttonIcon: TakeMeThereIcon,
    },
    {
      title: conciergeText.hireAdvisor,
      subtitle: conciergeText.whiteGlovedService,
      iconName: <HireAdvisorIcon />,
      buttonText: conciergeText.connetWithAdvisor,
      callback: () => {},
      buttonIcon: ConnectAdvisor,
    },
  ];

  return (
    <Box style={styles.container}>
      {conciergeData.map((item, index) => (
        <Box
          key={index}
          style={styles.Card}
          backgroundColor={`${colorMode}.seashellWhite`}
          borderColor={`${colorMode}.separator`}
        >
          <Box style={styles.iconContainer}>
            <CircleIconWrapper
              width={wp(35)}
              icon={item.iconName}
              backgroundColor={`${colorMode}.separator`}
            />
            <Box style={styles.textContainer}>
              <Text fontSize={15} medium color={`${colorMode}.primaryText`}>
                {item.title}
              </Text>
              <Text fontSize={12} color={`${colorMode}.primaryText`}>
                {item.subtitle}
              </Text>
            </Box>
          </Box>
          <Box>
            <Buttons
              primaryText={item.buttonText}
              primaryCallback={item.callback}
              fullWidth
              RightIcon={item.buttonIcon}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default ConciergeComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(22),
    paddingVertical: hp(10),
  },
  Card: {
    width: windowWidth * 0.88,
    borderWidth: 1,
    padding: wp(20),
    gap: 10,
    borderRadius: 10,
    marginBottom: hp(20),
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: hp(10),
  },
  textContainer: {
    width: wp(220),
    gap: 5,
  },
});
