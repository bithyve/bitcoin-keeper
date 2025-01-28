import React, { useState, useMemo, useEffect, useCallback, useContext } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Box } from 'native-base';
import { hp, wp } from 'src/constants/responsive';
import Text from './KeeperText';
import { TouchableOpacity } from 'react-native-gesture-handler';
import NotificationSimpleIcon from 'src/assets/images/header-notification-simple-icon.svg';
import NotificationDotIcon from 'src/assets/images/header-notifications-dot-icon.svg';
import { capitalizeEachWord } from 'src/utils/utilities';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import useUaiStack, { uaiPriorityMap } from 'src/hooks/useUaiStack';
import XIcon from 'src/assets/images/x.svg';
import { uaisSeen } from 'src/store/sagaActions/uai';
import { useDispatch } from 'react-redux';
import { uaiType } from 'src/models/interfaces/Uai';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getUaiContent } from 'src/screens/Home/Notifications/NotificationsCenter';
import { setRefreshUai } from 'src/store/reducers/uai';
import { LocalizationContext } from 'src/context/Localization/LocContext';

interface HomeScreenHeaderProps {
  colorMode: string;
  circleIconWrapper: React.ReactNode;
  title: string;
}

const HomeScreenHeader: React.FC<HomeScreenHeaderProps> = ({
  colorMode,
  circleIconWrapper,
  title,
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { uaiStack } = useUaiStack();
  const navigtaion = useNavigation();
  const backupHistory = useQuery(RealmSchema.BackupHistory);
  const { translations } = useContext(LocalizationContext);
  const { wallet, common } = translations;

  useFocusEffect(
    useCallback(() => {
      dispatch(setRefreshUai());
    }, [dispatch])
  );
  // Get latest unseen UAI
  const latestUnseenUai = useMemo(() => {
    if (!uaiStack?.length) return null;

    // Filter for unseen notifications and sort by timestamp
    const unseenUais = uaiStack.filter((uai) => !uai.seenAt && uaiPriorityMap[uai.uaiType] >= 90);
    return unseenUais[0] || null;
  }, [uaiStack]);

  const hasUnseenUai = useMemo(() => {
    if (!uaiStack?.length) return false;

    // Filter for unseen notifications and sort by timestamp
    const unseenUais = uaiStack.filter((uai) => !uai.seenAt);
    return unseenUais && unseenUais.length > 0;
  }, [uaiStack]);

  const [localLatestUnseenUai, setLocalLatestUnseenUai] = useState(null);

  // Update local state when memo updates
  useEffect(() => {
    setLocalLatestUnseenUai(latestUnseenUai);
  }, [latestUnseenUai]);

  const UAI_ACTION_MAP = {
    [uaiType.SIGNING_DEVICES_HEALTH_CHECK]: () =>
      navigtaion.navigate('SigningDeviceDetails', {
        signerId: localLatestUnseenUai?.entityId,
        isUaiFlow: true,
      }),
    [uaiType.RECOVERY_PHRASE_HEALTH_CHECK]: () => {
      if (backupHistory.length === 0) {
        navigtaion.navigate('Home', {
          selectedOption: 'More',
          isUaiFlow: true,
        });
      } else {
        navigtaion.navigate('WalletBackHistory', {
          isUaiFlow: true,
        });
      }
    },
    [uaiType.CANARAY_WALLET]: () =>
      navigtaion.navigate('VaultDetails', { vaultId: localLatestUnseenUai?.entityId }),
    [uaiType.ZENDESK_TICKET]: () =>
      navigtaion.navigate('TicketDetails', {
        ticketId: parseInt(localLatestUnseenUai?.entityId),
        ticketStatus: localLatestUnseenUai?.uaiDetails.heading,
      }),
  };

  return (
    <Box>
      <Box
        backgroundColor={`${colorMode}.pantoneGreen`}
        style={[
          styles.wrapper,
          isSmallDevice
            ? { paddingTop: hp(10), minHeight: hp(117) }
            : { paddingTop: hp(2), minHeight: hp(127) },
        ]}
      >
        <Box width="90%" style={styles.padding}>
          <Box style={[styles.headerData]} testID={`btn_choosePlan`}>
            {circleIconWrapper}
            <Text
              testID="text_home_current_plan"
              style={styles.headerText}
              color={`${colorMode}.choosePlanHome`}
              medium
            >
              {capitalizeEachWord(title === wallet.more ? common.keeperSettings : title)}
            </Text>
          </Box>

          <Box style={[styles.headerData]}>
            <TouchableOpacity
              style={{ padding: 5 }}
              testID="btn_settings"
              onPress={() => navigation.dispatch(CommonActions.navigate('NotificationsCenter'))}
            >
              {hasUnseenUai ? <NotificationDotIcon /> : <NotificationSimpleIcon />}
            </TouchableOpacity>
          </Box>
        </Box>
      </Box>
      {localLatestUnseenUai && (
        <TouchableOpacity onPress={UAI_ACTION_MAP[localLatestUnseenUai.uaiType]}>
          <Box
            backgroundColor={`${colorMode}.BrownNeedHelp`}
            width={'100%'}
            style={{ paddingHorizontal: wp(22), paddingVertical: hp(13) }}
            flexDir={'row'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <NotificationSimpleIcon />
            <Box flex={1} marginLeft={wp(15)}>
              <Text semiBold fontSize={14} color={`${colorMode}.buttonText`}>
                {
                  getUaiContent(localLatestUnseenUai.uaiType, localLatestUnseenUai.uaiDetails)
                    .heading
                }
              </Text>
              <Text medium fontSize={12} color={`${colorMode}.buttonText`}>
                {getUaiContent(localLatestUnseenUai.uaiType, localLatestUnseenUai.uaiDetails).body}
              </Text>
            </Box>
            <TouchableOpacity
              onPress={() => {
                dispatch(uaisSeen({ uaiIds: [localLatestUnseenUai.id] }));
                setLocalLatestUnseenUai(null);
              }}
              style={{
                width: wp(24),
                height: hp(24),
                borderRadius: 15,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <XIcon />
            </TouchableOpacity>
          </Box>
        </TouchableOpacity>
      )}
    </Box>
  );
};

export default HomeScreenHeader;

const styles = StyleSheet.create({
  padding: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wrapper: {
    paddingHorizontal: wp(5),
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  headerData: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: wp(68),
    gap: 10,
  },
  headerText: {
    fontSize: 18,
  },
});
