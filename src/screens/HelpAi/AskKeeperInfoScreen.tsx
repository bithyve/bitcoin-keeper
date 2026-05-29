import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { ASK_KEEPER_INFO } from '../../constants/AskKeeperInfo';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { useColorMode } from '@gluestack-ui/themed-native-base';
import WalletHeader from 'src/components/WalletHeader';
import Fonts from 'src/constants/Fonts';


const AskKeeperInfoScreen = () => {
  const { colorMode } = useColorMode();

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={ASK_KEEPER_INFO.title} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {ASK_KEEPER_INFO.sections.map((section, idx) => (
          <View key={section.heading} style={styles.sectionCtr}>
            <Text style={styles.heading} color={`${colorMode}.primaryText`}>
              {section.heading}
            </Text>
            <Text style={styles.body} color={`${colorMode}.primaryText`}>
              {section.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  sectionCtr: {
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  heading: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    fontFamily: Fonts.LoraSemiBold,
    marginBottom: 4,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Fonts.InterRegular,
    marginTop: 2,
  },
  divider: {
    marginVertical: 10,
    borderBottomWidth: 1,
  },
});

export default AskKeeperInfoScreen;
