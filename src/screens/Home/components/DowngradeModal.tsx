import { useQuery } from '@realm/react';
import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { useDispatch } from 'react-redux';
import DowngradeToPleb from 'src/assets/images/downgradetopleb.svg';
import DowngradeToPlebDark from 'src/assets/images/downgradetoplebDark.svg';
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { AppSubscriptionLevel, SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import SubScription from 'src/models/interfaces/Subscription';
import Relay from 'src/services/backend/Relay';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useAppSelector } from 'src/store/hooks';
import { setRecepitVerificationFailed } from 'src/store/reducers/login';

async function downgradeToPleb(dispatch, app) {
  try {
    const updatedSubscription: SubScription = {
      receipt: '',
      productId: SubscriptionTier.L1,
      name: SubscriptionTier.L1,
      level: AppSubscriptionLevel.L1,
      icon: 'assets/ic_pleb.svg',
    };
    dbManager.updateObjectById(RealmSchema.KeeperApp, app.id, {
      subscription: updatedSubscription,
    });
    dispatch(setRecepitVerificationFailed(false));
    const response = await Relay.updateSubscription(app.id, app.publicId, {
      productId: SubscriptionTier.L1.toLowerCase(),
    });
  } catch (error) {
    //
  }
}

function DowngradeModalContent({ navigation, app }) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  return (
    <Box>
      {colorMode === 'light' ? <DowngradeToPleb /> : <DowngradeToPlebDark />}
      <Box alignItems="center" flexDirection="row">
        <TouchableOpacity
          testID="btn_choosePlan"
          style={[styles.cancelBtn]}
          onPress={() => {
            navigation.navigate('ChoosePlan');
            dispatch(setRecepitVerificationFailed(false));
          }}
          activeOpacity={0.5}
        >
          <Text numberOfLines={1} style={styles.btnText} color={`${colorMode}.greenText`} bold>
            {common.viewSubscription}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="btn_downgradeplan"
          onPress={() => {
            downgradeToPleb(dispatch, app);
          }}
        >
          <Shadow distance={10} startColor="#073E3926" offset={[3, 4]}>
            <Box style={[styles.createBtn]} backgroundColor={`${colorMode}.greenButtonBackground`}>
              <Text numberOfLines={1} style={styles.btnText} color={`${colorMode}.white`} bold>
                {common.continuePleb}
              </Text>
            </Box>
          </Shadow>
        </TouchableOpacity>
      </Box>
    </Box>
  );
}

export function DowngradeModal({ navigation }) {
  const { colorMode } = useColorMode();
  const app: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const { recepitVerificationFailed } = useAppSelector((state) => state.login);
  const { translations } = useContext(LocalizationContext);
  const { choosePlan } = translations;

  return (
    <KeeperModal
      dismissible={false}
      close={() => { }}
      visible={recepitVerificationFailed}
      title={choosePlan.validateSubscriptionTitle}
      subTitle={choosePlan.validateSubscriptionSubTitle}
      Content={() => <DowngradeModalContent app={app} navigation={navigation} />}
      modalBackground={`${colorMode}.modalWhiteBackground`}
      subTitleColor={`${colorMode}.secondaryText`}
      textColor={`${colorMode}.primaryText`}
      subTitleWidth={wp(210)}
      showButtons
      showCloseIcon={false}
    />
  );
}

const styles = StyleSheet.create({
  cancelBtn: {
    marginRight: wp(20),
    borderRadius: 10,
  },
  btnText: {
    fontSize: 12,
    letterSpacing: 0.84,
  },
  createBtn: {
    paddingVertical: hp(15),
    borderRadius: 10,
    paddingHorizontal: 20,
  },
});
