import { useState } from 'react';

const useAsync = () => {
  const [inProgress, setProgress] = useState<boolean>(false);
  const [error, setError] = useState<Error>();
  const [data, setData] = useState();
  const start = async (callback) => {
    try {
      setProgress(true);
      const data = await callback();
      setData(data);
      setProgress(false);
    } catch (err) {
      setError(err);
      setProgress(false);
    }
  };
  return { inProgress, error, data, start };
};

export default useAsync;
