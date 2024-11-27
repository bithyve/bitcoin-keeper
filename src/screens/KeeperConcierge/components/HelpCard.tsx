import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';

interface HelpCardProps {
  title?: string;
  description?: string;
  LeftComponent?: Element;
  buttonText?: string;
  buttonIcon?: Element;
  buttonBackground?: string;
  buttonCallback?: () => void;
  titleComponent?: Element;
  titleComonentStyle?: any;
  disabled?: boolean;
}

const HelpCard: React.FC<HelpCardProps> = ({
  title = '',
  description = '',
  LeftComponent = null,
  buttonText = '',
  buttonIcon = null,
  buttonBackground = null,
  buttonCallback = () => {},
  titleComponent = null,
  titleComonentStyle = null,
  disabled = false,
}) => {
  const { colorMode } = useColorMode();

  return (
    <Box
      style={[styles.container, disabled && styles.disabledContainer]}
      borderColor={`${colorMode}.dullGreyBorder`}
      backgroundColor={`${colorMode}.secondaryBackground`}
    >
      <Box style={styles.contentContainer}>
        <Box style={styles.leftContainer}>{LeftComponent && LeftComponent}</Box>
        <Box style={styles.rightContainer}>
          <Box style={[styles.titleContainer, titleComonentStyle]}>
            <Text style={styles.title} color={`${colorMode}.primaryText`} fontSize={15} medium>
              {title}
            </Text>
            <Box style={[styles.titleComponentContainer]}>{titleComponent}</Box>
          </Box>
          <Text color={`${colorMode}.secondaryText`} fontSize={12}>
            {description}
          </Text>
        </Box>
      </Box>
      <Box style={styles.CTAContainer}>
        <Buttons
          primaryText={buttonText}
          primaryBackgroundColor={buttonBackground}
          fullWidth
          paddingVertical={hp(10)}
          RightIcon={buttonIcon}
          primaryCallback={buttonCallback}
          borderRadius={12}
          primaryFontWeight="500"
          disableNoOverlay={disabled}
        />
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minHeight: hp(156),
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: wp(12),
    paddingVertical: hp(19),
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  disabledContainer: {
    opacity: 0.6,
  },
  CTAContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: hp(10),
  },
  leftContainer: {
    marginTop: hp(4),
    width: '16%',
    height: '100%',
  },
  rightContainer: {
    width: '84%',
  },
  titleComponentContainer: {
    marginLeft: wp(5),
  },
  titleContainer: {
    flexDirection: 'row',
    width: '97%',
  },
  title: {
    marginBottom: hp(3),
  },
});

export default HelpCard;
