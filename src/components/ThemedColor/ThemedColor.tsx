import { useSelector } from 'react-redux';
import themedColors from './ThemedColors';

const ThemedColor = ({ name }: { name: string }) => {
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const fallbackMode = 'LIGHT';
  const color = themedColors[name]?.[themeMode] || themedColors[name]?.[fallbackMode];

  if (!color) return null;

  return color;
};

export default ThemedColor;
