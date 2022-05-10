import { all, call, delay, put, select } from 'redux-saga/effects'
import { createWatcher } from '../utilities'
import {
  GET_TESTCOINS,
  GENERATE_SECONDARY_XPRIV,
  RESET_TWO_FA,
  twoFAResetted,
  UPDATE_DONATION_PREFERENCES,
  secondaryXprivGenerated,
  ADD_NEW_ACCOUNT_SHELLS,
  newAccountShellsAdded,
  ReassignTransactionsActionPayload,
  REASSIGN_TRANSACTIONS,
  transactionReassignmentSucceeded,
  transactionReassignmentFailed,
  MergeAccountShellsActionPayload,
  MERGE_ACCOUNT_SHELLS,
  accountShellMergeSucceeded,
  accountShellMergeFailed,
  REFRESH_ACCOUNT_SHELLS,
  AUTO_SYNC_SHELLS,
  accountShellRefreshCompleted,
  accountShellRefreshStarted,
  FETCH_FEE_AND_EXCHANGE_RATES,
  exchangeRatesCalculated,
  setAverageTxFee,
  VALIDATE_TWO_FA,
  twoFAValid,
  CREATE_SM_N_RESETTFA_OR_XPRIV,
  resetTwoFA,
  generateSecondaryXpriv,
  SYNC_ACCOUNTS,
  MARK_ACCOUNT_CHECKED,
  MARK_READ_TRANSACTION,
  updateAccountShells,
  getTestcoins,
  refreshAccountShells,
  UPDATE_ACCOUNT_SETTINGS,
  accountSettingsUpdated,
  accountSettingsUpdateFailed,
  updateAccounts,
  RESTORE_ACCOUNT_SHELLS,
  readTxn,
  accountChecked,
  autoSyncShells,
  setResetTwoFALoader,
  recomputeNetBalance,
  updateGift,
  GENERATE_GIFTS,
  giftCreationSuccess,
  updateAccountSettings,
  IMPORT_NEW_ACCOUNT,
  LOGIN_WITH_HEXA,
} from '../actions/accounts'
// import {
//   setAllowSecureAccount,
//   updateWalletImageHealth
// } from '../actions/BHR'
import {
  Account,
  Accounts,
  AccountType,
  ActiveAddressAssignee,
  ActiveAddresses,
  ContactInfo,
  DeepLinkEncryptionType,
  DeepLinkKind,
  DonationAccount,
  Gift,
  GiftMetaData,
  GiftStatus,
  GiftThemeId,
  GiftType,
  MultiSigAccount,
  NetworkType,
  TrustedContact,
  Trusted_Contacts,
  UnecryptedStreamData,
  Wallet,
  LNNode,
  DerivationPurpose
} from '../../core/interfaces/Interface'
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces'
import AccountShell from '../../common/data/models/AccountShell'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'
import SyncStatus from '../../common/data/enums/SyncStatus'
import config from '../../core/config'
import { AccountsState } from '../reducers/accounts'
import AccountOperations from '../../core/accounts/AccountOperations'
import * as bitcoinJS from 'bitcoinjs-lib'
import AccountUtilities from '../../core/accounts/AccountUtilities'
import { generateAccount, generateDonationAccount, generateMultiSigAccount } from '../../core/accounts/AccountFactory'
import { APP_STAGE } from '../../core/config'
import * as bip39 from 'bip39'
import crypto from 'crypto'
import TestSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/TestSubAccountInfo'
import CheckingSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/CheckingSubAccountInfo'
import SavingsSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/SavingsSubAccountInfo'
import DonationSubAccountInfo from '../../common/data/models/SubAccountInfo/DonationSubAccountInfo'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import LightningSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/LightningSubAccountInfo'

import _ from 'lodash'
import Relay from '../../core/utilities/Relay'
import AccountVisibility from '../../common/data/enums/AccountVisibility'
import TrustedContactsOperations from '../../core/trusted_contacts/TrustedContactsOperations'
import { updateWallet } from '../actions/storage'
import FullyImportedWalletSubAccountInfo from 'src/common/data/models/SubAccountInfo/ImportedWalletSubAccounts/FullyImportedWalletSubAccountInfo'


// to be used by react components(w/ dispatch)
export function getNextFreeAddress(dispatch: any, account: Account | MultiSigAccount, requester?: ActiveAddressAssignee) {
  if (!account.isUsable) return ''
  if (account.type === AccountType.DONATION_ACCOUNT) return account.receivingAddress

  const { updatedAccount, receivingAddress } = AccountOperations.getNextFreeExternalAddress(account, requester)
  dispatch(updateAccounts({
    accounts: {
      [updatedAccount.id]: updatedAccount
    }
  }))
  // dbManager.updateAccount( ( updatedAccount as Account ).id, updatedAccount )
  return receivingAddress
}

// to be used by sagas(w/o dispatch)
export function* getNextFreeAddressWorker(account: Account | MultiSigAccount, requester?: ActiveAddressAssignee) {
  if (!account.isUsable) return ''
  if (account.type === AccountType.DONATION_ACCOUNT) return account.receivingAddress

  const { updatedAccount, receivingAddress } = yield call(AccountOperations.getNextFreeExternalAddress, account, requester)
  yield put(updateAccounts({
    accounts: {
      [updatedAccount.id]: updatedAccount
    }
  }))
  // yield call( dbManager.updateAccount, ( updatedAccount as Account ).id, updatedAccount )
  return receivingAddress
}

export function* syncAccountsWorker({ payload }: {
  payload: {
    accounts: Accounts,
    options: {
      hardRefresh?: boolean;
      syncDonationAccount?: boolean,
    }
  }
}) {
  const { accounts, options } = payload
  const network = AccountUtilities.getNetworkByType(Object.values(accounts)[0].networkType)

  if (options.syncDonationAccount) {
    // can only sync one donation instance at a time
    const donationAccount = (Object.values(accounts)[0] as DonationAccount)

    const { synchedAccount, txsFound } = yield call(
      AccountOperations.syncDonationAccount,
      donationAccount,
      network)

    const synchedAccounts = {
      [synchedAccount.id]: synchedAccount
    }
    return {
      synchedAccounts, txsFound, activeAddressesWithNewTxsMap: {
      }
    }
  } else {
    const { synchedAccounts, txsFound, activeAddressesWithNewTxsMap } = yield call(
      AccountOperations.syncAccounts,
      accounts,
      network,
      options.hardRefresh)

    return {
      synchedAccounts, txsFound, activeAddressesWithNewTxsMap
    }
  }
}

export const syncAccountsWatcher = createWatcher(
  syncAccountsWorker,
  SYNC_ACCOUNTS
)

function* accountCheckWoker({ payload }) {
  const { shellId } = payload
  const accountShells: AccountShell[] = yield select((state) => state.accounts.accountShells)
  const accounts: Accounts = yield select((state) => state.accounts.accounts)
  const shellToUpdate = accountShells.findIndex(s => s.id === shellId)
  accountShells[shellToUpdate].primarySubAccount.hasNewTxn = false
  const accId = accountShells[shellToUpdate].primarySubAccount.id
  accounts[accId].hasNewTxn = false
  yield put(accountChecked(accountShells, accounts))
  // yield call( dbManager.markAccountChecked, accId )
}

export const accountCheckWatcher = createWatcher(
  accountCheckWoker,
  MARK_ACCOUNT_CHECKED
)

function* txnReadWoker({ payload }) {
  const { shellId, txIds } = payload
  const accountShells: AccountShell[] = yield select((state) => state.accounts.accountShells)
  const shellToUpdate = accountShells.findIndex(s => s.id === shellId)
  const accounts: Accounts = yield select((state) => state.accounts.accounts)
  const accId = accountShells[shellToUpdate].primarySubAccount.id
  txIds.forEach(txId => {
    const shellTxIndex = accountShells[shellToUpdate].primarySubAccount.transactions.findIndex(tx => tx.txid === txId)
    accountShells[shellToUpdate].primarySubAccount.transactions[shellTxIndex].isNew = false
    accounts[accId].hasNewTxn = false
    const accTxIndex = accounts[accId].transactions.findIndex(tx => tx.txid === txId)
    accounts[accId].transactions[accTxIndex].isNew = false
  })
  yield put(readTxn(accountShells, accounts))
  // yield call( dbManager.updateTransactions, txIds, {
  //   isNew: false
  // } )
}

export const txnReadWatcher = createWatcher(
  txnReadWoker,
  MARK_READ_TRANSACTION
)

function* generateSecondaryXprivWorker({ payload }: { payload: { accountShell: AccountShell, secondaryMnemonic: string } }) {
  const { secondaryMnemonic, accountShell } = payload
  const wallet: Wallet = yield select((state) => state.storage.wallet)
  const accountsState: AccountsState = yield select((state) => state.accounts)
  const account = (accountsState.accounts[accountShell.primarySubAccount.id] as MultiSigAccount)
  const network = config.APP_STAGE === APP_STAGE.DEVELOPMENT ? bitcoinJS.networks.testnet : bitcoinJS.networks.bitcoin

  const { secondaryXpriv } = yield call(AccountUtilities.generateSecondaryXpriv,
    secondaryMnemonic,
    wallet.secondaryXpub,
    network,
  )

  if (secondaryXpriv) {
    account.xprivs.secondary = secondaryXpriv
    yield put(updateAccounts({
      accounts: {
        [account.id]: account
      }
    }))
    // yield call( dbManager.updateAccount, account.id, account )
    yield put(secondaryXprivGenerated(true))
  }
  else yield put(secondaryXprivGenerated(false))
}

export const generateSecondaryXprivWatcher = createWatcher(
  generateSecondaryXprivWorker,
  GENERATE_SECONDARY_XPRIV
)

function* testcoinsWorker({ payload: testAccount }: { payload: Account }) {
  const { receivingAddress } = AccountOperations.getNextFreeExternalAddress(testAccount)
  const network = AccountUtilities.getNetworkByType(testAccount.networkType)

  const { txid } = yield call(AccountUtilities.getTestcoins, receivingAddress, network)

  if (!txid) console.log('Failed to get testcoins')
  else {
    const accountsState: AccountsState = yield select((state) => state.accounts)
    let testShell: AccountShell
    accountsState.accountShells.forEach((shell) => {
      if (shell.primarySubAccount.id === testAccount.id) testShell = shell
    })
    if (testShell) yield put(refreshAccountShells([testShell], {
    }))
  }
}

export const testcoinsWatcher = createWatcher(testcoinsWorker, GET_TESTCOINS)

function* feeAndExchangeRatesWorker() {
  const storedExchangeRates = yield select(
    (state) => state.accounts.exchangeRates
  )
  const storedAverageTxFees = yield select(
    (state) => state.accounts.averageTxFees
  )
  const currencyCode = yield select(
    (state) => state.preferences.currencyCode
  )
  try {
    const { exchangeRates, averageTxFees } = yield call(Relay.fetchFeeAndExchangeRates, currencyCode)
    if (!exchangeRates) console.log('Failed to fetch exchange rates')
    else {
      if (
        JSON.stringify(exchangeRates) !== JSON.stringify(storedExchangeRates)
      )
        yield put(exchangeRatesCalculated(exchangeRates))
    }

    if (!averageTxFees) console.log('Failed to fetch fee rates')
    else {
      if (
        JSON.stringify(averageTxFees) !== JSON.stringify(storedAverageTxFees)
      )
        yield put(setAverageTxFee(averageTxFees))
    }
  } catch (err) {
    console.log({
      err
    })
  }
}

export const feeAndExchangeRatesWatcher = createWatcher(
  feeAndExchangeRatesWorker,
  FETCH_FEE_AND_EXCHANGE_RATES
)

function* resetTwoFAWorker({ payload }: { payload: { secondaryMnemonic: string } }) {
  const wallet: Wallet = yield select((state) => state.storage.wallet)
  const { secondaryMnemonic } = payload
  const network = config.APP_STAGE === APP_STAGE.DEVELOPMENT ? bitcoinJS.networks.testnet : bitcoinJS.networks.bitcoin
  const { secret: twoFAKey } = yield call(AccountUtilities.resetTwoFA, wallet.walletId, secondaryMnemonic, wallet.secondaryXpub, network)

  if (twoFAKey) {
    const details2FA = {
      ...wallet.details2FA,
      twoFAKey
    }
    const updatedWallet = {
      ...wallet,
      details2FA
    }
    // yield put( updateWallet( updatedWallet ) )
    // yield call ( dbManager.updateWallet, {
    //   details2FA
    // } )
    yield put(twoFAResetted(true))
  }
  else {
    yield put(twoFAResetted(false))
    throw new Error('Failed to reset twoFA')
  }
}

export const resetTwoFAWatcher = createWatcher(resetTwoFAWorker, RESET_TWO_FA)

function* validateTwoFAWorker({ payload }: { payload: { token: number } }) {
  const wallet: Wallet = yield select((state) => state.storage.wallet)
  const { token } = payload
  try {
    const { valid } = yield call(AccountUtilities.validateTwoFA, wallet.walletId, token)
    if (valid) {
      const details2FA = {
        ...wallet.details2FA,
        twoFAValidated: true
      }
      const updatedWallet: Wallet = {
        ...wallet,
        details2FA
      }
      // yield put( updateWallet( updatedWallet ) )
      yield put(twoFAValid(true))
      // yield call ( dbManager.updateWallet, {
      //   details2FA
      // } )
      // yield put( updateWalletImageHealth( {
      //   update2fa: true
      // } ) )
    }
    else yield put(twoFAValid(false))
  } catch (error) {
    yield put(twoFAValid(false))
  }
}

export const validateTwoFAWatcher = createWatcher(
  validateTwoFAWorker,
  VALIDATE_TWO_FA
)

function* updateDonationPreferencesWorker({ payload }) {
  const { donationAccount, preferences } = payload

  const { updated, updatedAccount } = yield call(
    AccountUtilities.updateDonationPreferences,
    donationAccount,
    preferences
  )

  if (updated) yield put(updateAccountShells({
    accounts: {
      [updatedAccount.id]: updatedAccount
    }
  }))
  else throw new Error('Failed to update donation preferences')
}

export const updateDonationPreferencesWatcher = createWatcher(
  updateDonationPreferencesWorker,
  UPDATE_DONATION_PREFERENCES
)

function* refreshAccountShellsWorker({ payload }: {
  payload: {
    shells: AccountShell[],
    options: { hardRefresh?: boolean, syncDonationAccount?: boolean }
  }
}) {
  const accountShells: AccountShell[] = payload.shells
  const options: { hardRefresh?: boolean, syncDonationAccount?: boolean } = payload.options
  yield put(accountShellRefreshStarted(accountShells))
  const accountState: AccountsState = yield select(
    (state) => state.accounts
  )
  const accountIds = []
  const accounts: Accounts = accountState.accounts
  const accountsToSync: Accounts = {
  }
  for (const accountShell of accountShells) {
    accountsToSync[accountShell.primarySubAccount.id] = accounts[accountShell.primarySubAccount.id]
  }

  const { synchedAccounts, activeAddressesWithNewTxsMap } = yield call(syncAccountsWorker, {
    payload: {
      accounts: accountsToSync,
      options,
    }
  })

  yield put(updateAccountShells({
    accounts: synchedAccounts
  }))
  yield put(accountShellRefreshCompleted(accountShells))

  let computeNetBalance = false
  for (const [key, synchedAcc] of Object.entries(synchedAccounts)) {
    // yield call( dbManager.updateAccount, ( synchedAcc as Account ).id, synchedAcc )
    if ((synchedAcc as Account).hasNewTxn) {
      accountIds.push((synchedAcc as Account).id)
      computeNetBalance = true
    }
  }
  if (accountIds.length > 0) {
    // yield put( updateWalletImageHealth( {
    //   updateAccounts: true,
    //   accountIds: accountIds
    // } ) )
  }

  if (computeNetBalance) yield put(recomputeNetBalance())

  // update F&F channels if any new txs found on an assigned address
  // if( Object.keys( activeAddressesWithNewTxsMap ).length )  yield call( updatePaymentAddressesToChannels, activeAddressesWithNewTxsMap, synchedAccounts )
}

export const refreshAccountShellsWatcher = createWatcher(
  refreshAccountShellsWorker,
  REFRESH_ACCOUNT_SHELLS
)

function* autoSyncShellsWorker({ payload }: { payload: { syncAll?: boolean, hardRefresh?: boolean } }) {
  const { syncAll, hardRefresh } = payload
  const shells: AccountShell[] = yield select(
    (state) => state.accounts.accountShells
  )

  const shellsToSync: AccountShell[] = []
  const donationShellsToSync: AccountShell[] = []
  const lnShellsToSync: AccountShell[] = []
  for (const shell of shells) {
    if (syncAll || shell.primarySubAccount.visibility === AccountVisibility.DEFAULT) {
      if (!shell.primarySubAccount.isUsable) continue

      switch (shell.primarySubAccount.type) {
        case AccountType.TEST_ACCOUNT:
          break

        case AccountType.DONATION_ACCOUNT:
          donationShellsToSync.push(shell)
          break

        case AccountType.LIGHTNING_ACCOUNT:
          lnShellsToSync.push(shell)
          break

        default:
          shellsToSync.push(shell)
      }
    }
  }

  if (shellsToSync.length) yield call(refreshAccountShellsWorker, {
    payload: {
      shells: shellsToSync,
      options: {
        hardRefresh
      }
    }
  })

  // if( lnShellsToSync.length ) yield call( refreshLNShellsWorker, {
  //   payload: {
  //     shells: lnShellsToSync,
  //   }
  // } )

  // TODO: enable multi-donation sync
  if (donationShellsToSync.length)
    try {
      for (const donationAcc of donationShellsToSync) {
        yield call(refreshAccountShellsWorker, {
          payload: {
            shells: [donationAcc],
            options: {
              syncDonationAccount: true
            }
          }
        })
      }
    }
    catch (err) {
      console.log(`Sync via xpub agent failed w/ the following err: ${err}`)
    }
}

export const autoSyncShellsWatcher = createWatcher(
  autoSyncShellsWorker,
  AUTO_SYNC_SHELLS
)

export function* setup2FADetails(wallet: Wallet) {
  const { setupData } = yield call(AccountUtilities.setupTwoFA, wallet.walletId)
  const bithyveXpub = setupData.bhXpub
  const twoFAKey = setupData.secret
  const details2FA = {
    bithyveXpub,
    twoFAKey
  }
  const updatedWallet = {
    ...wallet,
    details2FA
  }
  // yield put( updateWallet( updatedWallet ) )
  // yield call( dbManager.updateWallet, {
  //   details2FA
  // } )
  return updatedWallet
}


export function* generateShellFromAccount(account: Account | MultiSigAccount) {
  const accountShells: AccountShell[] = yield select(
    (state) => state.accounts.accountShells
  )
  const network = AccountUtilities.getNetworkByType(account.networkType)
  let primarySubAccount: SubAccountDescribing

  switch (account.type) {
    case AccountType.TEST_ACCOUNT:
      primarySubAccount = new TestSubAccountInfo({
        id: account.id,
        xPub: yield call(AccountUtilities.generateYpub, account.xpub, network),
        isUsable: account.isUsable,
        instanceNumber: account.instanceNum,
        customDisplayName: account.accountName,
        customDescription: account.accountDescription,
        visibility: account.accountVisibility,
      })
      break

    case AccountType.CHECKING_ACCOUNT:
      primarySubAccount = new CheckingSubAccountInfo({
        id: account.id,
        xPub: yield call(AccountUtilities.generateYpub, account.xpub, network),
        isUsable: account.isUsable,
        instanceNumber: account.instanceNum,
        customDisplayName: account.accountName,
        customDescription: account.accountDescription,
      })
      break

    case AccountType.SAVINGS_ACCOUNT:
      primarySubAccount = new SavingsSubAccountInfo({
        id: account.id,
        xPub: null,
        isUsable: account.isUsable,
        instanceNumber: account.instanceNum,
        customDisplayName: account.accountName,
        customDescription: account.accountDescription,
      })
      break

    case AccountType.DONATION_ACCOUNT:
      primarySubAccount = new DonationSubAccountInfo({
        id: account.id,
        xPub: (account as DonationAccount).is2FA ? null : yield call(AccountUtilities.generateYpub, account.xpub, network),
        isUsable: account.isUsable,
        instanceNumber: account.instanceNum,
        customDisplayName: account.accountName,
        customDescription: account.accountDescription,
        doneeName: (account as DonationAccount).donee,
        causeName: account.accountName,
        isTFAEnabled: (account as DonationAccount).is2FA
      })
      break

    case AccountType.SWAN_ACCOUNT:
    case AccountType.DEPOSIT_ACCOUNT:

      let serviceAccountKind: ServiceAccountKind
      switch (account.type) {
        case AccountType.SWAN_ACCOUNT:
          serviceAccountKind = ServiceAccountKind.SWAN
          break

        case AccountType.DEPOSIT_ACCOUNT:
          serviceAccountKind = ServiceAccountKind.DEPOSIT_ACCOUNT
          break
      }

      primarySubAccount = new ExternalServiceSubAccountInfo({
        id: account.id,
        xPub: (account as MultiSigAccount).is2FA ? null : yield call(AccountUtilities.generateYpub, account.xpub, network),
        isUsable: account.isUsable,
        instanceNumber: account.instanceNum,
        type: account.type,
        customDisplayName: account.accountName,
        customDescription: account.accountDescription,
        serviceAccountKind,
      })
      break

    case AccountType.LIGHTNING_ACCOUNT:
      primarySubAccount = new LightningSubAccountInfo({
        id: account.id,
        xPub: yield call(AccountUtilities.generateYpub, account.xpub, network),
        isUsable: account.isUsable,
        instanceNumber: account.instanceNum,
        customDisplayName: account.accountName,
        customDescription: account.accountDescription,
        node: account.node
      })
      break

    case AccountType.IMPORTED_ACCOUNT:
      primarySubAccount = new FullyImportedWalletSubAccountInfo({
        id: account.id,
        xPub: yield call(AccountUtilities.generateYpub, account.xpub, network),
        isUsable: account.isUsable,
        instanceNumber: account.instanceNum,
        customDisplayName: account.accountName,
        customDescription: account.accountDescription,
      })
      break
  }

  let accountShell: AccountShell
  accountShells.forEach(shell => { // during re-creation of a some-how deleted account, if account shell already exists, then update that account shell else create new
    if (shell.primarySubAccount.id === primarySubAccount.id) {
      accountShell = {
        ...shell,
        primarySubAccount: primarySubAccount
      }
    }
  })

  if (!accountShell) {
    accountShell = new AccountShell({
      primarySubAccount,
      unit: account.networkType === NetworkType.TESTNET ? BitcoinUnit.TSATS : BitcoinUnit.SATS,
      displayOrder: 1
    })
  }

  accountShell.syncStatus = SyncStatus.COMPLETED
  return accountShell
}

export function* addNewAccount(accountType: AccountType, accountDetails: newAccountDetails, recreationInstanceNumber?: number, importDetails?: { primaryMnemonic: string, primarySeed: string }) {
  const wallet: Wallet = yield select(state => state.storage.wallet)
  const { walletId, primarySeed, accounts } = wallet
  const { name: accountName, description: accountDescription, is2FAEnabled, doneeName } = accountDetails
  
  switch (accountType) {
    case AccountType.TEST_ACCOUNT:
      const testInstanceCount = recreationInstanceNumber !== undefined ? recreationInstanceNumber : (accounts[AccountType.TEST_ACCOUNT])?.length | 0
      const testAccount: Account = yield call(generateAccount, {
        walletId,
        type: AccountType.TEST_ACCOUNT,
        instanceNum: testInstanceCount,
        accountName: accountName ? accountName : 'Test Account',
        accountDescription: 'Testnet Wallet',
        primarySeed,
        derivationPath: yield call(AccountUtilities.getDerivationPath, NetworkType.TESTNET, AccountType.TEST_ACCOUNT, testInstanceCount),
        networkType: NetworkType.TESTNET,
      })
      return testAccount

    case AccountType.CHECKING_ACCOUNT:
      const checkingInstanceCount = recreationInstanceNumber !== undefined ? recreationInstanceNumber : (accounts[AccountType.CHECKING_ACCOUNT])?.length | 0
      const checkingAccount: Account = yield call(generateAccount, {
        walletId,
        type: AccountType.CHECKING_ACCOUNT,
        instanceNum: checkingInstanceCount,
        accountName: accountName ? accountName : 'Checking Account',
        accountDescription: accountDescription ? accountDescription : 'Bitcoin Wallet',
        primarySeed,
        derivationPath: yield call(AccountUtilities.getDerivationPath, NetworkType.MAINNET, AccountType.CHECKING_ACCOUNT, checkingInstanceCount),
        networkType: config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET,
      })
      return checkingAccount

    case AccountType.SAVINGS_ACCOUNT:
      // if( !wallet.secondaryXpub && !wallet.details2FA ) throw new Error( 'Fail to create savings account; secondary-xpub/details2FA missing' )

      const savingsInstanceCount = recreationInstanceNumber !== undefined ? recreationInstanceNumber : (accounts[AccountType.SAVINGS_ACCOUNT])?.length | 0
      const savingsAccount: MultiSigAccount = generateMultiSigAccount({
        walletId,
        type: AccountType.SAVINGS_ACCOUNT,
        instanceNum: savingsInstanceCount,
        accountName: accountName ? accountName : 'Savings Account',
        accountDescription: accountDescription ? accountDescription : 'MultiSig Wallet',
        primarySeed,
        derivationPath: AccountUtilities.getDerivationPath(NetworkType.MAINNET, AccountType.SAVINGS_ACCOUNT, savingsInstanceCount),
        secondaryXpub: wallet.secondaryXpub,
        bithyveXpub: wallet.details2FA?.bithyveXpub,
        networkType: config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET,
      })
      return savingsAccount

    case AccountType.DONATION_ACCOUNT:
      if (is2FAEnabled)
        if (!wallet.secondaryXpub && !wallet.details2FA) throw new Error('Fail to create savings account; secondary-xpub/details2FA missing')

      const donationInstanceCount = recreationInstanceNumber !== undefined ? recreationInstanceNumber : (accounts[accountType])?.length | 0
      const donationAccount: DonationAccount = yield call(generateDonationAccount, {
        walletId,
        type: accountType,
        instanceNum: donationInstanceCount,
        accountName: 'Donation Account',
        accountDescription: accountName ? accountName : 'Receive Donations',
        donationName: accountName,
        donationDescription: accountDescription,
        donee: doneeName ? doneeName : wallet.walletName,
        primarySeed,
        derivationPath: yield call(AccountUtilities.getDerivationPath, NetworkType.MAINNET, accountType, donationInstanceCount),
        is2FA: is2FAEnabled,
        secondaryXpub: is2FAEnabled ? wallet.secondaryXpub : null,
        bithyveXpub: is2FAEnabled ? wallet.details2FA?.bithyveXpub : null,
        networkType: config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET,
      })
      const { setupSuccessful } = yield call(AccountUtilities.setupDonationAccount, donationAccount)
      if (!setupSuccessful) throw new Error('Failed to generate donation account')
      return donationAccount

    case AccountType.SWAN_ACCOUNT:
    case AccountType.DEPOSIT_ACCOUNT:
      let defaultAccountName, defaultAccountDescription
      let purpose = DerivationPurpose.BIP49
      switch (accountType) {
        case AccountType.SWAN_ACCOUNT:
          defaultAccountName = 'Swan Bitcoin'
          defaultAccountDescription = 'Register\nand claim $10'
          purpose = DerivationPurpose.BIP84
          break

        case AccountType.DEPOSIT_ACCOUNT:
          defaultAccountName = 'Deposit Account'
          defaultAccountDescription = 'Stack sats'
          break
      }

      const serviceInstanceCount = recreationInstanceNumber !== undefined ? recreationInstanceNumber : (accounts[accountType])?.length | 0
      const serviceAccount: Account = yield call(generateAccount, {
        walletId,
        type: accountType,
        instanceNum: serviceInstanceCount,
        accountName: accountName ? accountName : defaultAccountName,
        accountDescription: accountDescription ? accountDescription : defaultAccountDescription,
        primarySeed,
        derivationPath: yield call(AccountUtilities.getDerivationPath, NetworkType.MAINNET, accountType, serviceInstanceCount, null, purpose),
        networkType: config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET,
      })
      if (accountType === AccountType.SWAN_ACCOUNT) serviceAccount.isUsable = false

      return serviceAccount

    case AccountType.LIGHTNING_ACCOUNT:
      const { node } = accountDetails
      const lnAccountCount = recreationInstanceNumber !== undefined ? recreationInstanceNumber : (accounts[accountType])?.length | 0
      const lnAccount: Account = yield call(generateAccount, {
        walletId,
        type: accountType,
        instanceNum: lnAccountCount,
        accountName: accountName ? accountName : defaultAccountName,
        accountDescription: accountDescription ? accountDescription : defaultAccountDescription,
        primarySeed,
        derivationPath: yield call(AccountUtilities.getDerivationPath, NetworkType.MAINNET, accountType, lnAccountCount),
        networkType: config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET,
        node
      })
      return lnAccount

    case AccountType.IMPORTED_ACCOUNT:
    
      const importedInstanceCount = 0 // imported accounts always have instance number equal to zero(as they're imported using different seeds)
      const importedAccount: Account = yield call(generateAccount, {
        walletId,
        type: AccountType.IMPORTED_ACCOUNT,
        instanceNum: importedInstanceCount,
        accountName: accountName ? accountName : 'Imported Account',
        accountDescription: accountDescription ? accountDescription : 'Bitcoin Wallet',
        primarySeed: importDetails.primarySeed,
        primaryMnemonic: importDetails.primaryMnemonic,
        derivationPath: yield call(AccountUtilities.getDerivationPath, NetworkType.MAINNET, AccountType.IMPORTED_ACCOUNT, importedInstanceCount, null, DerivationPurpose.BIP84),
        networkType: config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET,
      })
      return importedAccount
  }
}
export interface newAccountDetails {
  name?: string,
  description?: string,
  is2FAEnabled?: boolean,
  doneeName?: string,
  node?: LNNode
}
export interface newAccountsInfo {
  accountType: AccountType,
  accountDetails?: newAccountDetails,
  recreationInstanceNumber?: number,
}

export function* addNewAccountShellsWorker({ payload: newAccountsInfo }: { payload: newAccountsInfo[], }) {
  const newAccountShells: AccountShell[] = []
  const accounts = {
  }
  const accountIds = []
  let testcoinsToAccount

  for (const { accountType, accountDetails, recreationInstanceNumber } of newAccountsInfo) {
    const account: Account | MultiSigAccount | DonationAccount = yield call(
      addNewAccount,
      accountType,
      accountDetails || {
      },
      recreationInstanceNumber
    )
    accountIds.push(account.id)
    const accountShell = yield call(generateShellFromAccount, account)
    newAccountShells.push(accountShell)
    accounts[account.id] = account
    // yield put( accountShellOrderedToFront( accountShell ) )
    if (account.type === AccountType.TEST_ACCOUNT && account.instanceNum === 0) testcoinsToAccount = account
  }

  const wallet: Wallet = yield select(state => state.storage.wallet)
  let presentAccounts = _.cloneDeep(wallet.accounts)
  Object.values((accounts as Accounts)).forEach(account => {
    if (presentAccounts[account.type]) {
      if (!presentAccounts[account.type].includes(account.id)) presentAccounts[account.type].push(account.id)
    }
    else presentAccounts = {
      ...presentAccounts,
      [account.type]: [account.id]
    }
  })

  const updatedWallet: Wallet = {
    ...wallet,
    accounts: presentAccounts
  }
  yield put(updateWallet(updatedWallet))

  yield put(newAccountShellsAdded({
    accountShells: newAccountShells,
    accounts,
  }))
  // yield call( dbManager.createAccounts, accounts )
  // yield call( dbManager.updateWallet, {
  //   accounts: presentAccounts
  // } )
  // yield put( updateWalletImageHealth( {
  //   updateAccounts: true,
  //   accountIds: accountIds
  // } ) )

  if (testcoinsToAccount) yield put(getTestcoins(testcoinsToAccount)) // pre-fill test-account w/ testcoins
}

export const addNewAccountShellsWatcher = createWatcher(
  addNewAccountShellsWorker,
  ADD_NEW_ACCOUNT_SHELLS
)

export function* loginWithHexaWorker({ payload }: { payload: { authToken: string, walletName: string } }) {
  try {
    const newAccountShells: AccountShell[] = []
    const accounts = {
    }
    const accountIds = []
    const newAccountsInfo: newAccountsInfo[] = [{
      accountType: AccountType.CHECKING_ACCOUNT,
      accountDetails: {
        name: payload.walletName || ''
      }
    }]

    let xpub;
    for (const { accountType, accountDetails, recreationInstanceNumber } of newAccountsInfo) {
      const account: Account | MultiSigAccount | DonationAccount = yield call(
        addNewAccount,
        accountType,
        accountDetails || {
        },
        recreationInstanceNumber,
      )
      xpub = account.xpub
      accountIds.push(account.id)
      const accountShell = yield call(generateShellFromAccount, account)
      newAccountShells.push(accountShell)
      accounts[account.id] = account
    }
    const wallet: Wallet = yield select(state => state.storage.wallet)
    let presentAccounts = _.cloneDeep(wallet.accounts)
    Object.values((accounts as Accounts)).forEach(account => {
      if (presentAccounts[account.type]) {
        if (!presentAccounts[account.type].includes(account.id)) presentAccounts[account.type].push(account.id)
      }
      else presentAccounts = {
        ...presentAccounts,
        [account.type]: [account.id]
      }
    })

    const authResponse = yield call(Relay.loginWithHexa, payload.authToken, xpub)
    if (authResponse && authResponse.walletName) {
      const updatedWallet: Wallet = {
        ...wallet,
        accounts: presentAccounts
      }
      yield put(updateWallet(updatedWallet))

      yield put(newAccountShellsAdded({
        accountShells: newAccountShells,
        accounts,
      }))
    } else {

    }
  } catch (error) {
    console.log('error', error);
  }
}

export function* importNewAccountWorker({ payload }: { payload: { mnemonic: string } }) {
  const newAccountShells: AccountShell[] = []
  const accounts = {
  }
  const accountIds = []
  const newAccountsInfo: newAccountsInfo[] = [{
    accountType: AccountType.IMPORTED_ACCOUNT
  }]

  const importDetails = {
    primaryMnemonic: payload.mnemonic,
    primarySeed: bip39.mnemonicToSeedSync(payload.mnemonic).toString('hex'),
  }

  for (const { accountType, accountDetails, recreationInstanceNumber } of newAccountsInfo) {
    const account: Account | MultiSigAccount | DonationAccount = yield call(
      addNewAccount,
      accountType,
      accountDetails || {
      },
      recreationInstanceNumber,
      importDetails
    )
    accountIds.push(account.id)
    const accountShell = yield call(generateShellFromAccount, account)
    newAccountShells.push(accountShell)
    accounts[account.id] = account
  }

  const wallet: Wallet = yield select(state => state.storage.wallet)
  let presentAccounts = _.cloneDeep(wallet.accounts)
  Object.values((accounts as Accounts)).forEach(account => {
    if (presentAccounts[account.type]) {
      if (!presentAccounts[account.type].includes(account.id)) presentAccounts[account.type].push(account.id)
    }
    else presentAccounts = {
      ...presentAccounts,
      [account.type]: [account.id]
    }
  })

  const updatedWallet: Wallet = {
    ...wallet,
    accounts: presentAccounts
  }
  yield put(updateWallet(updatedWallet))

  yield put(newAccountShellsAdded({
    accountShells: newAccountShells,
    accounts,
  }))

  yield put(refreshAccountShells(newAccountShells, {
    hardRefresh: true,
  }))
  // yield call( dbManager.createAccounts, accounts )
  // yield call( dbManager.updateWallet, {
  //   accounts: presentAccounts
  // } )
  // yield put( updateWalletImageHealth( {
  //   updateAccounts: true,
  //   accountIds: accountIds
  // } ) )

}

export const loginWithHexaWatcher = createWatcher(
  loginWithHexaWorker,
  LOGIN_WITH_HEXA
)

export const importNewAccountWatcher = createWatcher(
  importNewAccountWorker,
  IMPORT_NEW_ACCOUNT
)

function* updateAccountSettingsWorker({ payload }: {
  payload: {
    accountShell: AccountShell,
    settings: {
      accountName?: string,
      accountDescription?: string,
      visibility?: AccountVisibility,
    },
  }
}) {

  const { accountShell, settings } = payload
  const { accountName, accountDescription, visibility } = settings

  try {
    const account: Account = yield select(state => state.accounts.accounts[accountShell.primarySubAccount.id])
    if (accountName) account.accountName = accountName
    if (accountDescription) account.accountDescription = accountDescription
    if (visibility) account.accountVisibility = visibility

    yield put(updateAccountShells({
      accounts: {
        [account.id]: account
      }
    }))
    // yield call( dbManager.updateAccount, account.id, account )
    // yield put( updateWalletImageHealth( {
    //   updateAccounts: true,
    //   accountIds: [ account.id ]
    // } ) )
    if (visibility === AccountVisibility.DEFAULT) {
      yield put(accountSettingsUpdated())
    }

  } catch (error) {
    yield put(accountSettingsUpdateFailed({
      error
    }))
  }
}

export const updateAccountSettingsWatcher = createWatcher(
  updateAccountSettingsWorker,
  UPDATE_ACCOUNT_SETTINGS
)

function* reassignTransactions({ payload: { transactionIDs, sourceID, destinationID }, }: {
  payload: ReassignTransactionsActionPayload;
}) {
  try {
    // TODO: Implement backend logic here for processing transaction re-assignment

    yield put(
      transactionReassignmentSucceeded({
        transactionIDs,
        sourceID,
        destinationID,
      })
    )
  } catch (error) {
    yield put(
      transactionReassignmentFailed({
        transactionIDs,
        sourceID,
        destinationID,
        error,
      })
    )
  }
}

export const reassignTransactionsWatcher = createWatcher(
  reassignTransactions,
  REASSIGN_TRANSACTIONS
)

function* mergeAccountShells({ payload: { source, destination }, }: {
  payload: MergeAccountShellsActionPayload;
}) {
  try {
    // TODO: Implement backend logic here for processing the merge

    yield put(
      accountShellMergeSucceeded({
        source,
        destination,
      })
    )
  } catch (error) {
    yield put(
      accountShellMergeFailed({
        source,
        destination,
        error,
      })
    )
  }
}

export const mergeAccountShellsWatcher = createWatcher(
  mergeAccountShells,
  MERGE_ACCOUNT_SHELLS
)

// function* createSmNResetTFAOrXPrivWorker( { payload }: { payload: { qrdata: string, QRModalHeader: string, accountShell: AccountShell } } ) {
//   try {
//     const { qrdata, QRModalHeader, accountShell } = payload
//     const wallet: Wallet = yield select( ( state ) => state.storage.wallet )
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
//       secondaryMnemonic = BHROperations.getMnemonics( sharesArray, wallet.security.answer )
//     }
//     if ( QRModalHeader === 'Reset 2FA' ) {
//       yield put( resetTwoFA( secondaryMnemonic.mnemonic ) )
//     } else if ( QRModalHeader === 'Sweep Funds' ) {
//       yield put( generateSecondaryXpriv( accountShell, secondaryMnemonic.mnemonic ) )
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

function parseAA(addresses) {
  try {
    if (addresses.length > 0) {
      const obj = {
      }
      addresses.forEach(aa => {
        const tmp = {
          index: aa.index
        }
        if (aa.assignee) {
          const assignee = {
            ...aa.assignee
          }
          if (aa.assignee.recipientInfo) {
            const recipientInfo = {
            }
            aa.assignee.recipientInfo.forEach(info => {
              recipientInfo[info.txid] = info.recipient
            })
            assignee.recipientInfo = recipientInfo
            // tmp.assignee = assignee
          }
        }
        obj[aa.address] = tmp
      })
      return obj
    } else {
      return {
      }
    }
  } catch (error) {
    console.log(error)
    return {
    }
  }
}

function getAA(activeAddresses: { external: [], internal: [] }) {
  return {
    external: parseAA(activeAddresses.external),
    internal: parseAA(activeAddresses.internal)
  }
}

// export function* restoreAccountShellsWorker( { payload: restoredAccounts } : { payload: Account[] } ) {
//   const newAccountShells: AccountShell[] = []
//   const accounts: Accounts = {
//   }
//   // restore account shells for respective accountss
//   for ( const account of restoredAccounts ){
//     const accountShell: AccountShell = yield call( generateShellFromAccount, account )

//     // turn on the UI-level usability flag if savings account is already usable(level 2 completed)
//     if( account.type === AccountType.SAVINGS_ACCOUNT && account.isUsable ) yield put( setAllowSecureAccount( true ) )

//     accountShell.primarySubAccount.visibility = account.accountVisibility
//     // const aa = getAA( account.activeAddresses )  // TODO: check whether active addresses are getting restored
//     // account.activeAddresses = aa
//     newAccountShells.push( accountShell )
//     accounts [ account.id ] = account
//   }

//   // update redux store & database
//   const wallet: Wallet = yield select( state => state.storage.wallet )
//   let presentAccounts = {
//   }
//   Object.values( ( accounts as Accounts ) ).forEach( account => {
//     if( presentAccounts[ account.type ] ) presentAccounts[ account.type ].push( account.id )
//     else presentAccounts = {
//       ...presentAccounts,
//       [ account.type ]: [ account.id ]
//     }
//   } )
//   const updatedWallet: Wallet = {
//     ...wallet,
//     accounts: presentAccounts,
//   }

//   // yield put( updateWallet( updatedWallet ) )
//   yield put( newAccountShellsAdded( {
//     accountShells: newAccountShells,
//     accounts,
//   } ) )
//   // yield call( dbManager.createAccounts, accounts )
//   // yield call( dbManager.updateWallet, {
//   //   accounts: presentAccounts
//   // } )

//   // restore account's balance and transactions
//   const syncAll = true
//   const hardRefresh = true

//   yield call( autoSyncShellsWorker, {
//     payload: {
//       syncAll, hardRefresh
//     }
//   } )
//   //yield call( syncTxAfterRestore, restoredAccounts )
// }

// export const restoreAccountShellsWatcher = createWatcher(
//   restoreAccountShellsWorker,
//   RESTORE_ACCOUNT_SHELLS,
// )

export function* generateGiftstWorker({ payload }: { payload: { amounts: number[], accountId?: string, includeFee?: boolean, exclusiveGifts?: boolean, validity?: number } }) {
  const wallet: Wallet = yield select((state) => state.storage.wallet)
  const accountsState: AccountsState = yield select(state => state.accounts)
  const accounts: Accounts = accountsState.accounts

  let accountId = payload.accountId
  if (!accountId) {
    for (const id in accounts) {
      const account = accounts[id]
      if (account.type === AccountType.CHECKING_ACCOUNT && account.instanceNum === 0) {
        accountId = id
        break
      }
    }
  }

  const account = accounts[accountId]
  const averageTxFeeByNetwork = accountsState.averageTxFees[account.networkType]
  const walletDetails = {
    walletId: wallet.walletId,
    walletName: wallet.walletName
  }

  try {
    const { txid, gifts } = yield call(AccountOperations.generateGifts, walletDetails, account, payload.amounts, averageTxFeeByNetwork, payload.includeFee, payload.exclusiveGifts, payload.validity)
    if (txid) {
      const giftIds = []
      for (const giftId in gifts) {
        giftIds.push(gifts[giftId].id)
        yield put(updateGift(gifts[giftId]))
      }
      yield put(giftCreationSuccess(true))

      // yield call( dbManager.createGifts, gifts )
      // yield put( updateWalletImageHealth( {
      //   updateGifts: true,
      //   giftIds: giftIds
      // } ) )

      // refersh the account
      let shellToSync: AccountShell
      for (const accountShell of accountsState.accountShells) {
        if (accountShell.primarySubAccount.id === account.id) shellToSync = accountShell
      }
      yield put(refreshAccountShells([shellToSync], {
      }))
    } else {
      console.log('Gifts generation failed')
      yield put(giftCreationSuccess(false))
    }

  } catch (err) {
    yield put(giftCreationSuccess(false))
  }
}

export const generateGiftsWatcher = createWatcher(
  generateGiftstWorker,
  GENERATE_GIFTS,
)
