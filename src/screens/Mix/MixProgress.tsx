/* eslint-disable no-await-in-loop */
import React, { useContext, useEffect } from 'react';
import { Box } from 'native-base';
import { StyleSheet, FlatList } from 'react-native';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Note from 'src/components/Note/Note';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import Colors from 'src/theme/Colors';
import WhirlpoolLoader from 'src/assets/images/whirlpool_loader.svg'; // Actual assert was missing in XD link
import { useDispatch } from 'react-redux';
import { Info, PoolData, Step } from 'src/nativemodules/interface';
import WhirlpoolClient from 'src/core/services/whirlpool/client';
import { LabelType, WalletType } from 'src/core/wallets/enums';
import { createUTXOReference } from 'src/store/sagaActions/utxos';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import ElectrumClient from 'src/core/services/electrum/client';
import config from 'src/core/config';
import { io } from 'src/core/services/channel';
import {
  WHIRLPOOL_ERROR,
  WHIRLPOOL_FAILURE,
  WHIRLPOOL_LISTEN,
  WHIRLPOOL_SUCCESS,
  WHIRLPOOL_WORKING,
} from 'src/core/services/channel/constants';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import GradientIcon from '../WalletDetailScreen/components/GradientIcon';

export const enum MixStatus {
  COMPLETED = 'COMPLETED',
  INPROGRESS = 'INPROGRESS',
  NOTSTARTED = 'NOTSTARTED',
  CANCELED = 'CANCELED',
}

const statusData = [
  {
    id: '1',
    title: 'Waiting For Coordinator',
    referenceCode: Step.WaitingForCoordinator,
    status: MixStatus.NOTSTARTED,
  },
  {
    id: '2',
    title: 'Connecting',
    referenceCode: Step.Connecting,
    status: MixStatus.NOTSTARTED,
  },
  // {
  //   id: '3',
  //   title: 'Subscribing',
  //   referenceCode: Step.Subscribing,
  //   status: MixStatus.NOTSTARTED,
  // },
  {
    id: '4',
    title: 'Registering Input',
    referenceCode: Step.RegisteringInput,
    status: MixStatus.NOTSTARTED,
  },
  {
    id: '5',
    title: 'Confirming Input',
    status: MixStatus.NOTSTARTED,
    referenceCode: Step.ConfirmingInput,
  },
  {
    id: '6',
    title: 'Registering Output',
    referenceCode: Step.RegisteringOutput,
    status: MixStatus.NOTSTARTED,
  },
  {
    id: '7',
    title: 'Signing',
    referenceCode: Step.Signing,
    status: MixStatus.NOTSTARTED,
  },
  {
    id: '8',
    title: 'Mix completed successfully',
    status: MixStatus.NOTSTARTED,
    referenceCode: 'Success',
    isLast: true,
  },
];

const getBackgroungColor = (status: MixStatus) => {
  switch (status) {
    case MixStatus.NOTSTARTED:
      return 'light.dustySageGreen';
    case MixStatus.COMPLETED:
      return 'light.forestGreen';
    case MixStatus.INPROGRESS:
      return null;
    default:
      return null;
  }
};

function TimeLine({ title, isLast, status }) {
  return (
    <>
      {status === MixStatus.INPROGRESS ? (
        <Box style={styles.whirlpoolLoaderMainWrapper}>
          <Box style={styles.dottedBorderContainer}>
            <Box style={styles.whirlpoolLoaderSolidBorder}>
              <GradientIcon
                height={hp(30)}
                gradient={['#00836A', '#073E39']}
                Icon={WhirlpoolLoader}
              />
            </Box>
            <Box style={styles.verticalBorderWrapper}>
              <Box backgroundColor="light.fadedblue" style={styles.verticalBorder} />
              <Box backgroundColor="light.fadedblue" style={styles.verticalBorder} />
              <Box backgroundColor="light.fadedblue" style={styles.verticalBorder} />
            </Box>
          </Box>
          <Text color="light.secondaryText" style={[styles.timeLineTitle, styles.settingUpTitle]}>
            {title}
          </Text>
        </Box>
      ) : (
        <Box style={styles.contentWrapper}>
          <Box style={styles.timeLineWrapper}>
            <Box style={styles.circularborder}>
              <Box backgroundColor={getBackgroungColor(status)} style={styles.greentDot} />
            </Box>
            {isLast ? null : (
              <Box style={styles.verticalBorderWrapper}>
                <Box backgroundColor="light.fadedblue" style={styles.verticalBorder} />
                <Box backgroundColor="light.fadedblue" style={styles.verticalBorder} />
                <Box backgroundColor="light.fadedblue" style={styles.verticalBorder} />
              </Box>
            )}
          </Box>
          <Text color="light.secondaryText" style={styles.timeLineTitle}>
            {title}
          </Text>
        </Box>
      )}
    </>
  );
}

function MixProgress({ route, navigation }) {
  const { selectedUTXOs, depositWallet, selectedWallet, walletPoolMap } = route.params;
  const dispatch = useDispatch();
  const [currentUtxo, setCurrentUtxo] = React.useState('');
  const [data, setData] = React.useState(statusData);
  const { showToast } = useToastMessage();
  const channel = io(config.CHANNEL_URL);
  const { useQuery } = useContext(RealmWrapperContext);
  const { publicId }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];

  useEffect(() => {
    setData(statusData);
    initiateWhirlpoolMix();
    channel.emit(WHIRLPOOL_LISTEN, { room: publicId, network: config.NETWORK_TYPE });
  }, []);

  useEffect(() => {
    channel.on(WHIRLPOOL_WORKING, async (data) => {
      console.log(data);
    });
    channel.on(WHIRLPOOL_ERROR, async (data) => {
      console.log(data);
    });
    channel.on(WHIRLPOOL_FAILURE, async (data) => {
      console.log(data);
    });
    channel.on(WHIRLPOOL_SUCCESS, async (data) => {
      console.log(data);
    });
    return () => {
      channel.disconnect();
    };
  }, [channel]);

  const notifyMixStatus = (info: Info, step?: Step) => {
    const updatedData = data.map((item) => {
      if (item.referenceCode === step) {
        return {
          ...item,
          status: MixStatus.INPROGRESS,
        };
      }
      if (item.referenceCode === 'Success') {
        return {
          ...item,
          status: MixStatus.COMPLETED,
        };
      }
      return item;
    });
    console.log({ info, step }); // capture step updates
    setData(updatedData);
  };

  const initiateWhirlpoolMix = async () => {
    try {
      const pool: PoolData = walletPoolMap[depositWallet.id];
      const unsucccessfulUtxos = [];

      // To-Do: Instead of taking pool_denomination from the lets create a switch case to get it based on UTXO value
      let isBroadcasted = true;
      const { height } = await ElectrumClient.getBlockchainHeaders();
      for (const utxo of selectedUTXOs) {
        setCurrentUtxo(utxo.txId);
        const txId = await WhirlpoolClient.startMix(
          utxo,
          depositWallet?.whirlpoolConfig?.premixWallet,
          depositWallet?.whirlpoolConfig?.postmixWallet,
          pool,
          height,
          publicId
        );
        if (txId) {
          dispatch(
            refreshWallets(
              [
                depositWallet?.whirlpoolConfig.premixWallet,
                depositWallet?.whirlpoolConfig.postmixWallet,
              ],
              { hardRefresh: true }
            )
          );

          dispatch(
            createUTXOReference({
              labels: [{ name: 'Premix', type: LabelType.SYSTEM }],
              txId,
              vout: pool.denomination,
            })
          );
        } else {
          unsucccessfulUtxos.push(utxo.txId);
          isBroadcasted = false;
        }
      }
      if (isBroadcasted) {
        console.log('Mix completed successfully');

        navigation.navigate('UTXOManagement', {
          data: depositWallet,
          accountType: WalletType.POST_MIX,
          routeName: 'Wallet',
        });
      } else {
        showToast(`Failure to mix the utxo's ${unsucccessfulUtxos.join(', ')}`, <ToastErrorIcon />);
        navigation.goBack();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const renderItem = ({ item }) => (
    <TimeLine title={item.title} status={item.status} isLast={item?.isLast} />
  );
  return (
    <Box style={styles.container}>
      <ScreenWrapper>
        <HeaderTitle
          enableBack={false}
          paddingTop={hp(30)}
          headerTitleColor=""
          titleFontSize={20}
          title="Mix Progress"
          subtitle="Do not exit this app, this may take upto 2 minutes"
        />
        <Box style={styles.currentUtxo}>
          <Text color="light.secondaryText" style={styles.currentUtxoTitle}>
            Current UTXO :
          </Text>
          <Text numberOfLines={1} color="light.secondaryText" style={styles.currentUtxoText}>
            {' '}
            {currentUtxo}
          </Text>
        </Box>
        <Box style={styles.timeLineContainer}>
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatList}
          />
        </Box>
      </ScreenWrapper>
      <Box backgroundColor="light.mainBackground" style={styles.note}>
        <Note title="Note:" subtitle="Make sure your phone is sufficiently charged" />
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timeLineContainer: {
    paddingHorizontal: wp(10),
  },
  flatList: {
    marginTop: hp(20),
    paddingBottom: 70,
  },
  circularborder: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.Black,
    borderStyle: 'dotted',
    justifyContent: 'center',
    alignItems: 'center',
    width: hp(25),
    height: hp(25),
    zIndex: 999,
  },
  whirlpoolLoaderSolidBorder: {
    borderWidth: 1,
    borderColor: Colors.Black,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    padding: 3,
  },
  dottedBorderContainer: {
    alignItems: 'center',
    paddingLeft: 3,
  },
  whirlpoolLoaderMainWrapper: {
    flexDirection: 'row',
  },
  greentDot: {
    width: hp(19),
    height: hp(19),
    borderRadius: 50,
  },
  verticalBorderWrapper: {
    marginVertical: hp(5),
  },
  verticalBorder: {
    width: hp(3),
    height: hp(3),
    marginVertical: hp(5),
  },
  timeLineWrapper: {
    alignItems: 'center',
    marginHorizontal: wp(10),
  },
  contentWrapper: {
    flexDirection: 'row',
  },
  timeLineTitle: {
    fontSize: 14,
    letterSpacing: 0.5,
    marginLeft: wp(25),
    marginTop: hp(3),
  },
  settingUpTitle: {
    marginTop: hp(12),
    paddingLeft: 5,
    fontWeight: 'bold',
  },
  note: {
    position: 'absolute',
    bottom: hp(0),
    left: wp(40),
    width: '100%',
    height: hp(90),
  },
  currentUtxo: {
    marginTop: 20,
    marginLeft: 20,
    flexDirection: 'row',
  },
  currentUtxoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  currentUtxoText: {
    fontSize: 14,
    width: '60%',
  },
});

export default MixProgress;
