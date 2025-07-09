import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SvgXml } from 'react-native-svg';

export default function RemoteSvg({ url, height = 200, width = 200, useViewBox = false }) {
  const [svgXml, setSvgXml] = useState(null);

  useEffect(() => {
    const fetchSvg = async () => {
      try {
        const response = await fetch(url);
        const text = await response.text();
        setSvgXml(text);
      } catch (error) {
        console.error('Error fetching SVG:', error);
      }
    };

    fetchSvg();
  }, []);

  if (!svgXml) return <ActivityIndicator />;

  return (
    <View>
      <SvgXml
        xml={svgXml}
        width={width}
        height={height}
        {...(useViewBox ? { viewBox: '0 0 100 100' } : {})}
      />
    </View>
  );
}
