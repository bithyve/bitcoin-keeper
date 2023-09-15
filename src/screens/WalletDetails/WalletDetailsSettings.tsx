import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, Pressable, ScrollView } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import ShowXPub from 'src/components/XPub/ShowXPub';
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { wp, hp } from 'src/constants/responsive';
import KeeperModal from 'src/components/KeeperModal';
import useToastMessage from 'src/hooks/useToastMessage';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import Arrow from 'src/assets/images/icon_arrow_Wallet.svg';
import TransferPolicy from 'src/components/XPub/TransferPolicy';
import TickIcon from 'src/assets/images/icon_tick.svg';

type Props = {
  title: string;
  subTitle: string;
  onPress: () => void;
};

function Option({ title, subTitle, onPress }: Props) {
  return (
    <Pressable
      style={styles.optionContainer}
      onPress={onPress}
      testID={`btn_${title.replace(/ /g, '_')}`}
    >
      <Box style={{ width: '96%' }}>
        <Text
          color="light.primaryText"
          style={styles.optionTitle}
          testID={`text_${title.replace(/ /g, '_')}`}
        >
          {title}
        </Text>
        <Text
          color="light.GreyText"
          style={styles.optionSubtitle}
          numberOfLines={2}
          testID={`text_${subTitle.replace(/ /g, '_')}`}
        >
          {subTitle}
        </Text>
      </Box>
      <Box style={{ width: '4%' }}>
        <Arrow />
      </Box>
    </Pressable>
  );
}

function WalletDetailsSettings({ route }) {
  const { wallet, editPolicy = false } = route.params || {};
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const [xpubVisible, setXPubVisible] = useState(false);
  //   const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [transferPolicyVisible, setTransferPolicyVisible] = useState(editPolicy);
  const { translations } = useContext(LocalizationContext);
  const walletTranslation = translations.wallet;

  return (
    <Box style={styles.Container} background="light.secondaryBackground">
      <StatusBarComponent padding={50} />
      <Box>
        <HeaderTitle
          title="Wallet Details"
          subtitle="Name, details and transfer policy"
          onPressHandler={() => navigation.goBack()}
          headerTitleColor="light.textBlack"
          titleFontSize={20}
          paddingTop={hp(5)}
          paddingLeft={20}
        />
      </Box>
      <Box
        style={{
          marginTop: hp(35),
          marginLeft: wp(25),
        }}
      ></Box>
      <Box style={styles.optionsListContainer}>
        <ScrollView
          style={{
            marginBottom: hp(40),
          }}
          showsVerticalScrollIndicator={false}
        >
          <Option
            title="Edit Wallet Name & Description"
            subTitle="Change wallet name & description"
            onPress={() => {
              navigation.navigate('EditWalletDetails', { wallet });
            }}
          />
          <Option
            title="Show xPub"
            subTitle="Use to create an external, watch-only wallet"
            onPress={() => {
              setXPubVisible(true);
            }}
          />
          <Option
            title="Derivation Path"
            subTitle="Change Derivation path"
            onPress={() => {
              navigation.navigate('UpdateWalletDetails', { wallet });
            }}
          />

          <Option
            title="Transfer Policy"
            subTitle={`Transfer to Vault after ${wallet?.transferPolicy?.threshold / 1e9} BTC`}
            onPress={() => {
              setTransferPolicyVisible(true);
            }}
          />
        </ScrollView>
      </Box>
      {/* {Bottom note} */}
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
    </Box>
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
    marginLeft: wp(25),
    marginTop: 10,
    height: hp(425),
  },
  optionContainer: {
    marginTop: hp(20),
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  optionTitle: {
    fontSize: 14,
    letterSpacing: 1.12,
  },
  optionSubtitle: {
    fontSize: 12,
    letterSpacing: 0.6,
    width: '90%',
  },
});
export default WalletDetailsSettings;
