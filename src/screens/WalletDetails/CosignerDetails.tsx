import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { Box, ScrollView, useColorMode } from 'native-base';
import ShowXPub from 'src/components/XPub/ShowXPub';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { getKeyExpression } from 'src/utils/service-utilities/utils';
import { XpubTypes } from 'src/services/wallets/enums';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import ShareWithNfc from '../NFCChannel/ShareWithNfc';
import idx from 'idx';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { captureError } from 'src/services/sentry';

type ScreenProps = NativeStackScreenProps<AppStackParams, 'CosignerDetails'>;
function CosignerDetails({ route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const [details, setDetails] = React.useState('');
  const { signer } = route.params;

  const fetchKeyExpression = (type: XpubTypes) => {
    try {
      if (signer.masterFingerprint && signer.signerXpubs[type] && signer.signerXpubs[type]?.[0]) {
        const keyDescriptor = getKeyExpression(
          signer.masterFingerprint,
          idx(signer, (_) => _.signerXpubs[type][0].derivationPath.replaceAll('h', "'")),
          idx(signer, (_) => _.signerXpubs[type][0].xpub),
          false
        );
        return keyDescriptor;
      } else {
        throw new Error(`Missing key details for ${type} type.`);
      }
    } catch (error) {
      throw new Error(`Missing key details for ${type} type.`);
    }
  };

  useEffect(() => {
    if (!details) {
      setTimeout(() => {
        try {
          const keyDescriptor = fetchKeyExpression(XpubTypes.P2WSH);
          setDetails(keyDescriptor);
        } catch (error) {
          captureError(error);
          try {
            const keyDescriptor = fetchKeyExpression(XpubTypes.P2WPKH);
            setDetails(keyDescriptor);
          } catch (error) {
            showToast(
              `We're sorry, but we have trouble retrieving the key information`,
              <ToastErrorIcon />
            );
          }
        }
      }, 200);
    }
  }, []);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Share Key Details"
        subtitle="Scan the key details from another app to add on that app"
      />
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Box style={styles.container}>
          <Box style={styles.center}>
            <ShowXPub
              data={details}
              copy={() => showToast('Co-signer Details Copied Successfully', <TickIcon />)}
              subText="Co-signer Details"
              copyable
            />
          </Box>
          {details ? <ShareWithNfc data={details} signer={signer} /> : null}
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
}

export default CosignerDetails;

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    marginHorizontal: '5%',
  },
  center: {
    marginHorizontal: '5%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10%',
  },
  bottom: {
    marginHorizontal: '5%',
    marginBottom: 25,
  },
});
