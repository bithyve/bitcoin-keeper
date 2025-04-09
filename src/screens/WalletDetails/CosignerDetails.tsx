import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Box, ScrollView, useColorMode } from 'native-base';
import ShowXPub from 'src/components/XPub/ShowXPub';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { getKeyExpression } from 'src/utils/service-utilities/utils';
import { XpubTypes } from 'src/services/wallets/enums';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import idx from 'idx';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { Signer } from 'src/services/wallets/interfaces/vault';
import { useNavigation } from '@react-navigation/native';
import WalletHeader from 'src/components/WalletHeader';

export const fetchKeyExpression = (signer: Signer) => {
  for (const type of [XpubTypes.P2WSH]) {
    if (signer.masterFingerprint && signer.signerXpubs[type] && signer.signerXpubs[type]?.[0]) {
      const keyDescriptor = getKeyExpression(
        signer.masterFingerprint,
        idx(signer, (_) => _.signerXpubs[type][0].derivationPath.replaceAll('h', "'")),
        idx(signer, (_) => _.signerXpubs[type][0].xpub),
        false
      );
      return keyDescriptor;
    }
  }

  throw new Error('Missing key details.');
};

type ScreenProps = NativeStackScreenProps<AppStackParams, 'CosignerDetails'>;
function CosignerDetails({ route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const [details, setDetails] = React.useState('');
  const { signer } = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    if (!details) {
      setTimeout(() => {
        try {
          const keyDescriptor = fetchKeyExpression(signer);
          setDetails(keyDescriptor);
        } catch (error) {
          if (error && error.message === 'Missing key details.') {
            showToast(
              'Missing key details of multi-key type, please add key details from Add Device',
              <ToastErrorIcon />
            );
          } else {
            showToast(
              "We're sorry, but we have trouble retrieving the key information",
              <ToastErrorIcon />
            );
          }
          navigation.goBack();
        }
      }, 200);
    }
  }, []);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        title="Share Key Details"
        subTitle="Scan the key details from another app to add on that app"
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
    marginHorizontal: '10%',
  },
  center: {
    marginHorizontal: '5%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10%',
  },
  centerBottom: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom: {
    marginHorizontal: '5%',
    marginBottom: 25,
  },
});
