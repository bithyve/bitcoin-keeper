/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-await-in-loop */
import React, { useContext, useEffect, useState } from 'react';
import { Box } from 'native-base';
import { StyleSheet, FlatList, Platform } from 'react-native';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Note from 'src/components/Note/Note';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import Colors from 'src/theme/Colors';
import { useDispatch } from 'react-redux';
import { Step } from 'src/nativemodules/interface';
import WhirlpoolClient from 'src/core/services/whirlpool/client';
import { LabelType, WalletType } from 'src/core/wallets/enums';
import { createUTXOReference } from 'src/store/sagaActions/utxos';
import { incrementAddressIndex, refreshWallets } from 'src/store/sagaActions/wallets';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import ElectrumClient from 'src/core/services/electrum/client';
import config from 'src/core/config';
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
import { UTXO } from 'src/core/wallets/interfaces';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { captureError } from 'src/core/services/sentry';
import useWhirlpoolWallets from 'src/hooks/useWhirlpoolWallets';
import { initiateWhirlpoolSocket } from 'src/core/services/whirlpool/sockets';
import { io } from 'src/core/services/channel';
import KeepAwake from 'src/nativemodules/KeepScreenAwake';

const getBackgroungColor = (completed: boolean, error: boolean): string => {
  if (error) {
    return 'error.500';
  }
  if (completed) {
    return 'light.forestGreen';
  }
  return 'light.dustySageGreen';
};

function TimeLine({
  title,
  isLast,
  completed,
  error,
}: {
  title: string;
  isLast: boolean;
  completed: boolean;
  error: boolean;
}) {
  return (
    <Box style={styles.contentWrapper}>
      <Box style={styles.timeLineWrapper}>
        <Box style={styles.circularborder}>
          <Box backgroundColor={getBackgroungColor(completed, error)} style={styles.greentDot} />
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
  );
}

function MixProgress({
  route,
  navigation,
}: {
  route: {
    params: {
      selectedUTXOs: UTXO[];
      depositWallet: Wallet;
      selectedWallet: any;
      walletPoolMap: any;
      isRemix: boolean;
    };
  };
  navigation: any;
}) {
  const statusData = [
    {
      title: 'Subscribing',
      referenceCode: Step.Subscribing,
      completed: false,
      error: false,
    },
    {
      title: 'Registering Input',
      referenceCode: Step.RegisteringInput,
      completed: false,
      error: false,
    },
    {
      title: 'Confirming Input',
      completed: false,
      referenceCode: Step.ConfirmingInput,
      error: false,
    },
    {
      title: 'Waiting For Coordinator',
      referenceCode: Step.WaitingForCoordinator,
      completed: false,
      error: false,
    },
    {
      title: 'Registering Output',
      referenceCode: Step.RegisteringOutput,
      completed: false,
      error: false,
    },
    {
      title: 'Signing',
      referenceCode: Step.Signing,
      completed: false,
      error: false,
    },
    {
      title: 'Mix completed successfully',
      completed: false,
      referenceCode: 'Success',
      isLast: true,
      error: false,
    },
  ];

  const { selectedUTXOs, depositWallet, isRemix } = route.params;
  const dispatch = useDispatch();
  const [currentUtxo, setCurrentUtxo] = React.useState(
    selectedUTXOs.length ? `${selectedUTXOs[0].txId}:${selectedUTXOs[0].vout}` : ''
  );
  const [mixFailed, setMixFailed] = React.useState('');
  const [statuses, setStatus] = React.useState(statusData);
  const { showToast } = useToastMessage();
  const { useQuery } = useContext(RealmWrapperContext);
  const { publicId }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const [poolsData, setPoolsData] = useState([]);
  const { postmixWallet, premixWallet } = useWhirlpoolWallets({ wallets: [depositWallet] })[
    depositWallet.id
  ];
  const source = isRemix ? postmixWallet : premixWallet;
  const destination = postmixWallet;

  const getPoolsData = async () => {
    const poolsDataResponse = await WhirlpoolClient.getPools();
    if (poolsDataResponse) {
      setPoolsData(poolsDataResponse);
    }
  };

  useEffect(() => {
    getPoolsData();
    KeepAwake.activate();

    return () => {
      KeepAwake.deactivate();
    };
  }, []);

  useEffect(() => {
    if (poolsData.length) initiateWhirlpoolMix();
  }, [poolsData]);

  const getPoolforValue = (utxoValue) => {
    let selectedPool;
    let minDiff = Infinity;
    for (const pool of poolsData) {
      if (utxoValue >= pool.denomination) {
        const poolDiff = utxoValue - pool.denomination;
        if (poolDiff < minDiff) {
          selectedPool = pool;
          minDiff = poolDiff;
        }
      }
    }
    return selectedPool;
  };

  const updateStep = (step: Step) => {
    const updatedArray = [...statuses];
    switch (step) {
      case Step.Subscribing:
        updatedArray[0].completed = true;
        setStatus(updatedArray);
        break;
      case Step.RegisteringInput:
        updatedArray[1].completed = true;
        setStatus(updatedArray);
        break;
      case Step.ConfirmingInput:
        updatedArray[2].completed = true;
        setStatus(updatedArray);
        break;
      case Step.WaitingForCoordinator:
        updatedArray[3].completed = true;
        setStatus(updatedArray);
        break;
      case Step.RegisteringOutput:
        updatedArray[4].completed = true;
        setStatus(updatedArray);
        break;
      case Step.Signing:
        updatedArray[5].completed = true;
        setStatus(updatedArray);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (mixFailed) {
      const toastDuration = 3000;
      showToast(
        'Mix failed. Please try again later, our best minds are working on it.',
        <ToastErrorIcon />,
        toastDuration
      );
      setTimeout(() => {
        navigation.goBack();
      }, toastDuration);
    }
  }, [mixFailed]);

  const onWorking = (data) => {
    const { step } = data;
    updateStep(step);
  };

  const onFailure = (data) => {
    const updatedArray = [...statuses];
    updatedArray[6].error = true;
    setStatus(updatedArray);
    setMixFailed(data);
  };

  const onSuccess = (data) => {
    const { txid } = data;
    if (txid) {
      const updatedArray = [...statuses];
      updatedArray[6].completed = true;
      setStatus(updatedArray);
      const walletsToRefresh = [source];
      if (!isRemix) walletsToRefresh.push(destination);
      dispatch(
        incrementAddressIndex(destination, {
          external: { incrementBy: 1 },
        })
      );
      setTimeout(async () => {
        dispatch(refreshWallets(walletsToRefresh, { hardRefresh: true }));
        const transaction = await ElectrumClient.getTransactionsById([txid]);
        const vout = transaction[txid].vout.findIndex(
          (vout) => vout.scriptPubKey.addresses[0] === destination.specs.receivingAddress
        );
        dispatch(
          createUTXOReference({
            labels: [
              {
                name: depositWallet.presentationData.name.toUpperCase(),
                type: LabelType.SYSTEM,
              },
            ],
            txId: txid,
            vout,
          })
        );
      }, 3000);
      navigation.navigate('UTXOManagement', {
        data: depositWallet,
        accountType: WalletType.POST_MIX,
        routeName: 'Wallet',
      });
    }
  };

  useEffect(() => {
    let ws;
    let channel;
    if (Platform.OS === 'android') {
      ws = initiateWhirlpoolSocket(publicId, config.NETWORK_TYPE);
      ws.onmessage = ({ data }) => {
        const payload = JSON.parse(data);
        const { event } = payload.data;
        switch (event) {
          case WHIRLPOOL_WORKING: {
            onWorking(payload.data);
            break;
          }
          case WHIRLPOOL_FAILURE:
          case WHIRLPOOL_ERROR: {
            onFailure(payload.data);
            break;
          }
          case WHIRLPOOL_SUCCESS: {
            onSuccess(payload.data);
            break;
          }
          default: {
            break;
          }
        }
      };
    } else if (Platform.OS === 'ios') {
      channel = io(config.CHANNEL_URL);
      channel.emit(WHIRLPOOL_LISTEN, { room: publicId, network: config.NETWORK_TYPE });
      channel.on(WHIRLPOOL_WORKING, ({ data }) => {
        onWorking(data);
      });
      channel.on(WHIRLPOOL_ERROR, ({ data }) => {
        onFailure(data);
      });
      channel.on(WHIRLPOOL_FAILURE, ({ data }) => {
        onFailure(data);
      });
      channel.on(WHIRLPOOL_SUCCESS, ({ data }) => {
        onSuccess(data);
      });
    }

    return () => {
      if (ws) {
        ws.close();
      } else if (channel) {
        channel.disconnect();
      }
    };
  }, []);

  const initiateWhirlpoolMix = async () => {
    try {
      // To-Do: Instead of taking pool_denomination from the lets create a switch case to get it based on UTXO value
      const { height } = await ElectrumClient.getBlockchainHeaders();
      for (const utxo of selectedUTXOs) {
        setCurrentUtxo(`${utxo.txId}:${utxo.vout}`);
        const pool = getPoolforValue(utxo.value);
        await WhirlpoolClient.startMix(utxo, source, destination, pool, height, publicId);
      }
    } catch (err) {
      const updatedArray = [...statuses];
      updatedArray[6].error = true;
      setStatus(updatedArray);
      const toastDuration = 3000;
      showToast(
        err.error
          ? err.error
          : 'Mix failed. Please try again later, our best minds are working on it.',
        <ToastErrorIcon />,
        toastDuration
      );
      setTimeout(() => {
        navigation.goBack();
      }, toastDuration);
      captureError(err);
    }
  };

  const renderItem = ({ item }) => (
    <TimeLine
      title={item.title}
      completed={item.completed}
      isLast={item?.isLast}
      error={item.error}
    />
  );
  function MixDurationText() {
    return (
      <Text style={styles.mixingSubtitleText}>
        Do not exit this app, this may take
        <Text style={styles.durationTextStyle}>&nbsp;upto 2 minutes</Text>
      </Text>
    );
  }
  return (
    <Box style={styles.container}>
      <ScreenWrapper>
        <HeaderTitle
          enableBack={false}
          paddingTop={hp(30)}
          headerTitleColor=""
          titleFontSize={20}
          title="Mix Progress"
          subtitle={<MixDurationText />}
        />
        <Box style={styles.currentUtxo}>
          <Text color="light.secondaryText" style={styles.currentUtxoTitle}>
            {`Current UTXO: `}
          </Text>
          <Text
            numberOfLines={1}
            color="light.secondaryText"
            style={styles.currentUtxoText}
            ellipsizeMode="middle"
          >
            {currentUtxo}
          </Text>
        </Box>
        <Box style={styles.timeLineContainer}>
          <FlatList
            data={statuses}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.referenceCode}${item.completed}${item.error}`}
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
  mixingSubtitleText: {
    fontSize: 12,
  },
  durationTextStyle: {
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
});

export default MixProgress;
