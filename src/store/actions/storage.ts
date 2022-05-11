import { Wallet } from "src/core/interfaces/Interface"

export const UPDATE_WALLET = 'UPDATE_WALLET'
export const SETUP_WALLET = 'SETUP_WALLET'

export const updateWallet = ( wallet: Wallet ) => {
  return {
    type: UPDATE_WALLET,
    payload: {
      wallet
    }
  }
}

export const setupWallet = ( walletName?: string, security?: { questionId: string, question: string, answer: string } ) => {
  return {
    type: SETUP_WALLET, payload: {
      walletName, security
    }
  }
}