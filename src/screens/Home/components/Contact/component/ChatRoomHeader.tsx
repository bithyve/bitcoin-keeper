import { useNavigation } from '@react-navigation/native';
import { Box, Image, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import ChatPlaceHolderIcon from 'src/assets/images/contact-placeholder-image.png';
import { StatusBar } from 'react-native';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';

const ChatRoomHeader = ({ receiverProfileImage, receiverProfileName, setOpenEditModal }) => {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();

  return (
    <Box backgroundColor={`${colorMode}.primaryBackground`} style={styles.container}>
      <StatusBar barStyle={colorMode === 'dark' ? 'light-content' : 'dark-content'} />
      <Box
        backgroundColor={`${colorMode}.primaryBackground`}
        style={styles.wrapper}
        borderBottomColor={`${colorMode}.separator`}
      >
        <Box style={styles.WrapperContainer}>
          <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
            <ThemedSvg name={'back_Button'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profile_image_container}
            onPress={() => setOpenEditModal(true)}
          >
            <Box>
              {receiverProfileImage ? (
                <Image
                  source={{ uri: receiverProfileImage }}
                  alt="profileImage"
                  style={styles.profile_image}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={ChatPlaceHolderIcon}
                  style={styles.profile_image}
                  alt="placeHolder"
                />
              )}
            </Box>

            <Box>
              <Text color={`${colorMode}.primaryText`} semiBold style={styles.text}>
                {receiverProfileName}
              </Text>
            </Box>
          </TouchableOpacity>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatRoomHeader;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: wp(15),
  },
  backButton: {
    height: hp(44),
    width: wp(44),
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    paddingHorizontal: wp(5),
    height: hp(127),
    width: '100%',
    justifyContent: 'flex-end',
    position: 'relative',
    borderBottomWidth: 1,
  },
  WrapperContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: hp(24),
  },
  profile_image_container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profile_image: {
    width: wp(47),
    height: wp(47),
    borderRadius: wp(75),
  },
  text: {
    fontSize: wp(18),
    lineHeight: 26,
    fontFamily: 'Lora-Medium',
    marginLeft: wp(14),
    marginRight: wp(5),
  },
});
