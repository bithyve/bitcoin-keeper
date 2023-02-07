import { StyleSheet } from 'react-native';
import { Box } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';

import HeaderTitle from 'src/components/HeaderTitle';
import { RNCamera } from 'react-native-camera';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Note from 'src/components/Note/Note';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { LocalizationContext } from 'src/common/content/LocContext';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { io } from 'src/core/services/channel';
import { BITBOX_SETUP, CREATE_CHANNEL } from 'src/core/services/channel/constants';

function ConnectChannel() {
  const channel = io('http://192.168.1.176:4000'); // TODO: update url once hosted
  let channelCreated = false;

  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { useQuery } = useContext(RealmWrapperContext);
  const { publicId }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const [channelId, setChannelId] = useState<string>();

  const onBarCodeRead = ({ data }) => {
    if (!channelCreated) {
      setChannelId(`${publicId}${data}`);
      channel.emit(CREATE_CHANNEL, channelId);
      channelCreated = true;
    }
  };

  useEffect(() => {
    channel.on(BITBOX_SETUP, (data) => {
      const { multiSigPath, multiSigXpub, singleSigPath, singleSigXpub } = data;
      console.log(multiSigPath, multiSigXpub, singleSigPath, singleSigXpub);
    });
  }, [channel]);

  return (
    <ScreenWrapper>
      <Box flex={1}>
        <HeaderTitle
          title="Create a channel"
          subtitle="Create a channel to communicate with the Keeper HWI"
        />
        <Box style={styles.qrcontainer}>
          <RNCamera
            style={styles.cameraView}
            captureAudio={false}
            onBarCodeRead={onBarCodeRead}
            useNativeZoom
          />
        </Box>
        <Box style={styles.noteWrapper}>
          <Note
            title={common.note}
            subtitle="Make sure that the QR is well aligned, focused and visible as a whole"
            subtitleColor="GreyText"
          />
        </Box>
      </Box>
    </ScreenWrapper>
  );
}

export default ConnectChannel;

const styles = StyleSheet.create({
  qrcontainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 25,
    alignItems: 'center',
  },
  cameraView: {
    height: hp(280),
    width: wp(375),
  },
  noteWrapper: {
    width: '100%',
    bottom: 0,
    position: 'absolute',
    padding: 20,
  },
});
