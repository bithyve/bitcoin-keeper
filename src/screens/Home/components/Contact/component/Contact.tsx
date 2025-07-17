import { Box, ScrollView, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import { wp } from 'src/constants/responsive';
import ContactHeader from './ContactHeader';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import ConciergeIcon from 'src/assets/images/faqWhiteIcon.svg';
import Colors from 'src/theme/Colors';
import PinIcon from 'src/assets/images/Pin.svg';
import ChatList from './ChatList';
import Buttons from 'src/components/Buttons';
import ContactAddicon from 'src/assets/images/contact-add-icon.svg';

const Contact = () => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  return (
    <Box style={styles.container}>
      <ContactHeader />
      <Box style={styles.chat_heading}>
        <Text color={`${colorMode}.modalSubtitleBlack`} medium fontSize={16}>
          Recent Chats
        </Text>
      </Box>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box style={styles.concierge_container} borderColor={`${colorMode}.separator`}>
          <TouchableOpacity style={styles.concierge} onPress={() => {}}>
            <Box style={styles.concierge_icon}>
              <CircleIconWrapper
                width={wp(45)}
                icon={<ConciergeIcon width={wp(22)} height={wp(22)} />}
                backgroundColor={`${colorMode}.pantoneGreen`}
              />
              <Box style={styles.concierge_text}>
                <Text color={`${colorMode}.modalSubtitleBlack`} semiBold fontSize={14}>
                  Keeper Support
                </Text>
                <Text fontSize={13} color={isDarkMode ? Colors.bodyText : Colors.primaryBrown}>
                  We're here to help.
                </Text>
              </Box>
            </Box>
            <Box style={styles.pinContainer}>
              <Text fontSize={13} color={isDarkMode ? Colors.bodyText : Colors.primaryBrown}>
                10:45 AM
              </Text>
              <PinIcon />
            </Box>
          </TouchableOpacity>
        </Box>
        <ChatList userProfileImage="" />
      </ScrollView>
      <Box style={styles.bottomButton}>
        <Buttons
          primaryText="Add Contact"
          primaryCallback={() => {}}
          fullWidth
          LeftIcon={ContactAddicon}
        />
      </Box>
    </Box>
  );
};

export default Contact;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(20),
  },

  chat_heading: {
    marginBottom: wp(20),
  },
  concierge_container: {
    marginBottom: wp(20),
    borderBottomWidth: 1,
    paddingBottom: wp(20),
  },
  concierge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  concierge_icon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(10),
  },
  concierge_text: {
    gap: wp(6),
  },
  pinContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(6),
  },
  bottomButton: {
    marginVertical: wp(20),
  },
});
