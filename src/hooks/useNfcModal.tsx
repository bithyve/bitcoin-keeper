import { useState } from 'react';

const useNfcModal = () => {
  const [nfcVisible, setNfcVisible] = useState<boolean>(false);

  const withNfcModal = async (callback) => {
    setNfcVisible(true);
    const resp = await callback();
    setNfcVisible(false);
    return resp;
  };

  const closeNfc = () => setNfcVisible(false);
  return { nfcVisible, withNfcModal, closeNfc };
};

export default useNfcModal;
