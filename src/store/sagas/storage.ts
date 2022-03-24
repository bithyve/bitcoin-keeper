
import * as bip39 from 'bip39'
import crypto from 'crypto'
import { Wallet } from 'src/bitcoin/utilities/Interface'
import DeviceInfo from 'react-native-device-info'
import { SETUP_WALLET, updateWallet } from '../actions/storage'
import { put } from 'redux-saga/effects'
import { createWatcher } from '../utilities'

function* setupWalletWorker( { payload } ) {
    const { walletName, security }: { walletName: string, security: { questionId: string, question: string, answer: string } } = payload
    const primaryMnemonic = bip39.generateMnemonic( 256 )
    const primarySeed = bip39.mnemonicToSeedSync( primaryMnemonic )
    const walletId = crypto.createHash( 'sha256' ).update( primarySeed ).digest( 'hex' )
  
    const wallet: Wallet = {
      walletId,
      walletName,
      userName: walletName,
      security,
      primaryMnemonic,
      primarySeed: primarySeed.toString( 'hex' ),
      accounts: {
      },
      version: DeviceInfo.getVersion()
    }
  
    yield put( updateWallet( wallet ) )
  }

  export const setupWalletWatcher = createWatcher( setupWalletWorker,
       SETUP_WALLET )
