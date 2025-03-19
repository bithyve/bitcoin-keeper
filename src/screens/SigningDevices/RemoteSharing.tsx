import React, { useState } from 'react';
import { StyleSheet, Share } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { Box, ScrollView, useColorMode, VStack } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import Text from 'src/components/KeeperText';
import RemoteShareIllustration from 'src/assets/images/remote-share-illustration.svg';
import Buttons from 'src/components/Buttons';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import MessagePreview from 'src/components/MessagePreview';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from 'src/store/hooks';
import { RKInteractionMode } from 'src/services/wallets/enums';
import Relay from 'src/services/backend/Relay';
import { encrypt, getKeyAndHash } from 'src/utils/service-utilities/encryption';
import config, { APP_STAGE } from 'src/utils/service-utilities/config';
import { getKeyUID } from 'src/utils/utilities';

type ScreenProps = NativeStackScreenProps<AppStackParams, 'RemoteSharing'>;

const RemoteShareText = {
  [RKInteractionMode.SHARE_REMOTE_KEY]: {
    title: 'Remote Key Sharing',
    desc: 'Please share the key using this link with your contact using a secure and private communication medium.',
    cta: 'Share Key',
    msgTitle: 'Remote Key Sharing',
    msgDesc:
      "Hey, I'm sharing a bitcoin key with you. Please click the link to accept it on the Bitcoin Keeper app and keep it safe.",
  },
  [RKInteractionMode.SHARE_PSBT]: {
    title: 'Sign Transaction Remotely',
    desc: 'Please share this unsigned transaction (PSBT) using the link with the key holder for transaction signing. Use a secure and private communication medium.',
    cta: 'Share Link',
    msgTitle: 'Transaction Signing Request Received',
    msgDesc:
      'Hey, I need you to sign a transaction with the key you have shared previously. Please click the link to view details and sign the transaction in the Bitcoin Keeper app',
  },
  [RKInteractionMode.SHARE_SIGNED_PSBT]: {
    title: 'Sign Transaction Remotely',
    desc: 'Please share back this signed transaction (PSBT) using the link with the transaction creator. Use a secure and private communication medium.',
    cta: 'Share Link',
    msgTitle: 'Signed Transaction Received',
    msgDesc:
      'Hey, I have signed the transaction you had requested. Please click the link to accept it.',
  },
};

const DeepLinkIdentifier = {
  [APP_STAGE.DEVELOPMENT]: 'app/dev',
  [APP_STAGE.PRODUCTION]: 'app/prod',
};

type dataProps = {
  type: RKInteractionMode;
  fcm?: string;
  psbt?: string;
  key?: string;
  keyUID?: string;
  xfp?: string;
  cachedTxid?: string; // for recovering the cached tnx from store on receiving the signed psbt
};

function RemoteSharing({ route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const fcmToken = useAppSelector((state) => state.notifications.fcmToken);
  const { isPSBTSharing = false, psbt, mode, signer = null, xfp = '' } = route.params;
  const { remoteLinkDetails } = useAppSelector((state) => state.vault);
  const cachedTxid = useAppSelector((state) => state.sendAndReceive.sendPhaseTwo.cachedTxid);
  const [primaryLoading, setPrimaryLoading] = useState(false);

  const handleShare = async () => {
    setPrimaryLoading(true);
    try {
      const data: dataProps = {
        type: mode,
      };

      if (mode === RKInteractionMode.SHARE_REMOTE_KEY) {
        data.key = psbt;
        data.fcm = fcmToken;
      }

      if (mode === RKInteractionMode.SHARE_PSBT) {
        data.psbt = psbt;
        data.keyUID = getKeyUID(signer);
        data.xfp = xfp;
        data.cachedTxid = cachedTxid;
      }

      if (mode === RKInteractionMode.SHARE_SIGNED_PSBT) {
        data.psbt = psbt;
        data.xfp = remoteLinkDetails.xfp;
        data.cachedTxid = remoteLinkDetails.cachedTxid;
      }
      const { encryptionKey, hash } = getKeyAndHash(12);
      const encryptedData = encrypt(encryptionKey, JSON.stringify(data));
      const res = await Relay.createRemoteKey(encryptedData, hash);
      if (res?.id) {
        const result = await Share.share({
          title: RemoteShareText[mode].msgTitle,
          message: `${RemoteShareText[mode].msgDesc}\nhttps://bitcoinkeeper.app/${
            DeepLinkIdentifier[config.ENVIRONMENT]
          }/remote/${encryptionKey}`,
        });
        if (result.action === Share.sharedAction) {
          if (result.activityType) navigation.goBack();
        }
      }
    } catch (error) {
      console.log('🚀 ~ handleShare ~ error:', error);
    } finally {
      setPrimaryLoading(false);
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader />
      <VStack style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Box style={styles.descriptionContainer}>
            <Text style={styles.title} medium color={`${colorMode}.headerText`}>
              {RemoteShareText[mode].title}
            </Text>
            <Text style={styles.description}>{RemoteShareText[mode].desc}</Text>
          </Box>

          {!isPSBTSharing && <RemoteShareIllustration style={styles.illustration} />}

          <Box style={styles.messagePreview}>
            <MessagePreview
              title={RemoteShareText[mode].msgTitle}
              description={RemoteShareText[mode].msgDesc}
              link="www.bitcoinkeeper.app..."
            />
          </Box>
        </ScrollView>
        <Box style={styles.CTAContainer}>
          <Buttons
            primaryText={RemoteShareText[mode].cta}
            primaryCallback={handleShare}
            width={windowWidth * 0.82}
            primaryLoading={primaryLoading}
          />
          <Buttons
            secondaryText="Cancel"
            secondaryCallback={() => {
              navigation.goBack();
            }}
            width={windowWidth * 0.82}
          />
        </Box>
      </VStack>
    </ScreenWrapper>
  );
}

export default RemoteSharing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    marginHorizontal: wp(10),
  },
  contentContainer: {
    alignItems: 'center',
  },
  descriptionContainer: {
    alignItems: 'center',
    gap: 10,
    marginVertical: 20,
  },
  CTAContainer: {
    alignItems: 'center',
    gap: 20,
    paddingVertical: hp(10),
  },
  title: {
    fontSize: 20,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    width: wp(300),
  },
  illustration: {
    marginTop: hp(5),
    marginRight: wp(15),
  },
  messagePreview: {
    width: '100%',
    marginTop: hp(32),
    marginBottom: hp(34),
  },
});
