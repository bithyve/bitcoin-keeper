import { Box, FlatList, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { wp } from 'src/constants/responsive';
import FilterIcon from 'src/assets/images/filter-icon.svg';
import { useNavigation } from '@react-navigation/native';
import KeeperTextInput from 'src/components/KeeperTextInput';
import Text from 'src/components/KeeperText';
import AdvisorCard from './component/AdvisorCard';

const dummyAdvisors = [
  {
    expertise: ['Hardware Purchase', 'Multisig Setup'],
    languages: ['Portuguese', 'English', 'Español'],
    title: 'Diy Sec Lab',
    country: 'Brazil',
    description:
      'DIY Labs is a Brazil-based fintech company specializing in ultra‑secure, open‑source tools for self‑custody of Bitcoin.',
    image: 'https://bitcoinkeeper.app/public_assets_email/diySecLab.png',
    link: 'https://calendly.com/vaibhav-cakesofttech/30min',
    duration: '30 mins',
    experience: '4 Years',
    timezone: 'GMT - 3',
  },
  {
    expertise: ['Seed Backup', 'Cold Wallet Recovery', 'Multisig Setup'],
    languages: ['English', 'German'],
    title: 'SecureVault Pro',
    country: 'Germany',
    description:
      'SecureVault Pro helps clients recover lost access and offers consultation on safe Bitcoin cold storage setups.',
    image: 'https://bitcoinkeeper.app/public_assets_email/diySecLab.png',
    link: 'https://calendly.com/sample-link',
    duration: '45 mins',
    experience: '6 Years',
    timezone: 'GMT + 1',
  },
];

const Advisors = () => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        title="Meet Our Advisors"
        rightComponent={
          <TouchableOpacity
            onPress={() => navigation.navigate('FilterAdvisor')}
            style={styles.filterIcon}
          >
            <CircleIconWrapper
              icon={<FilterIcon />}
              width={wp(30)}
              backgroundColor={`${colorMode}.pantoneGreen`}
            />
          </TouchableOpacity>
        }
      />
      <Box style={styles.searchContainer}>
        <KeeperTextInput
          placeholder="Search for an Expert"
          onChangeText={() => {}}
          inpuBorderColor={`${colorMode}.pantoneGreen`}
        />
      </Box>
      <Box style={styles.Container}>
        <Text color={`${colorMode}.secondaryText`} fontSize={16}>
          Meet Our Experts
        </Text>

        <FlatList
          data={dummyAdvisors}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <AdvisorCard advisor={item} />}
          contentContainerStyle={{ paddingBottom: wp(20) }}
          showsVerticalScrollIndicator={false}
        />
      </Box>
    </ScreenWrapper>
  );
};

export default Advisors;

const styles = StyleSheet.create({
  filterIcon: {
    marginRight: wp(10),
  },
  searchContainer: {
    marginTop: wp(10),
    marginBottom: wp(10),
  },
  Container: {
    flex: 1,
    marginVertical: wp(8),
  },
});
