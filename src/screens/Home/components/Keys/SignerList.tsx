import { CommonActions } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import SignerCard from 'src/screens/AddSigner/SignerCard';
import { getSignerDescription, getSignerNameFromType } from 'src/hardware';
import { useIndicatorHook } from 'src/hooks/useIndicatorHook';
import useSigners from 'src/hooks/useSigners';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { uaiType } from 'src/models/interfaces/Uai';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';
import { SignerType } from 'src/services/wallets/enums';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getKeyUID } from 'src/utils/utilities';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import DashedCta from 'src/components/DashedCta';
import Colors from 'src/theme/Colors';
import Plus from 'src/assets/images/add-plus-white.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const SignerList = ({ navigation, handleModalOpen }) => {
  const { signers } = useSigners();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { signer } = translations;

  const list = signers.filter((signer) => !signer.hidden);
  const { id: appRecoveryKeyId }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const { typeBasedIndicator } = useIndicatorHook({
    types: [uaiType.SIGNING_DEVICES_HEALTH_CHECK, uaiType.RECOVERY_PHRASE_HEALTH_CHECK],
  });

  const handleCardSelect = (signer) => {
    navigation.dispatch(
      CommonActions.navigate('SigningDeviceDetails', {
        signerId: getKeyUID(signer),
      })
    );
  };

  const customStyle: ViewStyle = {
    width: wp(162),
    height: wp(126),
    // padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginLeft: 4,
    marginTop: 4,
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
      <Box style={styles.wrapper}>
        <Box style={styles.addedSignersContainer}>
          {list.map((item) => {
            const signer = item;
            if (!signer || signer.archived) {
              return null;
            }

            const showDot =
              (signer.type !== SignerType.MY_KEEPER &&
                typeBasedIndicator?.[uaiType.SIGNING_DEVICES_HEALTH_CHECK]?.[
                  item.masterFingerprint
                ]) ||
              (signer.type !== SignerType.MY_KEEPER &&
                typeBasedIndicator?.[uaiType.RECOVERY_PHRASE_HEALTH_CHECK]?.[appRecoveryKeyId]);

            return (
              <SignerCard
                key={getKeyUID(signer)}
                onCardSelect={() => {
                  handleCardSelect(signer);
                }}
                name={
                  !signer.isBIP85
                    ? getSignerNameFromType(signer.type, signer.isMock, false)
                    : `${getSignerNameFromType(signer.type, signer.isMock, false)} +`
                }
                subtitle={getSignerDescription(signer)}
                icon={SDIcons(signer.type, true).Icon}
                image={signer?.extraData?.thumbnailPath}
                showSelection={false}
                showDot={showDot}
                colorVarient="green"
                colorMode={colorMode}
                customStyle={styles.signerCard}
              />
            );
          })}
          <DashedCta
            backgroundColor={`${colorMode}.DashedButtonCta`}
            hexagonBackgroundColor={Colors.pantoneGreen}
            textColor={`${colorMode}.greenWhiteText`}
            name={signer.addKey}
            callback={handleModalOpen}
            icon={<Plus width={12.9} height={12.9} />}
            iconWidth={33}
            iconHeight={30}
            customStyle={customStyle}
          />
        </Box>
      </Box>
    </ScrollView>
  );
};

export default SignerList;

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    paddingLeft: 15,
    justifyContent: 'center',
    alignContent: 'center',
  },
  addedSignersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    paddingBottom: 20,
  },
  signerCard: {
    width: windowWidth * 0.43,
    height: wp(130),
  },
});
