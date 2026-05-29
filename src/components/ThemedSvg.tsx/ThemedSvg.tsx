import React from 'react';
import { View } from 'react-native';

import { useSelector } from 'react-redux';
import themeIcons from './ThemedIcons';

const ThemedSvg = ({ name, ...props }) => {
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);

  const IconComponent = themeIcons[name]?.[themeMode] || themeIcons[name]?.light;

  if (!IconComponent) {
    return null;
  }

  return (
    <View pointerEvents="none">
      <IconComponent {...props} />
    </View>
  );
};

export default ThemedSvg;
