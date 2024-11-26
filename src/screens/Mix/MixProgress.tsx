/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-await-in-loop */
import React, { useEffect, useState } from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet, FlatList, Platform, Animated, Easing, BackHandler } from 'react-native';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Note from 'src/components/Note/Note';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import Colors from 'src/theme/Colors';
import { useDispatch } from 'react-redux';
import { Step } from 'src/nativemodules/interface';
import WhirlpoolClient from 'src/services/whirlpool/client';
import { LabelRefType, WalletType } from 'src/services/wallets/enums';
import { incrementAddressIndex, refreshWallets } from 'src/store/sagaActions/wallets';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Gear0 from 'src/assets/images/WP.svg';
import ElectrumClient from 'src/services/electrum/client';
import config from 'src/utils/service-utilities/config';
import {
  WHIRLPOOL_ERROR,
  WHIRLPOOL_FAILURE,
  WHIRLPOOL_LISTEN,
  WHIRLPOOL_SUCCESS,
  WHIRLPOOL_WORKING,
} from 'src/services/channel/constants';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { BIP329Label, UTXO } from 'src/services/wallets/interfaces';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { captureError } from 'src/services/sentry';
import useWhirlpoolWallets from 'src/hooks/useWhirlpoolWallets';
import { initiateWhirlpoolSocket } from 'src/services/whirlpool/sockets';
import { io } from 'src/services/channel';
import KeepAwake from 'src/nativemodules/KeepScreenAwake';
import TickIcon from 'src/assets/images/icon_tick.svg';
import useVault from 'src/hooks/useVault';
import { Vault } from 'src/services/wallets/interfaces/vault';
import useLabelsNew from 'src/hooks/useLabelsNew';
import { generateAbbreviatedOutputDescriptors } from 'src/utils/service-utilities/utils';
import { bulkUpdateUTXOLabels } from 'src/store/sagaActions/utxos';
import { useQuery } from '@realm/react';
import { CommonActions } from '@react-navigation/native';

const getBackgroungColor = (completed: boolean, error: boolean): string => {
  if (error) {
    return 'error.500';
  }
  if (completed) {
    return 'light.forestGreen';
  }
  return 'light.dustySageGreen';
};

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
      remixingToVault: boolean;
      vaultId: string;
    };
  };
  navigation: any;
}) {
  const { colorMode } = useColorMode();
  const spinValue = new Animated.Value(0);
  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 10000,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start();
  const clock = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const styles = getStyles(clock);

  const { selectedUTXOs, depositWallet, isRemix, remixingToVault, vaultId } = route.params;
  const statusData = [
    {
      title: 'Subscribing',
      subTitle: 'Checking connection to the Coordinator',
      referenceCode: Step.Subscribing,
      completed: false,
      error: false,
    },
    {
      title: 'Registering Input',
      subTitle: 'Checking whether the UTXOs are ready to enter the pool',
      referenceCode: Step.RegisteringInput,
      completed: false,
      error: false,
    },
    {
      title: 'Confirming Input',
      subTitle: 'Entering UTXOs into the pool.',
      completed: false,
      referenceCode: Step.ConfirmingInput,
      error: false,
    },
    {
      title: 'Waiting For Co-ordinator',
      subTitle: 'Waiting for others to join the pool. Hold tight.',
      referenceCode: Step.WaitingForCoordinator,
      completed: false,
      error: false,
    },
    {
      title: 'Registering Output',
      subTitle: 'Constructing a transaction to create a brand new UTXO',
      referenceCode: Step.RegisteringOutput,
      completed: false,
      error: false,
    },
    {
      title: 'Signing',
      subTitle: 'Signing and broadcasting the transaction',
      referenceCode: Step.Signing,
      completed: false,
      error: false,
    },
    {
      title: isRemix
        ? remixingToVault
          ? 'Remix to vault successful'
          : 'Remix completed successful'
        : 'Mix completed successfully',
      subTitle: 'Mixed UTXO available in Postmix',
      completed: false,
      referenceCode: 'Success',
      isLast: true,
      error: false,
    },
  ];

  const dispatch = useDispatch();
  const [currentUtxo, setCurrentUtxo] = React.useState(
    selectedUTXOs.length ? `${selectedUTXOs[0].txId}:${selectedUTXOs[0].vout}` : ''
  );
  const [mixFailed, setMixFailed] = React.useState('');
  const [statuses, setStatus] = React.useState(statusData);
  const { showToast } = useToastMessage();
  const { publicId }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const [poolsData, setPoolsData] = useState([]);
  const { postmixWallet, premixWallet } = useWhirlpoolWallets({ wallets: [depositWallet] })[
    depositWallet.id
  ];
  const { activeVault } = useVault({ vaultId });
  const source = isRemix ? postmixWallet : premixWallet;
  const destination = isRemix && remixingToVault ? activeVault : postmixWallet;
  const { labels } = useLabelsNew({ utxos: selectedUTXOs, wallet: depositWallet });

  const getPoolsData = async () => {
    const poolsDataResponse = await WhirlpoolClient.getPools();
    if (poolsDataResponse) {
      setPoolsData(poolsDataResponse);
    }
  };

  useEffect(() => {
    getPoolsData();
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    KeepAwake.activate();
    return () => {
      KeepAwake.deactivate();
      backHandler.remove();
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

  function TimeLine({
    title,
    subTitle,
    isLast,
    completed,
    error,
    index,
  }: {
    title: string;
    subTitle: string;
    isLast: boolean;
    completed: boolean;
    error: boolean;
    index: number;
  }) {
    const inProgress = statuses[index].completed && !statuses[index + 1]?.completed;
    return (
      <Box style={styles.contentWrapper}>
        <Box style={inProgress ? styles.timeLineProgressWrapper : styles.timeLineWrapper}>
          {inProgress ? (
            <Box style={styles.animatedCircularborder}>
              <Box backgroundColor={`${colorMode}.forestGreen`} style={styles.animatedGreentDot}>
                <Animated.View style={styles.whirlpoolIconStyle}>
                  <Gear0 />
                </Animated.View>
              </Box>
            </Box>
          ) : (
            <Box style={styles.circularborder}>
              <Box
                backgroundColor={getBackgroungColor(completed, error)}
                style={styles.greentDot}
              />
            </Box>
          )}
          {isLast ? null : (
            <Box
              style={
                inProgress ? styles.verticalProgressBorderWrapper : styles.verticalBorderWrapper
              }
            >
              <Box backgroundColor={`${colorMode}.fadedblue`} style={styles.verticalBorder} />
              <Box backgroundColor={`${colorMode}.fadedblue`} style={styles.verticalBorder} />
              <Box backgroundColor={`${colorMode}.fadedblue`} style={styles.verticalBorder} />
            </Box>
          )}
        </Box>
        <Box style={styles.progressStepsTextWrapper}>
          <Text color={`${colorMode}.secondaryText`} style={styles.timeLineTitle}>
            {title}
          </Text>
          {inProgress ? (
            <Text
              color={`${colorMode}.secondaryText`}
              numberOfLines={3}
              style={styles.timeLineTitle}
            >
              {subTitle}
            </Text>
          ) : null}
        </Box>
      </Box>
    );
  }

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
        <ToastErrorIcon />
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

  const onSuccess = async (data) => {
    const { txid } = data;
    if (txid) {
      const updatedArray = [...statuses];
      updatedArray[6].completed = true;
      setStatus(updatedArray);
      const walletsToRefresh = [source] as (Wallet | Vault)[];
      if (!isRemix) walletsToRefresh.push(destination);
      dispatch(
        incrementAddressIndex(destination, {
          external: { incrementBy: 1 },
        })
      );
      showToast(
        'Mix completed successfully. Your UTXOs will be available in your postmix account shortly.',
        <TickIcon />
      );
      try {
        const postmixTags: BIP329Label[] = [];
        const userLabels = [];
        Object.keys(labels).forEach((key) => {
          const tags = labels[key].filter((t) => !t.isSystem);
          userLabels.push(...tags);
        });
        const origin = generateAbbreviatedOutputDescriptors(depositWallet);
        const transaction = await ElectrumClient.getTransactionsById([txid]);
        const vout = transaction[txid].vout.findIndex(
          (vout) => vout.scriptPubKey.addresses[0] === destination.specs.receivingAddress
        );
        userLabels.forEach((label) => {
          postmixTags.push({
            id: `${txid}:${vout}${label.name}`,
            ref: `${txid}:${vout}`,
            type: LabelRefType.OUTPUT,
            label: label.name,
            isSystem: label.isSystem,
            origin,
          });
        });
        dispatch(bulkUpdateUTXOLabels({ addedTags: postmixTags }));
      } catch (err) {
        captureError(err);
      } finally {
        setTimeout(async () => {
          dispatch(refreshWallets(walletsToRefresh, { hardRefresh: true }));
          navigation.dispatch(
            CommonActions.navigate({
              name: 'UTXOManagement',
              params: {
                data: depositWallet,
                accountType: WalletType.POST_MIX,
                routeName: 'Wallet',
              },
              merge: true,
            })
          );
        }, 3000);
      }
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
      // ToDo: Instead of taking pool_denomination from the lets create a switch case to get it based on UTXO value
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
        ` ${
          err.message ? err.message : `${isRemix ? 'Remix' : 'Mix'} failed`
        }. Please refresh the ${isRemix ? 'Postmix' : 'Premix'} account and try again.`,
        <ToastErrorIcon />
      );
      setTimeout(() => {
        navigation.goBack();
      }, toastDuration);
      captureError(err);
    }
  };

  const renderItem = ({ item, index }) => (
    <TimeLine
      title={item.title}
      subTitle={item.subTitle}
      completed={item.completed}
      isLast={item?.isLast}
      error={item.error}
      index={index}
    />
  );
  function MixDurationText() {
    return (
      <Text style={styles.mixingSubtitleText}>
        Please<Text style={styles.durationTextStyle}>&nbsp;do not exit the app.&nbsp;</Text>
        {isRemix
          ? 'This step takes upto five minutes but can also take longer'
          : 'This step takes a couple of minutes but may take more in some cases'}
      </Text>
    );
  }

  return (
    <Box style={styles.container}>
      <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
        <KeeperHeader
          enableBack={false}
          title={isRemix ? 'Remix Progress' : 'Mix Progress'}
          subtitle={<MixDurationText />}
        />
        <Box style={styles.currentUtxo}>
          <Text color={`${colorMode}.secondaryText`} style={styles.currentUtxoTitle}>
            {'Current UTXO: '}
          </Text>
          <Text
            numberOfLines={1}
            color={`${colorMode}.secondaryText`}
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
      <Box style={styles.note}>
        <Note title="Note:" subtitle="Make sure your phone is sufficiently charged" />
      </Box>
    </Box>
  );
}

const getStyles = (clock) =>
  StyleSheet.create({
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
    animatedCircularborder: {
      borderRadius: 50,
      borderWidth: 1,
      borderColor: Colors.Black,
      borderStyle: 'dotted',
      justifyContent: 'center',
      alignItems: 'center',
      width: hp(35),
      height: hp(35),
      zIndex: 999,
    },
    animatedGreentDot: {
      width: hp(30),
      height: hp(30),
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    whirlpoolIconStyle: {
      transform: [{ rotate: clock }],
    },
    verticalBorderWrapper: {
      marginVertical: hp(5),
    },
    verticalProgressBorderWrapper: {
      marginVertical: hp(10),
    },
    verticalBorder: {
      width: hp(3),
      height: hp(3),
      marginVertical: hp(5),
    },
    timeLineWrapper: {
      alignItems: 'center',
      marginHorizontal: wp(5),
      justifyContent: 'center',
      width: '15%',
    },
    timeLineProgressWrapper: {
      alignItems: 'center',
      marginHorizontal: wp(5),
      justifyContent: 'center',
      width: '15%',
    },
    contentWrapper: {
      flexDirection: 'row',
      width: '100%',
    },
    timeLineTitle: {
      fontSize: 13,
      letterSpacing: 0.4,
      marginLeft: wp(5),
      marginTop: hp(3),
      width: '95%',
      flexWrap: 'wrap',
    },
    progressStepsTextWrapper: {
      flexDirection: 'column',
      width: '85%',
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
