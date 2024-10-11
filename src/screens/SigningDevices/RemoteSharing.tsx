import React from 'react';
import { StyleSheet, Share } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { Box, ScrollView, useColorMode, VStack } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import Text from 'src/components/KeeperText';
import useSignerMap from 'src/hooks/useSignerMap';
import RemoteShareIllustration from 'src/assets/images/remote-share-illustration.svg';
import Buttons from 'src/components/Buttons';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import MessagePreview from 'src/components/MessagePreview';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from 'src/store/hooks';
import { RKInteractionMode } from 'src/services/wallets/enums';
import Relay from 'src/services/backend/Relay';
import useVault from 'src/hooks/useVault';
import { encrypt, getRandomBytes } from 'src/utils/service-utilities/encryption';
import { SendConfirmationRouteParams, tnxDetailsProps } from '../Send/SendConfirmation';

type ScreenProps = NativeStackScreenProps<AppStackParams, 'RemoteSharing'>;

const RemoteShareText = {
  [RKInteractionMode.SHARE_REMOTE_KEY]: {
    title: 'Remote Key Sharing',
    desc: 'Please share this Key-Link with your contact using a secure and private communication medium. The link will be valid for 5 minutes.',
    cta: 'Share Key',
    msgTitle: 'Remote Key Sharing',
    msgDesc: 'Hey, I’m sharing a bitcoin key with you. Please click the link to accept it.',
  },
  [RKInteractionMode.SHARE_PSBT]: {
    title: 'Sign Transaction Remotely',
    desc: 'Please share the PSBT Link with the key holder for transaction signing. Once generated, the link will be valid for 5 minutes.',
    cta: 'Share Link',
    msgTitle: 'Transaction Signing Request Received',
    msgDesc:
      'Hey, your friend is requesting for your Key to make a transaction. Please click the link to view details',
  },
  [RKInteractionMode.SHARE_SIGNED_PSBT]: {
    title: 'Sign Transaction Remotely',
    desc: 'Please share back the PSBT link with the transaction creator to complete the signing. Once generated, the link will be valid for 5 minutes.',
    cta: 'Share Link',
    msgTitle: 'Signed Transaction Received',
    msgDesc: 'Hey, your friend has signed your transaction. Please click the link to accept it.',
  },
};

type dataProps = {
  type: RKInteractionMode;
  fcm?: string;
  signer?: any;
  isMultisig?: boolean;
  psbt?: string;
  vaultKey?: any;
  vaultId?: string;
  serializedPSBTEnvelop?: any;
  vault: any;
  sendConfirmationRouteParams?: SendConfirmationRouteParams;
  tnxDetails: tnxDetailsProps;
  signingDetails?: any;
};

function RemoteSharing({ route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const fcmToken = useAppSelector((state) => state.notifications.fcmToken);
  const {
    signer: signerFromParam,
    isPSBTSharing = false,
    psbt,
    mode,
    vaultKey,
    vaultId,
    serializedPSBTEnvelop,
    isMultisig,
    sendConfirmationRouteParams,
    tnxDetails,
  } = route.params;
  const { signerMap } = useSignerMap();
  const signer = signerMap[signerFromParam?.masterFingerprint];
  const { activeVault } = useVault({ vaultId });

  const handleShare = async () => {
    try {
      const data: dataProps = {
        type: mode,
      };

      if (mode === RKInteractionMode.SHARE_REMOTE_KEY) {
        data.fcm = fcmToken;
        data.signer = {
          extraData: { originalType: signer.type },
          inheritanceKeyInfo: signer.inheritanceKeyInfo,
          isBIP85: signer.isBIP85,
          masterFingerprint: signer.masterFingerprint,
          signerPolicy: signer.signerPolicy,
          signerXpubs: signer.signerXpubs,
        };
      }

      if (mode === RKInteractionMode.SHARE_PSBT) {
        data.sendConfirmationRouteParams = sendConfirmationRouteParams;
        data.tnxDetails = tnxDetails;
        data.signingDetails = {
          signer: signer.masterFingerprint,
          isMultisig: findIsMultisig(activeVault),
          serializedPSBTEnvelop: serializedPSBTEnvelop,
          vaultKey: vaultKey,
          vaultId: vaultId,
          vault: activeVault
            ? {
                networkType: activeVault.networkType,
                specs: activeVault.specs,
                signers: activeVault.signers,
              }
            : null,
        };
      }

      if (mode === RKInteractionMode.SHARE_SIGNED_PSBT) {
        data.isMultisig = isMultisig;
        data.vaultKey = vaultKey;
        data.vaultId = vaultId;
        data.psbt = psbt;
      }
      console.log('🚀 ~ handleShare ~ data:', data);
      const encryptionKey = getRandomBytes(12);
      const encryptedData = encrypt(encryptionKey, JSON.stringify(data));
      const res = await Relay.createRemoteKey(encryptedData);
      if (res?.id) {
        const result = await Share.share({
          title: RemoteShareText[mode].msgTitle,
          message: `${RemoteShareText[mode].msgDesc}\nhttps://bitcoinkeeper.app/dev/shareKey/${res.id}/${encryptionKey}`,
        });
        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            // Add any specific logic if needed for the activity type
          } else {
            // Shared successfully
          }
        } else if (result.action === Share.dismissedAction) {
          // Dismissed by user
        }
      }
    } catch (error) {
      console.log('🚀 ~ handleShare ~ error:', error);
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

const findIsMultisig = (vault) => (vault.signers.length > 1 ? true : false);
