import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Box, ScrollView, useColorMode } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import ShowXPub from 'src/components/XPub/ShowXPub';
import { wp, hp } from 'src/constants/responsive';
import KeeperModal from 'src/components/KeeperModal';
import useToastMessage from 'src/hooks/useToastMessage';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import TickIcon from 'src/assets/images/icon_tick.svg';
import OptionCard from 'src/components/OptionCard';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletUtilities from 'src/services/wallets/operations/utils';
import EditWalletDetailsModal from './EditWalletDetailsModal';
import WalletHeader from 'src/components/WalletHeader';

function WalletDetailsSettings({ route }) {
  const { colorMode } = useColorMode();
  const { wallet }: { wallet: Wallet } = route.params || {};
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const [xpubVisible, setXPubVisible] = useState(false);
  const [walletDetailVisible, setWalletDetailVisible] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const walletTranslation = translations.wallet;
  const { importWallet, common } = translations;

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        title={walletTranslation.WalletDetails}
        subTitle={walletTranslation.walletDetailsSubTitle}
      />

      <ScrollView
        contentContainerStyle={styles.optionsListContainer}
        showsVerticalScrollIndicator={false}
      >
        <OptionCard
          title={walletTranslation.EditWalletDeatils}
          description={walletTranslation.changeWalletDetails}
          callback={() => {
            setWalletDetailVisible(true);
          }}
        />
        <OptionCard
          title={walletTranslation.showXPub}
          description={walletTranslation.showXPubSubTitle}
          callback={() => {
            setXPubVisible(true);
          }}
        />
        <OptionCard
          title={importWallet.derivationPath}
          description={walletTranslation.viewDerivationPath}
          callback={() => {
            navigation.navigate('UpdateWalletDetails', { wallet });
          }}
        />
      </ScrollView>
      <Box style={styles.note}>
        <Note
          title={common.note}
          subtitle={walletTranslation.walletDetailsNote}
          subtitleColor="GreyText"
        />
      </Box>
      <Box>
        <KeeperModal
          visible={xpubVisible}
          close={() => setXPubVisible(false)}
          showCloseIcon={false}
          modalBackground={`${colorMode}.primaryBackground`}
          title={walletTranslation.XPubTitle}
          textColor={`${colorMode}.textGreen`}
          subTitleColor={`${colorMode}.modalSubtitleBlack`}
          subTitle={walletTranslation.walletXPubSubTitle}
          subTitleWidth={wp(300)}
          Content={() => (
            <ShowXPub
              data={wallet ? WalletUtilities.getExtendedPubKeyFromWallet(wallet) : ''}
              copy={() => {
                setXPubVisible(false);
                showToast(walletTranslation.xPubCopyToastMsg, <TickIcon />);
              }}
              close={() => setXPubVisible(false)}
              subText={walletTranslation?.AccountXpub}
              noteSubText={walletTranslation?.AccountXpubNote}
            />
          )}
        />
        <KeeperModal
          visible={walletDetailVisible}
          close={() => setWalletDetailVisible(false)}
          title="Edit name & description"
          subTitleWidth={wp(240)}
          subTitle="This will reflect on the home screen"
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.textGreen`}
          subTitleColor={`${colorMode}.modalSubtitleBlack`}
          showCloseIcon={false}
          Content={() => (
            <EditWalletDetailsModal wallet={wallet} close={() => setWalletDetailVisible(false)} />
          )}
        />
      </Box>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  note: {
    position: 'absolute',
    bottom: hp(35),
    marginLeft: 26,
    width: '90%',
    paddingTop: hp(10),
  },
  walletCardContainer: {
    borderRadius: hp(20),
    width: wp(320),
    paddingHorizontal: 5,
    paddingVertical: 20,
    position: 'relative',
    marginLeft: -wp(20),
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: wp(10),
  },
  walletDetailsWrapper: {
    width: wp(155),
  },
  walletName: {
    letterSpacing: 0.28,
    fontSize: 15,
  },
  walletBalance: {
    letterSpacing: 1.2,
    fontSize: 23,
    padding: 5,
  },
  optionsListContainer: {
    paddingHorizontal: wp(10),
    paddingTop: '10%',
  },
});
export default WalletDetailsSettings;
