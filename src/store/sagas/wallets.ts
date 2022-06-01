import { all, call, delay, put, select } from 'redux-saga/effects';
import _ from 'lodash';
import * as bip39 from 'bip39';
import { createWatcher } from 'src/store/utilities';
import {
  GET_TESTCOINS,
  GENERATE_SECONDARY_XPRIV,
  RESET_TWO_FA,
  twoFAResetted,
  secondaryXprivGenerated,
  FETCH_FEE_AND_EXCHANGE_RATES,
  exchangeRatesCalculated,
  setAverageTxFee,
  VALIDATE_TWO_FA,
  twoFAValid,
  resetTwoFA,
  generateSecondaryXpriv,
  SYNC_WALLETS,
  getTestcoins,
  UPDATE_WALLET_SETTINGS,
  walletSettingsUpdated,
  walletSettingsUpdateFailed,
  updateWallets,
  setResetTwoFALoader,
  recomputeNetBalance,
  updateGift,
  GENERATE_GIFTS,
  giftCreationSuccess,
  IMPORT_NEW_WALLET,
  refreshWallets,
  REFRESH_WALLETS,
  AUTO_SYNC_WALLETS,
  ADD_NEW_WALLETS,
  newWalletsAdded,
  walletsRefreshStarted,
  walletsRefreshCompleted,
} from '../actions/wallets';
import config, { APP_STAGE } from 'src/core/config';
import { WalletsState } from 'src/store/reducers/wallets';
import WalletOperations from 'src/core/wallets/WalletOperations';
import * as bitcoinJS from 'bitcoinjs-lib';
import WalletUtilities from 'src/core/wallets/WalletUtilities';
import {
  generateWallet,
  generateDonationWallet,
  generateMultiSigWallet,
} from 'src/core/wallets/WalletFactory';
import Relay from 'src/core/services/Relay';
import {
  Wallet,
  ActiveAddressAssignee,
  DonationWallet,
  LightningNode,
  MultiSigWallet,
  MultiSigWalletSpecs,
} from 'src/core/wallets/interfaces/interface';
import { WalletType, NetworkType, WalletVisibility } from 'src/core/wallets/interfaces/enum';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';

export interface newWalletDetails {
  name?: string;
  description?: string;
  is2FAEnabled?: boolean;
  doneeName?: string;
  node?: LightningNode;
}
export interface newWalletsInfo {
  walletType: WalletType;
  walletDetails?: newWalletDetails;
  recreationInstanceNumber?: number;
}

export function getNextFreeAddress(
  dispatch: any,
  wallet: Wallet | MultiSigWallet,
  requester?: ActiveAddressAssignee
) {
  // to be used by react components(w/ dispatch)

  if (!wallet.isUsable) return '';
  if (wallet.type === WalletType.DONATION) return wallet.specs.receivingAddress;

  const { updatedWallet, receivingAddress } = WalletOperations.getNextFreeExternalAddress(
    wallet,
    requester
  );

  dispatch(
    updateWallets({
      wallets: [updatedWallet],
    })
  );
  // dbManager.updateWallet((updatedWallet as Wallet).id, updatedWallet);

  return receivingAddress;
}

export function* getNextFreeAddressWorker(
  wallet: Wallet | MultiSigWallet,
  requester?: ActiveAddressAssignee
) {
  // to be used by sagas(w/o dispatch)

  if (!wallet.isUsable) return '';
  if (wallet.type === WalletType.DONATION) return wallet.specs.receivingAddress;

  const { updatedWallet, receivingAddress } = yield call(
    WalletOperations.getNextFreeExternalAddress,
    wallet,
    requester
  );
  yield put(
    updateWallets({
      wallets: [updatedWallet],
    })
  );
  // yield call( dbManager.updateWallet, ( updatedWallet as Wallet ).id, updatedWallet )
  return receivingAddress;
}

export function* setup2FADetails(app: KeeperApp) {
  const { setupData } = yield call(WalletUtilities.setupTwoFA, app.appId);
  const bithyveXpub = setupData.bhXpub;
  const twoFAKey = setupData.secret;
  const twoFADetails = {
    bithyveXpub,
    twoFAKey,
  };
  const updatedApp = {
    ...app,
    twoFADetails,
  };

  yield call(dbManager.updateKeeperApp, { twoFADetails });
  return updatedApp;
}

function* generateSecondaryXprivWorker({
  payload,
}: {
  payload: { wallet: MultiSigWallet; secondaryMnemonic: string };
}) {
  const { secondaryMnemonic, wallet } = payload;
  const app: KeeperApp = yield call(dbManager.getObject, RealmSchema.KeeperApp);
  const network =
    config.APP_STAGE === APP_STAGE.DEVELOPMENT
      ? bitcoinJS.networks.testnet
      : bitcoinJS.networks.bitcoin;

  const { secondaryXpriv } = yield call(
    WalletUtilities.generateSecondaryXpriv,
    secondaryMnemonic,
    app.secondaryXpub,
    network
  );

  if (secondaryXpriv) {
    (wallet.specs as MultiSigWalletSpecs).xprivs.secondary = secondaryXpriv;
    yield put(
      updateWallets({
        wallets: [wallet],
      })
    );
    // yield call( dbManager.updateWallet, wallet.id, wallet )
    yield put(secondaryXprivGenerated(true));
  } else yield put(secondaryXprivGenerated(false));
}

export const generateSecondaryXprivWatcher = createWatcher(
  generateSecondaryXprivWorker,
  GENERATE_SECONDARY_XPRIV
);

function* resetTwoFAWorker({ payload }: { payload: { secondaryMnemonic: string } }) {
  const app: KeeperApp = yield call(dbManager.getObject, RealmSchema.KeeperApp);
  const { secondaryMnemonic } = payload;
  const network =
    config.APP_STAGE === APP_STAGE.DEVELOPMENT
      ? bitcoinJS.networks.testnet
      : bitcoinJS.networks.bitcoin;
  const { secret: twoFAKey } = yield call(
    WalletUtilities.resetTwoFA,
    app.appId,
    secondaryMnemonic,
    app.secondaryXpub,
    network
  );

  if (twoFAKey) {
    const twoFADetails = {
      ...app.twoFADetails,
      twoFAKey,
    };

    yield call(dbManager.updateKeeperApp, { twoFADetails });
    yield put(twoFAResetted(true));
  } else {
    yield put(twoFAResetted(false));
    throw new Error('Failed to reset twoFA');
  }
}

export const resetTwoFAWatcher = createWatcher(resetTwoFAWorker, RESET_TWO_FA);

function* validateTwoFAWorker({ payload }: { payload: { token: number } }) {
  const app: KeeperApp = yield call(dbManager.getObject, RealmSchema.KeeperApp);
  const { token } = payload;
  try {
    const { valid } = yield call(WalletUtilities.validateTwoFA, app.appId, token);
    if (valid) {
      const twoFADetails = {
        ...app.twoFADetails,
        twoFAValidated: true,
      };

      yield call(dbManager.updateKeeperApp, { twoFADetails });
      yield put(twoFAValid(true));
    } else yield put(twoFAValid(false));
  } catch (error) {
    yield put(twoFAValid(false));
  }
}

export const validateTwoFAWatcher = createWatcher(validateTwoFAWorker, VALIDATE_TWO_FA);

function* feeAndExchangeRatesWorker() {
  const storedExchangeRates = yield select((state) => state.wallets.exchangeRates);
  const storedAverageTxFees = yield select((state) => state.wallets.averageTxFees);
  const currencyCode = yield select((state) => state.preferences.currencyCode);
  try {
    const { exchangeRates, averageTxFees } = yield call(
      Relay.fetchFeeAndExchangeRates,
      currencyCode
    );
    if (!exchangeRates) console.log('Failed to fetch exchange rates');
    else {
      if (JSON.stringify(exchangeRates) !== JSON.stringify(storedExchangeRates))
        yield put(exchangeRatesCalculated(exchangeRates));
    }

    if (!averageTxFees) console.log('Failed to fetch fee rates');
    else {
      if (JSON.stringify(averageTxFees) !== JSON.stringify(storedAverageTxFees))
        yield put(setAverageTxFee(averageTxFees));
    }
  } catch (err) {
    console.log({
      err,
    });
  }
}

export const feeAndExchangeRatesWatcher = createWatcher(
  feeAndExchangeRatesWorker,
  FETCH_FEE_AND_EXCHANGE_RATES
);

function* testcoinsWorker({ payload: testWallet }: { payload: Wallet }) {
  const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(testWallet);
  const network = WalletUtilities.getNetworkByType(testWallet.derivationDetails.networkType);

  const { txid } = yield call(WalletUtilities.getTestcoins, receivingAddress, network);

  if (!txid) console.log('Failed to get testcoins');
  else yield put(refreshWallets([testWallet], {}));
}

export const testcoinsWatcher = createWatcher(testcoinsWorker, GET_TESTCOINS);

export function* addNewWallet(
  walletType: WalletType,
  walletDetails: newWalletDetails,
  recreationInstanceNumber?: number,
  importDetails?: { primaryMnemonic: string; primarySeed: string }
) {
  const app: KeeperApp = yield call(dbManager.getObject, RealmSchema.KeeperApp);
  const { appId, primaryMnemonic, walletShell } = app;
  const { walletInstances } = walletShell;
  const {
    name: walletName,
    description: walletDescription,
    is2FAEnabled,
    doneeName,
  } = walletDetails;

  switch (walletType) {
    case WalletType.TEST:
      const testInstanceCount =
        recreationInstanceNumber !== undefined
          ? recreationInstanceNumber
          : walletInstances[WalletType.TEST]?.length | 0;
      const testWallet: Wallet = yield call(generateWallet, {
        type: WalletType.TEST,
        instanceNum: testInstanceCount,
        walletName: walletName ? walletName : 'Test Wallet',
        walletDescription: 'Testnet Wallet',
        primaryMnemonic,
        networkType: NetworkType.TESTNET,
      });
      return testWallet;

    case WalletType.CHECKING:
      const checkingInstanceCount =
        recreationInstanceNumber !== undefined
          ? recreationInstanceNumber
          : walletInstances[WalletType.CHECKING]?.length | 0;
      const checkingWallet: Wallet = yield call(generateWallet, {
        type: WalletType.CHECKING,
        instanceNum: checkingInstanceCount,
        walletName: walletName ? walletName : 'Checking Wallet',
        walletDescription: walletDescription ? walletDescription : 'Bitcoin Wallet',
        primaryMnemonic,
        networkType:
          config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET,
      });
      return checkingWallet;

    case WalletType.SAVINGS:
      // if( !wallet.secondaryXpub && !wallet.twoFADetails ) throw new Error( 'Fail to create savings wallet; secondary-xpub/twoFADetails missing' )

      const savingsInstanceCount =
        recreationInstanceNumber !== undefined
          ? recreationInstanceNumber
          : walletInstances[WalletType.SAVINGS]?.length | 0;
      const savingsWallet: MultiSigWallet = yield call(generateMultiSigWallet, {
        type: WalletType.SAVINGS,
        instanceNum: savingsInstanceCount,
        walletName: walletName ? walletName : 'Savings Wallet',
        walletDescription: walletDescription ? walletDescription : 'MultiSig Wallet',
        primaryMnemonic,
        secondaryXpub: app.secondaryXpub,
        bithyveXpub: app.twoFADetails?.bithyveXpub,
        networkType:
          config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET,
      });
      return savingsWallet;

    case WalletType.DONATION:
      if (is2FAEnabled)
        if (!app.secondaryXpub && !app.twoFADetails)
          throw new Error('Fail to create savings wallet; secondary-xpub/twoFADetails missing');

      const donationInstanceCount =
        recreationInstanceNumber !== undefined
          ? recreationInstanceNumber
          : walletInstances[walletType]?.length | 0;
      const donationWallet: DonationWallet = yield call(generateDonationWallet, {
        type: walletType,
        instanceNum: donationInstanceCount,
        walletName: 'Donation Wallet',
        walletDescription: walletName ? walletName : 'Receive Donations',
        donationName: walletName,
        donationDescription: walletDescription,
        donee: doneeName ? doneeName : app.appName,
        primaryMnemonic,
        is2FA: is2FAEnabled,
        secondaryXpub: is2FAEnabled ? app.secondaryXpub : null,
        bithyveXpub: is2FAEnabled ? app.twoFADetails?.bithyveXpub : null,
        networkType:
          config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET,
      });
      const { setupSuccessful } = yield call(
        WalletUtilities.setupDonationWallet,
        donationWallet,
        appId
      );
      if (!setupSuccessful) throw new Error('Failed to generate donation wallet');
      return donationWallet;

    case WalletType.SWAN:
    case WalletType.DEPOSIT:
      let defaultWalletName, defaultWalletDescription;
      switch (walletType) {
        case WalletType.SWAN:
          defaultWalletName = 'Swan Bitcoin';
          defaultWalletDescription = 'Register\nand claim $10';
          break;

        case WalletType.DEPOSIT:
          defaultWalletName = 'Deposit Wallet';
          defaultWalletDescription = 'Stack sats';
          break;
      }

      const serviceInstanceCount =
        recreationInstanceNumber !== undefined
          ? recreationInstanceNumber
          : walletInstances[walletType]?.length | 0;
      const serviceWallet: Wallet = yield call(generateWallet, {
        type: walletType,
        instanceNum: serviceInstanceCount,
        walletName: walletName ? walletName : defaultWalletName,
        walletDescription: walletDescription ? walletDescription : defaultWalletDescription,
        primaryMnemonic,
        networkType:
          config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET,
      });
      if (walletType === WalletType.SWAN) serviceWallet.isUsable = false;

      return serviceWallet;

    case WalletType.LIGHTNING:
      const { node } = walletDetails;
      const lnWalletCount =
        recreationInstanceNumber !== undefined
          ? recreationInstanceNumber
          : walletInstances[walletType]?.length | 0;
      const lnWallet: Wallet = yield call(generateWallet, {
        type: walletType,
        instanceNum: lnWalletCount,
        walletName: walletName ? walletName : defaultWalletName,
        walletDescription: walletDescription ? walletDescription : defaultWalletDescription,
        primaryMnemonic,
        networkType:
          config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET,
        node,
      });
      return lnWallet;

    case WalletType.IMPORTED:
      const importedInstanceCount = 0; // imported wallets always have instance number equal to zero(as they're imported using different seeds)
      const importedWallet: Wallet = yield call(generateWallet, {
        type: WalletType.IMPORTED,
        instanceNum: importedInstanceCount,
        walletName: walletName ? walletName : 'Imported Wallet',
        walletDescription: walletDescription ? walletDescription : 'Bitcoin Wallet',
        primaryMnemonic: importDetails.primaryMnemonic,
        networkType:
          config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET,
      });
      return importedWallet;
  }
}

export function* addNewWalletsWorker({ payload: newWalletsInfo }: { payload: newWalletsInfo[] }) {
  const wallets: (Wallet | MultiSigWallet | DonationWallet)[] = [];
  const walletIds = [];
  let testcoinsToWallet;

  for (const { walletType, walletDetails, recreationInstanceNumber } of newWalletsInfo) {
    const wallet: Wallet | MultiSigWallet | DonationWallet = yield call(
      addNewWallet,
      walletType,
      walletDetails || {},
      recreationInstanceNumber
    );
    walletIds.push(wallet.id);
    wallets.push(wallet);
    // yield put( walletShellOrderedToFront( walletShell ) )
    if (wallet.type === WalletType.TEST && wallet.derivationDetails.instanceNum === 0)
      testcoinsToWallet = wallet;
  }

  const app: KeeperApp = yield call(dbManager.getObject, RealmSchema.KeeperApp);
  let presentWalletInstances = _.cloneDeep(app.walletShell.walletInstances);
  wallets.forEach((wallet: Wallet | MultiSigWallet | DonationWallet) => {
    if (presentWalletInstances[wallet.type]) {
      if (!presentWalletInstances[wallet.type].includes(wallet.id))
        presentWalletInstances[wallet.type].push(wallet.id);
    } else
      presentWalletInstances = {
        ...presentWalletInstances,
        [wallet.type]: [wallet.id],
      };
  });

  const updatedApp: KeeperApp = {
    ...app,
    walletShell: {
      ...app.walletShell,
      walletInstances: presentWalletInstances,
    },
  };
  yield call(dbManager.updateKeeperApp, updatedApp);
  yield put(
    newWalletsAdded({
      wallets: wallets,
    })
  );
  // yield call( dbManager.createWallets, wallets )
  if (testcoinsToWallet) yield put(getTestcoins(testcoinsToWallet)); // pre-fill test-wallet w/ testcoins
}

export const addNewWalletsWatcher = createWatcher(addNewWalletsWorker, ADD_NEW_WALLETS);

export function* importNewWalletWorker({
  payload,
}: {
  payload: {
    mnemonic: string;
    walletDetails?: newWalletDetails;
  };
}) {
  const wallets: (Wallet | MultiSigWallet | DonationWallet)[] = [];
  const walletIds = [];
  const newWalletsInfo: newWalletsInfo[] = [
    {
      walletType: WalletType.IMPORTED,
      walletDetails: payload.walletDetails,
    },
  ];

  const importDetails = {
    primaryMnemonic: payload.mnemonic,
    primarySeed: bip39.mnemonicToSeedSync(payload.mnemonic).toString('hex'),
  };

  for (const { walletType, walletDetails, recreationInstanceNumber } of newWalletsInfo) {
    const wallet: Wallet | MultiSigWallet | DonationWallet = yield call(
      addNewWallet,
      walletType,
      walletDetails || {},
      recreationInstanceNumber,
      importDetails
    );
    walletIds.push(wallet.id);
    wallets.push(wallet);
  }

  const app: KeeperApp = yield call(dbManager.getObject, RealmSchema.KeeperApp);
  let presentWalletInstances = _.cloneDeep(app.walletShell.walletInstances);
  wallets.forEach((wallet: Wallet | MultiSigWallet | DonationWallet) => {
    if (presentWalletInstances[wallet.type]) {
      if (!presentWalletInstances[wallet.type].includes(wallet.id))
        presentWalletInstances[wallet.type].push(wallet.id);
    } else
      presentWalletInstances = {
        ...presentWalletInstances,
        [wallet.type]: [wallet.id],
      };
  });

  const updatedApp: KeeperApp = {
    ...app,
    walletShell: {
      ...app.walletShell,
      walletInstances: presentWalletInstances,
    },
  };
  yield call(dbManager.updateKeeperApp, updatedApp);
  yield put(
    newWalletsAdded({
      wallets,
    })
  );
  yield put(
    refreshWallets(wallets, {
      hardRefresh: true,
    })
  );
  // yield call( dbManager.createWallets, wallets )
}

export const importNewWalletWatcher = createWatcher(importNewWalletWorker, IMPORT_NEW_WALLET);

function* updateWalletSettingsWorker({
  payload,
}: {
  payload: {
    wallet: Wallet;
    settings: {
      walletName?: string;
      walletDescription?: string;
      visibility?: WalletVisibility;
    };
  };
}) {
  const { wallet, settings } = payload;
  const { walletName, walletDescription, visibility } = settings;

  try {
    if (walletName) wallet.presentationData.walletName = walletName;
    if (walletDescription) wallet.presentationData.walletDescription = walletDescription;
    if (visibility) wallet.presentationData.walletVisibility = visibility;

    yield put(
      updateWallets({
        wallets: [wallet],
      })
    );
    // yield call( dbManager.updateWallet, wallet.id, wallet )
    // yield put( updateWalletImageHealth( {
    //   updateWallets: true,
    //   walletIds: [ wallet.id ]
    // } ) )
    if (visibility === WalletVisibility.DEFAULT) {
      yield put(walletSettingsUpdated());
    }
  } catch (error) {
    yield put(
      walletSettingsUpdateFailed({
        error,
      })
    );
  }
}

export const updateWalletSettingsWatcher = createWatcher(
  updateWalletSettingsWorker,
  UPDATE_WALLET_SETTINGS
);

function* syncWalletsWorker({
  payload,
}: {
  payload: {
    wallets: (Wallet | MultiSigWallet | DonationWallet)[];
    options: {
      hardRefresh?: boolean;
      syncDonationWallet?: boolean;
    };
  };
}) {
  const { wallets, options } = payload;
  const network = WalletUtilities.getNetworkByType(wallets[0].derivationDetails.networkType);

  if (options.syncDonationWallet) {
    // can only sync one donation instance at a time
    const donationWallet = wallets[0] as DonationWallet;

    const { synchedWallet, txsFound } = yield call(
      WalletOperations.syncDonationWallet,
      donationWallet,
      network
    );

    const synchedWallets = {
      [synchedWallet.id]: synchedWallet,
    };
    return {
      synchedWallets,
      txsFound,
      activeAddressesWithNewTxsMap: {},
    };
  } else {
    const { synchedWallets, txsFound, activeAddressesWithNewTxsMap } = yield call(
      WalletOperations.syncWallets,
      wallets,
      network,
      options.hardRefresh
    );

    return {
      synchedWallets,
      txsFound,
      activeAddressesWithNewTxsMap,
    };
  }
}

export const syncWalletsWatcher = createWatcher(syncWalletsWorker, SYNC_WALLETS);

function* refreshWalletsWorker({
  payload,
}: {
  payload: {
    wallets: (Wallet | MultiSigWallet | DonationWallet)[];
    options: { hardRefresh?: boolean; syncDonationWallet?: boolean };
  };
}) {
  const options: { hardRefresh?: boolean; syncDonationWallet?: boolean } = payload.options;
  yield put(walletsRefreshStarted(payload.wallets));

  const walletIds = [];
  const walletsToSync: (Wallet | MultiSigWallet | DonationWallet)[] = [];
  for (const wallet of payload.wallets) {
    walletsToSync.push(wallet);
  }

  const { synchedWallets, activeAddressesWithNewTxsMap } = yield call(syncWalletsWorker, {
    payload: {
      wallets: walletsToSync,
      options,
    },
  });

  yield put(
    updateWallets({
      wallets: synchedWallets,
    })
  );
  yield put(walletsRefreshCompleted(payload.wallets));

  let computeNetBalance = false;
  for (const [key, synchedWallet] of Object.entries(synchedWallets)) {
    // yield call( dbManager.updateWallet, ( synchedWallet as Wallet ).id, synchedWallet )
    if ((synchedWallet as Wallet).specs.hasNewTxn) {
      walletIds.push((synchedWallet as Wallet).id);
      computeNetBalance = true;
    }
  }
  if (walletIds.length > 0) {
    // TODO: Re-enable wallet image updates across all relevant sagas(the ones cotaining: updateWalletImageHealth)
    // yield put( updateWalletImageHealth( {
    //   updateWallets: true,
    //   walletIds: walletIds
    // } ) )
  }

  if (computeNetBalance) yield put(recomputeNetBalance());

  // update F&F channels if any new txs found on an assigned address
  // if( Object.keys( activeAddressesWithNewTxsMap ).length )  yield call( updatePaymentAddressesToChannels, activeAddressesWithNewTxsMap, synchedWallets )
}

export const refreshWalletsWatcher = createWatcher(refreshWalletsWorker, REFRESH_WALLETS);

function* autoWalletsSyncWorker({
  payload,
}: {
  payload: { syncAll?: boolean; hardRefresh?: boolean };
}) {
  const { syncAll, hardRefresh } = payload;

  const walletState: WalletsState = yield select((state) => state.wallets);
  const wallets: (Wallet | MultiSigWallet | DonationWallet)[] = walletState.wallets;

  const walletsToSync: (Wallet | MultiSigWallet)[] = [];
  const testWalletsToSync: Wallet[] = []; // Note: should be synched separately due to network difference(testnet)
  const donationWalletsToSync: DonationWallet[] = [];
  const lnWalletsToSync: Wallet[] = [];

  for (const wallet of wallets) {
    if (syncAll || wallet.presentationData.walletVisibility === WalletVisibility.DEFAULT) {
      if (!wallet.isUsable) continue;

      switch (wallet.type) {
        case WalletType.TEST:
          if (syncAll) testWalletsToSync.push(wallet);
          break;

        case WalletType.DONATION:
          donationWalletsToSync.push(wallet as DonationWallet);
          break;

        case WalletType.LIGHTNING:
          lnWalletsToSync.push(wallet);
          break;

        default:
          walletsToSync.push(wallet);
      }
    }
  }

  if (walletsToSync.length)
    yield call(refreshWalletsWorker, {
      payload: {
        wallets: walletsToSync,
        options: {
          hardRefresh,
        },
      },
    });

  if (syncAll && testWalletsToSync.length)
    yield call(refreshWalletsWorker, {
      payload: {
        wallets: testWalletsToSync,
        options: {
          hardRefresh,
        },
      },
    });

  // if( lnShellsToSync.length ) yield call( refreshLNShellsWorker, {
  //   payload: {
  //     shells: lnShellsToSync,
  //   }
  // } )

  // if( donationShellsToSync.length )
  //   try {
  //     for( const donationWallet of donationShellsToSync ) {
  //       yield call( refreshWalletshellsWorker, {
  //         payload: {
  //           shells: [ donationWallet ],
  //           options: {
  //             syncDonationWallet: true
  //           }
  //         }
  //       } )
  //     }
  //   }
  //   catch( err ){
  //     console.log( `Sync via xpub agent failed w/ the following err: ${err}` )
  //   }
}

export const autoWalletsSyncWatcher = createWatcher(autoWalletsSyncWorker, AUTO_SYNC_WALLETS);

// --- GIFT SAGAS ---

// export async function generateGiftLink( giftToSend: Gift, walletName: string, fcmToken: string, themeId: GiftThemeId, note?: string, encryptionType?: DeepLinkEncryptionType, generateShortLink?: boolean, secretPhrase?: string, secretPhraseHint?: string ) {
//   const encryptionKey = BHROperations.generateKey( config.CIPHER_SPEC.keyLength )
//   try{
//     giftToSend.status = GiftStatus.SENT
//     giftToSend.type = GiftType.SENT

//     // set timestamps
//     giftToSend.timestamps.sent = Date.now()
//     // remove successive timestamps(if exist)
//     delete giftToSend.timestamps.accepted
//     delete giftToSend.timestamps.reclaimed

//     giftToSend.note = note
//     giftToSend.sender.walletName = walletName
//     giftToSend.themeId = themeId

//     let previousChannelAddress
//     if( giftToSend.channelAddress ) previousChannelAddress = giftToSend.channelAddress // gift is being resent
//     giftToSend.channelAddress = giftToSend.id.slice( 0, 10 ) + Math.floor( Math.random() * 10e4 )

//     const giftMetaData: GiftMetaData = {
//       status: giftToSend.status,
//       validity: giftToSend.validitySpan? {
//         sentAt: giftToSend.timestamps.sent,
//         validitySpan: giftToSend.validitySpan
//       }: null,
//       exclusiveGiftCode: giftToSend.exclusiveGiftCode,
//       notificationInfo: {
//         walletId: giftToSend.sender.walletId,
//         FCM: fcmToken,
//       }
//     }

//     Relay.updateGiftChannel( encryptionKey, giftToSend, giftMetaData, previousChannelAddress ) // non-awaited upload

//     let deepLinkEncryptionKey
//     switch ( encryptionType ) {
//         case DeepLinkEncryptionType.DEFAULT:
//           giftToSend.deepLinkConfig = null // removes previous link config(if any)
//           break

//         case DeepLinkEncryptionType.OTP:
//           deepLinkEncryptionKey = TrustedContactsOperations.generateKey( 6 ).toUpperCase()
//           giftToSend.deepLinkConfig = {
//             encryptionType: DeepLinkEncryptionType.OTP,
//             encryptionKey: deepLinkEncryptionKey,
//           }
//           break

//         case DeepLinkEncryptionType.LONG_OTP:
//           deepLinkEncryptionKey = TrustedContactsOperations.generateKey( 15 ).toUpperCase()
//           giftToSend.deepLinkConfig = {
//             encryptionType: DeepLinkEncryptionType.LONG_OTP,
//             encryptionKey: deepLinkEncryptionKey,
//           }
//           break

//         case DeepLinkEncryptionType.SECRET_PHRASE:
//           deepLinkEncryptionKey = secretPhrase
//           giftToSend.deepLinkConfig = {
//             encryptionType: DeepLinkEncryptionType.SECRET_PHRASE,
//             encryptionKey: deepLinkEncryptionKey,
//           }
//           break

//         default:
//           giftToSend.deepLinkConfig = null // removes previous link config(if any)
//           break
//     }

//     const { deepLink, encryptedChannelKeys, encryptionType: deepLinkEncryptionType, encryptionHint, shortLink } = await generateDeepLink( {
//       deepLinkKind: DeepLinkKind.GIFT,
//       encryptionType: encryptionType? encryptionType: DeepLinkEncryptionType.DEFAULT,
//       encryptionKey: deepLinkEncryptionKey,
//       walletName: walletName,
//       keysToEncrypt: encryptionKey,
//       generateShortLink: encryptionType !== DeepLinkEncryptionType.DEFAULT ? generateShortLink: false,
//       extraData: {
//         channelAddress: giftToSend.channelAddress,
//         amount: giftToSend.amount,
//         note,
//         themeId: giftToSend.themeId,
//         giftHint: secretPhraseHint
//       }
//     } )

//     return {
//       updatedGift: giftToSend, deepLink, encryptedChannelKeys, encryptionType: deepLinkEncryptionType, encryptionHint, deepLinkEncryptionOTP: deepLinkEncryptionKey, channelAddress: giftToSend.channelAddress, shortLink, encryptionKey
//     }
//   } catch( err ){
//     console.log( 'An error occured while generating gift: ', err )
//   }
// }

// export function* generateGiftstWorker( { payload } : {payload: { amounts: number[], walletId?: string, includeFee?: boolean, exclusiveGifts?: boolean, validity?: number }} ) {
//   const app: KeeperApp = yield call(dbManager.getObject, RealmSchema.KeeperApp);
//   const walletsState: WalletsState = yield select( state => state.wallets )
//   const wallets: (Wallet | MultiSigWallet | DonationWallet)[] = walletsState.wallets

//   let walletId = payload.walletId
//   if( !walletId ){
//     for( const id in wallets ){
//       const wallet = wallets[ id ]
//       if( wallet.type === WalletType.CHECKING && wallet.instanceNum === 0 ){
//         walletId = id
//         break
//       }
//     }
//   }

//   const wallet = wallets[ walletId ]
//   const averageTxFeeByNetwork = walletsState.averageTxFees[ wallet.networkType ]
//   const walletDetails = {
//     walletId: wallet.walletId,
//     walletName: wallet.walletName
//   }

//   try{
//     const { txid, gifts } = yield call( WalletOperations.generateGifts, walletDetails, wallet, payload.amounts, averageTxFeeByNetwork, payload.includeFee, payload.exclusiveGifts, payload.validity )
//     if( txid ) {
//       const giftIds = []
//       for( const giftId in gifts ){
//         giftIds.push( gifts[ giftId ].id )
//         yield put( updateGift( gifts[ giftId ] ) )
//       }
//       yield put( giftCreationSuccess( true ) )

//       // yield call( dbManager.createGifts, gifts )
//       yield put( updateWalletImageHealth( {
//         updateGifts: true,
//         giftIds: giftIds
//       } ) )

//       // refersh the wallet
//       let shellToSync: WalletShell
//       for( const walletShell of walletsState.walletShells ){
//         if( walletShell.primarySubWallet.id === wallet.id ) shellToSync = walletShell
//       }
//       yield put( refreshWalletshells( [ shellToSync ], {
//       } ) )
//     } else {
//       console.log( 'Gifts generation failed' )
//       yield put( giftCreationSuccess( false ) )
//     }

//   } catch( err ){
//     yield put( giftCreationSuccess( false ) )
//   }
// }

// export const generateGiftsWatcher = createWatcher(
//   generateGiftstWorker,
//   GENERATE_GIFTS,
// )

// --- PERMANENT CHANNEL SAGAS ---

// function* updatePaymentAddressesToChannels( activeAddressesWithNewTxsMap: {
//   [walletId: string]: ActiveAddresses
// }, synchedWallets ){
//   const app: KeeperApp = yield call(dbManager.getObject, RealmSchema.KeeperApp);
//   const channelUpdates = []
//   for( const walletId of Object.keys( activeAddressesWithNewTxsMap ) ){
//     const newTxActiveAddresses: ActiveAddresses = activeAddressesWithNewTxsMap[ walletId ]

//     for( const address of Object.keys( newTxActiveAddresses.external ) ) {
//       const { assignee } = newTxActiveAddresses.external[ address ]
//       if( assignee.type === WalletType.FNF ){
//         const channelKey = assignee.id
//         const streamUpdates: UnecryptedStreamData = {
//           streamId: TrustedContactsOperations.getStreamId( wallet.walletId ),
//           primaryData: {
//             paymentAddresses: {
//               [ ( synchedWallets[ walletId ] as Wallet ).type ]: yield call( getNextFreeAddressWorker, synchedWallets[ walletId ], assignee )
//             }
//           },
//           metaData: {
//             flags:{
//               active: true,
//               newData: true,
//               lastSeen: Date.now(),
//             },
//           }
//         }

//         const contactInfo: ContactInfo = {
//           channelKey: channelKey,
//         }
//         channelUpdates.push( {
//           contactInfo, streamUpdates
//         } )
//       }
//     }
//   }

//   if( Object.keys( channelUpdates ).length )
//     yield call ( syncPermanentChannelsWorker, {
//       payload: {
//         permanentChannelsSyncKind: PermanentChannelsSyncKind.SUPPLIED_CONTACTS,
//         channelUpdates
//       }
//     } )
// }

// --- Unused Wallet Sagas ---

// function* walletCheckWoker( { payload } ) {
//   const { shellId } = payload
//   const walletShells: WalletShell[] = yield select( ( state ) => state.wallets.walletShells )
//   const wallets: (Wallet | MultiSigWallet | DonationWallet)[] = yield select( ( state ) => state.wallets.wallets )
//   const shellToUpdate = walletShells.findIndex( s => s.id === shellId )
//   walletShells[ shellToUpdate ].primarySubWallet.hasNewTxn = false
//   const accId = walletShells[ shellToUpdate ].primarySubWallet.id
//   wallets[ accId ].hasNewTxn = false
//   yield put( walletChecked( walletShells, wallets ) )
//   // yield call( dbManager.markWalletChecked, accId )
// }

// export const walletCheckWatcher = createWatcher(
//   walletCheckWoker,
//   MARK_WALLET_CHECKED
// )

// function* txnReadWoker( { payload } ) {
//   const { shellId, txIds } = payload
//   const walletShells: WalletShell[] = yield select( ( state ) => state.wallets.walletShells )
//   const shellToUpdate = walletShells.findIndex( s => s.id === shellId )
//   const wallets: (Wallet | MultiSigWallet | DonationWallet)[] = yield select( ( state ) => state.wallets.wallets )
//   const accId = walletShells[ shellToUpdate ].primarySubWallet.id
//   txIds.forEach( txId => {
//     const shellTxIndex = walletShells[ shellToUpdate ].primarySubWallet.transactions.findIndex( tx => tx.txid === txId )
//     walletShells[ shellToUpdate ].primarySubWallet.transactions[ shellTxIndex ].isNew = false
//     wallets[ accId ].hasNewTxn = false
//     const accTxIndex = wallets[ accId ].transactions.findIndex( tx => tx.txid === txId )
//     wallets[ accId ].transactions[ accTxIndex ].isNew = false
//   } )
//   yield put( readTxn( walletShells, wallets ) )
//   // yield call( dbManager.updateTransactions, txIds, {
//   //   isNew: false
//   // } )
// }

// export const txnReadWatcher = createWatcher(
//   txnReadWoker,
//   MARK_READ_TRANSACTION
// )

// function* refreshLNShellsWorker( { payload }: { payload: {
//   shells: WalletShell[],
// }} ){
//   const walletShells: WalletShell[] = payload.shells
//   const walletState: WalletsState = yield select(
//     ( state ) => state.wallets
//   )
//   const wallets: (Wallet | MultiSigWallet | DonationWallet)[] = walletState.wallets
//   yield put( walletShellRefreshStarted( walletShells ) )
//   const walletsToSync = {
//   }
//   for( const walletShell of walletShells ){
//     walletsToSync[ walletShell.primarySubWallet.id ] = wallets[ walletShell.primarySubWallet.id ]
//   }
//   const { synchedWallets } = yield call( syncLnWalletsWorker, {
//     payload: {
//       wallets: walletsToSync,
//     }
//   } )
//   yield put( updateWalletshells( {
//     wallets: synchedWallets
//   } ) )
//   yield put( recomputeNetBalance() )
//   yield put( walletShellRefreshCompleted( walletShells ) )
// }

// function* syncLnWalletsWorker( { payload }: {payload: {
//   wallets: (Wallet | MultiSigWallet | DonationWallet)[] }} ) {
//   const { wallets } = payload
//   const nodesToSync: LightningNode [] = []
//   for( const wallet of wallets){
//     nodesToSync.push( wallet.node )
//   }
//   const res = yield call( RESTUtils.getNodeBalance, nodesToSync[ 0 ]  )
//   for( const wallet of wallets ){
//     wallet.balances.confirmed = Number( res[ 0 ].total_balance ) + Number( res[ 1 ].balance )
//   }
//   return {
//     synchedWallets: wallets
//   }
// }

// function* createSmNResetTFAOrXPrivWorker( { payload }: { payload: { qrdata: string, QRModalHeader: string, walletShell: WalletShell } } ) {
//   try {
//     const { qrdata, QRModalHeader, walletShell } = payload
//     const app: KeeperApp = yield call(dbManager.getObject, RealmSchema.KeeperApp);
//     const walletId = wallet.walletId
//     const trustedContacts: Trusted_Contacts = yield select( ( state ) => state.trustedContacts.contacts )
//     let secondaryMnemonic
//     const sharesArray = [ wallet.smShare ]
//     const qrDataObj = JSON.parse( qrdata )
//     let currentContact: TrustedContact
//     let channelKey: string
//     if( trustedContacts ){
//       for( const ck of Object.keys( trustedContacts ) ){
//         channelKey=ck
//         currentContact = trustedContacts[ ck ]
//         if( currentContact.permanentChannelAddress == qrDataObj.channelId ){
//           break
//         }
//       }
//     }
//     const res = yield call( TrustedContactsOperations.retrieveFromStream, {
//       walletId, channelKey, options: {
//         retrieveSecondaryData: true,
//       }, secondaryChannelKey: qrDataObj.secondaryChannelKey
//     } )
//     const shard: string = res.secondaryData.secondaryMnemonicShard
//     sharesArray.push( shard )
//     if( sharesArray.length>1 ){
//       secondaryMnemonic = BHROperations.getMnemonics( sharesArray )
//     }
//     if ( QRModalHeader === 'Reset 2FA' ) {
//       yield put( resetTwoFA( secondaryMnemonic.mnemonic ) )
//     } else if ( QRModalHeader === 'Sweep Funds' ) {
//       yield put( generateSecondaryXpriv( walletShell, secondaryMnemonic.mnemonic ) )
//     }
//   } catch ( error ) {
//     yield put( setResetTwoFALoader( false ) )
//     console.log( 'error CREATE_SM_N_RESETTFA_OR_XPRIV', error )
//   }
// }

// export const createSmNResetTFAOrXPrivWatcher = createWatcher(
//   createSmNResetTFAOrXPrivWorker,
//   CREATE_SM_N_RESETTFA_OR_XPRIV
// )
