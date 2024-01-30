import { useEffect, useState } from 'react';
import DeviceInfo from 'react-native-device-info';

const useIsSmallDevices = () => {
  const [isSmallDevice, setIsSmallDevice] = useState(false);

  useEffect(() => {
    const checkDevice = async () => {
      const model = await DeviceInfo.getModel();
      setIsSmallDevice(
        model.includes('mini') ||
          model.includes('Mini') ||
          model.includes('SE') ||
          model.includes('iPhone 7')
      );
    };

    checkDevice();
  }, []);

  return isSmallDevice;
};

export default useIsSmallDevices;
