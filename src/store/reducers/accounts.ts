import { GET_ALL_ACCOUNTS_DATA } from '../actions/accounts';
  
  export type AccountsState = {
    accountsSynched: boolean;
  };
  
  const initialState: AccountsState = {
    accountsSynched: false,
  }
  
  export default ( state: AccountsState = initialState, action: any ): AccountsState => {
  
    switch ( action.type ) {
        case GET_ALL_ACCOUNTS_DATA:
          return {
            ...state,
            accountsSynched: true
          }
  
        default:
          return state
    }
  }
  