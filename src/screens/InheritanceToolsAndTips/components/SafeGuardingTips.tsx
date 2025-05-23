import React, { useContext } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import TipsSlider from '../TipsSlider';
import InheritanceHeader from '../InheritanceHeader';
import Text from 'src/components/KeeperText';
import { wp } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';

function SafeGuardingTips({}) {
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const slider_background = ThemedColor({ name: 'slider_background' });
  const green_modal_text_color = ThemedColor({ name: 'green_modal_text_color' });

  const tips = [
    {
      title: inheritancePlanning.thoroughVeirifcationTitle,
      icon: <ThemedSvg name={'inheritance_seed_illustration'} />,
      paragraph: inheritancePlanning.thoroughParagraph1,
      paragraph2: inheritancePlanning.thoroughParagraph2,
    },

    {
      title: inheritancePlanning.preliminaryTitle,
      icon: <ThemedSvg name={'restore_illustration'} />,
      paragraph: inheritancePlanning.preliminaryParagraph1,
      paragraph2: inheritancePlanning.preliminaryParagraph2,
    },
    {
      title: inheritancePlanning.secureCoordinationTitle,
      icon: <ThemedSvg name={'educateHeir_illustration'} />,
      paragraph: inheritancePlanning.secureCoordinationParagraph1,
      paragraph2: inheritancePlanning.secureCoordinationParagraph2,
    },
    {
      title: inheritancePlanning.crossDeviceTitle,
      icon: <ThemedSvg name={'backup_illustration'} />,
      paragraph: inheritancePlanning.crossDeviceParagraph1,
      paragraph2: inheritancePlanning.crossDeviceParagraph2,
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={slider_background}>
      <InheritanceHeader />
      <Text style={styles.container} color={green_modal_text_color}>
        {inheritancePlanning.tipsForTransactions}
      </Text>
      <TipsSlider items={tips} />
    </ScreenWrapper>
  );
}

export default SafeGuardingTips;

const styles = StyleSheet.create({
  container: {
    marginLeft: wp(10),
  },
});
