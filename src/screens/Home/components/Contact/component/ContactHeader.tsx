import { Box, Image, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import PlaceHolderImage from 'src/assets/images/contact-placeholder-image.png';
import EditIcon from 'src/assets/images/contact-edit.svg';
import { wp } from 'src/constants/responsive';

type Props = {};

const ContactHeader = (props: Props) => {
  const { colorMode } = useColorMode();
  const userProfileImage = '';
  const userProfileName = '';
  return (
    <Box style={styles.header}>
      <Box
        style={styles.profile_container}
        borderColor={`${colorMode}.separator`}
        backgroundColor={`${colorMode}.textInputBackground`}
      >
        <Box style={styles.profile_image_container}>
          {userProfileImage ? (
            <Image
              source={{ uri: userProfileImage }}
              alt="profileImage"
              style={styles.profile_image}
              resizeMode="cover"
            />
          ) : (
            <Image source={PlaceHolderImage} style={styles.profile_image} alt="placeHolder" />
          )}
          <Box>
            <Text style={styles.text} color={`${colorMode}.modalSubtitleBlack`} semiBold>
              {userProfileName || 'Name'}
            </Text>
            <Text fontSize={12} color={`${colorMode}.secondaryText`}>
              For easy identification 
            </Text>
          </Box>
        </Box>
        <TouchableOpacity onPress={() => {}} style={styles.edit_icon}>
          <EditIcon />
        </TouchableOpacity>
      </Box>
      <TouchableOpacity onPress={() => {}}>
        <Box
          style={styles.share_icon}
          borderColor={`${colorMode}.separator`}
          backgroundColor={`${colorMode}.textInputBackground`}
        >
          <ThemedSvg name={'share_icons'} />
          <Text fontSize={12} color={`${colorMode}.modalSubtitleBlack`} medium>
            Share
          </Text>
        </Box>
      </TouchableOpacity>
    </Box>
  );
};

export default ContactHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: wp(20),
  },
  profile_container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: wp(10),
    padding: wp(15),
    justifyContent: 'space-between',
    width: wp(248),
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
  },
  profile_image_container: {
    flexDirection: 'row',
    gap: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  profile_image: {
    width: wp(47),
    height: wp(47),
    borderRadius: wp(75),
  },
  edit_icon: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: wp(5),

    width: wp(40),
  },
  share_icon: {
    width: wp(73),
    padding: wp(18),
    borderWidth: 1,
    borderRadius: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(5),
  },
});
