import { useAppSelector } from 'src/store/hooks';

const useOneDayInsight = () => {
  const oneDayInsight = useAppSelector((state) => state.network.oneDayInsight);
  return oneDayInsight || [];
};

export default useOneDayInsight;
