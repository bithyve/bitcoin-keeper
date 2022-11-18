import React, { useEffect, useState } from 'react';
import { Box, Modal, Text } from 'native-base';
import { Platform, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import Close from 'src/assets/icons/modal_close.svg';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import Colors from 'src/theme/Colors';
import GoogleDrive from 'src/assets/images/drive.svg';
import ICloud from 'src/assets/images/icloud.svg';
import moment from 'moment';

const ListItem = ({ item, onPress }) => {
  const IconName = Platform.OS == 'ios' ? <ICloud /> : <GoogleDrive />;
  return (
    <TouchableOpacity onPress={onPress}>
      <Box flexDirection="row">
        {IconName}
        <Box marginY={2}>
          <Text color={'#4F5955'} marginLeft={2} marginTop={1}>
            {`App ID: ${item.appID}`}
          </Text>
          <Text fontSize={12} color={'#4F5955'}>
            {moment(item.dateTime).format('DD MMM YYYY, hh:mmA')}
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

const CloudRecoveryModal = (props) => {
  const {
    visible,
    close,
    title = 'Title',
    subTitle = null,
    modalBackground = ['#F7F2EC', '#F7F2EC'],
    buttonBackground = ['#00836A', '#073E39'],
    buttonText = null,
    buttonTextColor = 'white',
    buttonCallback = props.close || null,
    textColor = '#000',
    onPressNext,
  } = props;
  const { bottom } = useSafeAreaInsets();
  const { downloadingBackup, cloudData, isBackupError, backupError } = useAppSelector(
    (state) => state.bhr
  );
  const [selected, setSelected] = useState(null);
  const bottomMargin = Platform.select<string | number>({ ios: bottom, android: '5%' });
  const { showToast } = useToastMessage();

  useEffect(() => {
    if (isBackupError) {
      close();
      showToast(backupError);
    }
  }, [downloadingBackup, isBackupError]);

  const next = () => {
    if (selected !== null) {
      onPressNext(selected);
    }
  };

  return (
    <Modal
      isOpen={visible}
      onClose={close}
      avoidKeyboard
      size="xl"
      _backdrop={{ bg: '#000', opacity: 0.8 }}
      justifyContent={'flex-end'}
    >
      <Modal.Content borderRadius={10} marginBottom={bottomMargin}>
        {downloadingBackup ? (
          <ActivityIndicator
            size={'large'}
            color={Colors.primary}
            style={{ height: '70%', alignSelf: 'center' }}
          />
        ) : (
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={modalBackground}
            style={styles.container}
          >
            <TouchableOpacity style={styles.close} onPress={close}>
              <Close />
            </TouchableOpacity>
            <Modal.Header
              alignSelf={'flex-start'}
              borderBottomWidth={0}
              backgroundColor={'transparent'}
              width={'90%'}
            >
              <Text
                style={styles.title}
                fontFamily={'body'}
                fontWeight={'200'}
                color={textColor}
                paddingBottom={1}
              >
                {title}
              </Text>
              <Text
                style={styles.subTitle}
                fontFamily={'body'}
                fontWeight={'100'}
                color={textColor}
              >
                {subTitle}
              </Text>
            </Modal.Header>
            <Modal.Body>
              {selected ? (
                <ListItem onPress={() => setSelected(null)} item={selected} />
              ) : (
                <FlatList
                  data={cloudData}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <ListItem onPress={() => setSelected(item)} item={item} />
                  )}
                />
              )}
            </Modal.Body>
            <Box alignSelf={'flex-end'} bg={'transparent'}>
              <TouchableOpacity onPress={next}>
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  colors={buttonBackground}
                  style={styles.cta}
                >
                  <Text
                    fontSize={13}
                    fontFamily={'body'}
                    fontWeight={'300'}
                    letterSpacing={1}
                    color={buttonTextColor}
                  >
                    {buttonText}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Box>
          </LinearGradient>
        )}
      </Modal.Content>
    </Modal>
  );
};

export default CloudRecoveryModal;

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: '4%',
    paddingVertical: '5%',
  },
  title: {
    fontSize: 19,
    letterSpacing: 1,
  },
  subTitle: {
    fontSize: 12,
    letterSpacing: 1,
  },
  cta: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  close: {
    alignSelf: 'flex-end',
  },
});
