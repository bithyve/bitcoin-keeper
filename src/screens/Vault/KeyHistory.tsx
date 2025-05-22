import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Signer } from 'src/services/wallets/interfaces/vault';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import { ScrollView } from 'react-native-gesture-handler';
import EmptyState from 'src/assets/images/key-empty-state-illustration.svg';
import { getSignerNameFromType } from 'src/hardware';
import { SignerType } from 'src/services/wallets/enums';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import SigningDeviceChecklist from './SigningDeviceChecklist';
import moment from 'moment';
import { useQuery } from '@realm/react';
import { BackupHistoryItem } from 'src/models/enums/BHR';
import { RealmSchema } from 'src/storage/realm/enum';
import Text from 'src/components/KeeperText';
import WalletHeader from 'src/components/WalletHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const EmptyHistoryView = ({ colorMode, vaultText }) => (
  <Box style={styles.emptyWrapper}>
    <Text color={`${colorMode}.primaryText`} style={styles.emptyText} semiBold>
      {vaultText.keyHistory}
    </Text>
    <Text color={`${colorMode}.secondaryText`} style={styles.emptySubText}>
      {vaultText.healthCheckHistory}
    </Text>
    <Box style={styles.emptyStateContainer}>
      <EmptyState />
    </Box>
  </Box>
);

function KeyHistory({ route }: any) {
  const { colorMode } = useColorMode();
  const [showLoader, setShowLoader] = useState(true);
  const [healthCheckArray, setHealthCheckArray] = useState([]);
  const data = useQuery(RealmSchema.BackupHistory);
  const history: BackupHistoryItem[] = useMemo(() => data.sorted('date', true), [data]);
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText } = translations;

  const {
    signer,
  }: {
    signer: Signer;
  } = route.params;

  useEffect(() => {
    if (signer) {
      setHealthCheckArray(signer.healthCheckDetails);
      setShowLoader(false);
    }
  }, [signer.healthCheckDetails.length]);

  if (!signer) {
    return null;
  }

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        title={vaultText.keyHistory}
        subTitle={
          !signer.isBIP85
            ? `for ${getSignerNameFromType(signer.type, signer.isMock, false)}`
            : `for ${`${getSignerNameFromType(signer.type, signer.isMock, false)} +`}`
        }
      />
      <Box style={styles.titleContainer}>
        <Text fontSize={15} color={`${colorMode}.primaryText`} semiBold>
          {vaultText.recentHistory}
        </Text>
      </Box>
      <ScrollView
        contentContainerStyle={styles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        <Box style={styles.healthCheckContainer}>
          {showLoader ? (
            <ActivityIndicatorView visible={showLoader} showLoader />
          ) : healthCheckArray.length === 0 ? (
            <EmptyHistoryView colorMode={colorMode} vaultText={vaultText} />
          ) : signer.type !== SignerType.MY_KEEPER ? (
            healthCheckArray.map((item, index) => (
              <SigningDeviceChecklist
                status={item.type}
                key={index.toString()}
                date={item.actionDate}
              />
            ))
          ) : (
            history.map((item, index) => (
              <SigningDeviceChecklist
                status={item?.title}
                key={index.toString()}
                date={moment.unix(item?.date).toDate()}
              />
            ))
          )}
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
}

export default KeyHistory;

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: hp(30),
    paddingHorizontal: wp(12),
    paddingBottom: hp(25),
  },
  contentContainerStyle: {
    flexGrow: 1,
  },
  healthCheckContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: wp(10),
  },
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '90%',
  },
  emptyStateContainer: {
    marginLeft: wp(20),
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: hp(3),
  },
  emptySubText: {
    fontSize: 14,
    lineHeight: 20,
    width: wp(250),
    textAlign: 'center',
    marginBottom: hp(30),
  },
});
