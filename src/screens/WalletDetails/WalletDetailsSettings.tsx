import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Box, ScrollView, useColorMode } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import ShowXPub from 'src/components/XPub/ShowXPub';
import KeeperHeader from 'src/components/KeeperHeader';
import { wp, hp } from 'src/constants/responsive';
import KeeperModal from 'src/components/KeeperModal';
import useToastMessage from 'src/hooks/useToastMessage';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import TickIcon from 'src/assets/images/icon_tick.svg';
import OptionCard from 'src/components/OptionCard';
import ScreenWrapper from 'src/components/ScreenWrapper';

function WalletDetailsSettings({ route }) {
  const { colorMode } = useColorMode();
  const { wallet } = route.params || {};
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const [xpubVisible, setXPubVisible] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const walletTranslation = translations.wallet;
  const { importWallet, common } = translations;
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={walletTranslation.WalletDetails}
        subtitle={walletTranslation.walletDetailsSubTitle}
      />

      <ScrollView
        contentContainerStyle={styles.optionsListContainer}
        showsVerticalScrollIndicator={false}
      >
        <OptionCard
          title={walletTranslation.EditWalletDeatils}
          description={walletTranslation.changeWalletDetails}
          callback={() => {
            navigation.navigate('EditWalletDetails', { wallet });
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
          description={walletTranslation.changeDerivationPath}
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
          title={walletTranslation.XPubTitle}
          subTitleWidth={wp(240)}
          subTitle={walletTranslation.walletXPubSubTitle}
          modalBackground={`${colorMode}.modalWhiteBackground`}
          subTitleColor={`${colorMode}.secondaryText`}
          textColor={`${colorMode}.primaryText`}
          DarkCloseIcon={colorMode === 'dark'}
          // eslint-disable-next-line react/no-unstable-nested-components
          Content={() => (
            <ShowXPub
              data={wallet?.specs?.xpub}
              copy={() => {
                setXPubVisible(false);
                showToast(walletTranslation.xPubCopyToastMsg, <TickIcon />);
              }}
              copyable
              close={() => setXPubVisible(false)}
              subText={walletTranslation?.AccountXpub}
              noteSubText={walletTranslation?.AccountXpubNote}
            />
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
  walletDescription: {
    letterSpacing: 0.24,
    fontSize: 13,
  },
  walletBalance: {
    letterSpacing: 1.2,
    fontSize: 23,
    padding: 5,
  },
  optionsListContainer: {
    alignItems: 'center',
    paddingTop: '10%',
  },
});
export default WalletDetailsSettings;
