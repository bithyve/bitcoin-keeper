import { Box, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import { wp } from 'src/constants/responsive';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import SignerContent from './SignerContent';
import { useNavigation } from '@react-navigation/native';
import SignerList from './SignerList';

const ManageKeys = () => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const { translations } = useContext(LocalizationContext);
  const { vault } = translations;
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);

  const handleModalOpen = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  return (
    <Box style={styles.containerWrapper}>
      <Box style={styles.contentContainer}>
        <SignerList navigation={navigation} handleModalOpen={handleModalOpen} />
      </Box>
      <KeeperModal
        visible={modalVisible}
        close={handleModalClose}
        title={vault.Addsigner}
        subTitle={vault.SelectSignerSubtitle}
        modalBackground={`${colorMode}.textInputBackground`}
        textColor={`${colorMode}.pantoneGreen`}
        subTitleColor={`${colorMode}.black`}
        DarkCloseIcon={isDarkMode}
        Content={() => (
          <SignerContent navigation={navigation} handleModalClose={handleModalClose} />
        )}
      />
    </Box>
  );
};

export default ManageKeys;

const styles = StyleSheet.create({
  containerWrapper: {
    paddingHorizontal: wp(5),
  },
  contentContainer: {
    flexDirection: 'row',
  },
});
