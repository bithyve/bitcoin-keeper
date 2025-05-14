import React from 'react';

import { useSelector } from 'react-redux';
import themeIcons from './ThemedIcons';

const ThemedSvg = ({ name, ...props }) => {
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);

  const IconComponent = themeIcons[name]?.[themeMode] || themeIcons[name]?.light;

  if (!IconComponent) {
    return null;
  }

  return <IconComponent {...props} />;
};

export default ThemedSvg;
