enum SwanWalletCreationStatus {
  /**
   * Swan Wallet creation has not started from either buy menu or add new Wallet page.
   */
  NOT_INITIATED = 'NOT_INITIATED',

  /**
   * Add new Wallet option has been used for Swan Wallet creation
   */
  ADD_NEW_Wallet_INITIATED = 'ADD_NEW_Wallet_INITIATED',

  /**
   * Buy menu option has been used for Swan Wallet creation
   */
  BUY_MENU_CLICKED = 'BUY_MENU_CLICKED',

  /**
   * Hexa is communicating with Swan to authenticate and create a withdrawal wallet.
   */
  AUTHENTICATION_IN_PROGRESS = 'AUTHENTICATION_IN_PROGRESS',

  /**
   * Hexa Wallet has been linked to Swan wallet
   */
  WALLET_LINKED_SUCCESSFULLY = 'WALLET_LINKED_SUCCESSFULLY',

  /**
   * Swan Wallet already exists
   */

  Wallet_CREATED = 'Wallet_CREATED',

  /**
   * Error encountered
   */
  ERROR = 'ERROR',
}

export default SwanWalletCreationStatus;
