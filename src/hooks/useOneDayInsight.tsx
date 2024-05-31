import { useAppSelector } from 'src/store/hooks';


export const oneDayInsightSelector = (state) => state.network.oneDayInsight || [];

const useOneDayInsight = () => {
  const oneDayInsight = useAppSelector((state) => state.network.oneDayInsight);
  return oneDayInsight || [];
};

export default useOneDayInsight;
