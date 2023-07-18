import { useQuery } from 'react-query';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { useDispatch } from 'react-redux';
import { setNetBalance } from 'src/store/reducers/wallets';
import { uaiChecks } from 'src/store/sagaActions/uai';
import { uaiType } from 'src/common/data/models/interfaces/Uai';
import * as Worker from './queryWorker';

const TEN_SECONDS = 10000;

const useSyncWallet = ({ wallet }: { wallet: Wallet }) => {
  const dispatch = useDispatch();

  const syncOperations = async () => {
    const { netBalance } = await Worker.refreshWallets({ wallets: [wallet] });
    dispatch(uaiChecks([uaiType.VAULT_TRANSFER]));
    dispatch(setNetBalance(netBalance));
  };

  const query = useQuery(`walletSync${wallet.id}`, syncOperations, {
    enabled: false,
    cacheTime: TEN_SECONDS,
  });

  return { query };
};

export default useSyncWallet;
