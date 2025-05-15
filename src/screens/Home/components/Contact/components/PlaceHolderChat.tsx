import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Box, Image, useColorMode } from 'native-base';
import PlaceHolderImage from 'src/assets/images/profile-placeHolder.png';
import PlaceHolderImageWhite from 'src/assets/images/profile-placeholder-white.png';
import { wp } from 'src/constants/responsive';

const PlaceHolderChatItem = () => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  return (
    <Box
      style={styles.profile_container}
      borderColor={`${colorMode}.stoneGrey`}
      backgroundColor={`${colorMode}.primaryBackground`}
    >
      <Box style={styles.profile_image_container}>
        <Image
          source={isDarkMode ? PlaceHolderImageWhite : PlaceHolderImage}
          style={styles.profile_image}
          alt="placeHolder"
        />
        <Box>
          <Box
            style={styles.text}
            width={wp(100)}
            height={wp(13)}
            backgroundColor={`${colorMode}.coolGrey`}
            marginBottom={wp(15)}
          />
          <Box
            style={styles.text}
            width={wp(112)}
            height={wp(7)}
            backgroundColor={`${colorMode}.coolGrey`}
          />
        </Box>
      </Box>
      <Box
        style={styles.edit_icon}
        width={wp(33)}
        height={wp(13)}
        backgroundColor={`${colorMode}.coolGrey`}
      />
    </Box>
  );
};

const PlaceHolderChat = () => {
  const data = [1, 2, 3];

  return <FlatList data={data} renderItem={() => <PlaceHolderChatItem />} />;
};

export default PlaceHolderChat;

const styles = StyleSheet.create({
  profile_container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderRadius: wp(10),
    paddingBottom: wp(18),
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: wp(20),
  },
  text: {
    borderRadius: wp(10),
    opacity: 0.2,
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
    marginTop: wp(5),
    marginRight: wp(10),
    borderRadius: wp(10),
    opacity: 0.3,
  },
});
