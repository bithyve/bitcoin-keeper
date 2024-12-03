import { Box, ScrollView, TextArea, useColorMode } from 'native-base';
import React, { useContext, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import ConciergeHeader from './components/ConciergeHeader';
import ConciergeScreenWrapper from './components/ConciergeScreenWrapper';
import ContentWrapper from '../../components/ContentWrapper';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const TicketDetails = () => {
  const { translations } = useContext(LocalizationContext);
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const textAreaRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ConciergeScreenWrapper backgroundcolor={`${colorMode}.pantoneGreen`} barStyle="light-content">
      <ConciergeHeader title={'Technical Support'} />
      <ContentWrapper backgroundColor={`${colorMode}.primaryBackground`}>
        <Box style={styles.container}>
          <TextArea
            ref={textAreaRef}
            variant={'unstyled'}
            autoCompleteType={'off'}
            placeholderTextColor={`${colorMode}.placeHolderTextColor`}
            placeholder={' Please tell us about your question or the issue you are facing?'}
            color={`${colorMode}.primaryText`}
            fontSize={12}
            h={hp(281)}
          />
        </Box>
      </ContentWrapper>
    </ConciergeScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(25),
    paddingVertical: hp(25),
  },
});

export default TicketDetails;
