import { Box, FlatList, useColorMode } from 'native-base';
import React, { useContext, useEffect, useMemo, useState } from 'react';
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
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { getAdvisors } from 'src/store/sagaActions/advisor';

const Advisors = () => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const { translations } = useContext(LocalizationContext);
  const { concierge } = translations;
  const [loading, setLoading] = useState(false);
  const { advisors } = useAppSelector((state) => state.advisor);
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();

  const filteredAdvisors = useMemo(() => {
    return advisors.filter((advisor) => advisor.title.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  useEffect(() => {
    if (!advisors.length) {
      setLoading(true);
      dispatch(
        getAdvisors(({ status, error }) => {
          setLoading(false);
          if (!status) {
            navigation.goBack();
            showToast(error, <ToastErrorIcon />);
          }
        })
      );
    }
  }, []);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        title={concierge.MeetAdvisors}
        // Filter remove for now
        // * For future use, if needed
        // rightComponent={
        //   <TouchableOpacity
        //     onPress={() => navigation.navigate('FilterAdvisor')}
        //     style={styles.filterIcon}
        //   >
        //     <CircleIconWrapper
        //       icon={<FilterIcon />}
        //       width={wp(30)}
        //       backgroundColor={`${colorMode}.pantoneGreen`}
        //     />
        //   </TouchableOpacity>
        // }
      />
      {/* <Box style={styles.searchContainer}>
        <KeeperTextInput
          placeholder={concierge.searchExprt}
          value={search}
          onChangeText={setSearch}
          inpuBorderColor={isDarkMode ? `${colorMode}.separator` : `${colorMode}.pantoneGreen`}
        />
      </Box> */}
      <Box style={styles.Container}>
        {/* <Text color={`${colorMode}.secondaryText`} fontSize={16}>
          {concierge.meetExperts}
        </Text> */}

        <FlatList
          data={filteredAdvisors}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <AdvisorCard advisor={item} />}
          contentContainerStyle={{ paddingBottom: wp(20) }}
          showsVerticalScrollIndicator={false}
        />
      </Box>
      <ActivityIndicatorView visible={loading} />
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
    marginBottom: wp(8),
  },
});
