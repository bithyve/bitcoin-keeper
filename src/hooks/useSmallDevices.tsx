import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const useIsSmallDevices = () => {
  const [isSmallDevice, setIsSmallDevice] = useState(false);
  const screenHeight = Dimensions.get('window').height;
  console.log('screenHeightscreenHeight', screenHeight);
  useEffect(() => {
    const checkDevice = async () => {
      const model = await DeviceInfo.getModel();
      setIsSmallDevice(
        model.includes('mini') ||
          model.includes('Mini') ||
          model.includes('SE') ||
          model.includes('iPhone 7') ||
          model.includes('iPhone 6') ||
          screenHeight <= 616
      );
    };

    checkDevice();
  }, []);

  return isSmallDevice;
};

export default useIsSmallDevices;
