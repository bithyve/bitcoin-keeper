import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Box, ScrollView } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import ShowXPub from 'src/components/XPub/ShowXPub';
import KeeperHeader from 'src/components/KeeperHeader';
import { wp, hp } from 'src/constants/responsive';
import KeeperModal from 'src/components/KeeperModal';
import useToastMessage from 'src/hooks/useToastMessage';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import TransferPolicy from 'src/components/XPub/TransferPolicy';
import TickIcon from 'src/assets/images/icon_tick.svg';
import OptionCard from 'src/components/OptionCard';
import ScreenWrapper from 'src/components/ScreenWrapper';

function WalletDetailsSettings({ route }) {
  const { wallet, editPolicy = false } = route.params || {};
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const [xpubVisible, setXPubVisible] = useState(false);
  const [transferPolicyVisible, setTransferPolicyVisible] = useState(editPolicy);
  const { translations } = useContext(LocalizationContext);
  const walletTranslation = translations.wallet;

  return (
    <ScreenWrapper>
      <KeeperHeader title="Wallet Details" subtitle="Name, details and transfer policy" />

      <ScrollView
        contentContainerStyle={styles.optionsListContainer}
        showsVerticalScrollIndicator={false}
      >
        <OptionCard
          title="Edit Wallet Name & Description"
          description="Change wallet name & description"
          callback={() => {
            navigation.navigate('EditWalletDetails', { wallet });
          }}
        />
        <OptionCard
          title="Show xPub"
          description="Use to create an external, watch-only wallet"
          callback={() => {
            setXPubVisible(true);
          }}
        />
        <OptionCard
          title="Derivation Path"
          description="Change Derivation path"
          callback={() => {
            navigation.navigate('UpdateWalletDetails', { wallet });
          }}
        />
        <OptionCard
          title="Transfer Policy"
          description={`Transfer to Vault after ${wallet?.transferPolicy?.threshold / 1e9} BTC`}
          callback={() => {
            setTransferPolicyVisible(true);
          }}
        />
      </ScrollView>
      <Box style={styles.note} backgroundColor="light.secondaryBackground">
        <Note
          title="Note"
          subtitle="These settings are for your selected wallet only and does not affect other wallets"
          subtitleColor="GreyText"
        />
      </Box>
      <Box>
        <KeeperModal
          visible={xpubVisible}
          close={() => setXPubVisible(false)}
          title="Wallet xPub"
          subTitleWidth={wp(240)}
          subTitle="Scan or copy the xPub in another app for generating new addresses and fetching balances"
          subTitleColor="light.secondaryText"
          textColor="light.primaryText"
          // eslint-disable-next-line react/no-unstable-nested-components
          Content={() => (
            <ShowXPub
              data={wallet?.specs?.xpub}
              copy={() => {
                setXPubVisible(false);
                showToast('Xpub Copied Successfully', <TickIcon />);
              }}
              copyable
              close={() => setXPubVisible(false)}
              subText={walletTranslation?.AccountXpub}
              noteSubText={walletTranslation?.AccountXpubNote}
            />
          )}
        />
        <KeeperModal
          visible={transferPolicyVisible}
          close={() => {
            setTransferPolicyVisible(false);
          }}
          title="Edit Transfer Policy"
          subTitle="Threshold amount at which transfer is triggered"
          subTitleColor="light.secondaryText"
          textColor="light.primaryText"
          Content={() => (
            <TransferPolicy
              wallet={wallet}
              close={() => {
                showToast('Transfer Policy Changed', <TickIcon />);
                setTransferPolicyVisible(false);
              }}
              secondaryBtnPress={() => {
                setTransferPolicyVisible(false);
              }}
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
