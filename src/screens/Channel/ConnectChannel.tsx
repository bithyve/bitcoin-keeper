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
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { getBitbox02Details } from 'src/hardware/bitbox';
import usePlan from 'src/hooks/usePlan';
import { generateSignerFromMetaData } from 'src/hardware';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { useDispatch } from 'react-redux';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import HWError from 'src/hardware/HWErrorState';
import { captureError } from 'src/core/services/sentry';
import { checkSigningDevice } from '../Vault/AddSigningDevice';

function ConnectChannel() {
  const route = useRoute();
  const { title = '', subtitle = '' } = route.params as any;
  const channel = io('http://192.168.1.176:4000'); // TODO: update url once hosted
  let channelCreated = false;

  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { useQuery } = useContext(RealmWrapperContext);
  const { publicId }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const [channelId, setChannelId] = useState<string>();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();

  const { subscriptionScheme } = usePlan();
  const isMultisig = subscriptionScheme.n !== 1;

  const onBarCodeRead = ({ data }) => {
    if (!channelCreated) {
      setChannelId(`${publicId}${data}`);
      channel.emit(CREATE_CHANNEL, channelId);
      channelCreated = true;
    }
  };

  useEffect(() => {
    channel.on(BITBOX_SETUP, async (data) => {
      try {
        const { xpub, derivationPath, xfp, xpubDetails } = getBitbox02Details(data, isMultisig);
        const bitbox02 = generateSignerFromMetaData({
          xpub,
          derivationPath,
          xfp,
          isMultisig,
          signerType: SignerType.BITBOX02,
          storageType: SignerStorage.COLD,
          xpubDetails,
        });
        dispatch(addSigningDevice(bitbox02));
        navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
        showToast(`${bitbox02.signerName} added successfully`, <TickIcon />);
        const exsists = await checkSigningDevice(bitbox02.signerId);
        if (exsists)
          showToast('Warning: Vault with this signer already exisits', <ToastErrorIcon />);
      } catch (error) {
        if (error instanceof HWError) {
          showToast(error.message, <ToastErrorIcon />, 3000);
        } else if (error.toString() === 'Error') {
          // ignore if user cancels NFC interaction
        } else captureError(error);
      }
    });
  }, [channel]);

  return (
    <ScreenWrapper>
      <Box flex={1}>
        <HeaderTitle title={title} subtitle={subtitle} />
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
