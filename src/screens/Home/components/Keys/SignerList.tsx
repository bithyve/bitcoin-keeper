import { CommonActions } from '@react-navigation/native';
import { Box, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import SignerCard from 'src/screens/AddSigner/SignerCard';
import { getSignerDescription, getSignerNameFromType } from 'src/hardware';
import { useIndicatorHook } from 'src/hooks/useIndicatorHook';
import useSigners from 'src/hooks/useSigners';
import { uaiType } from 'src/models/interfaces/Uai';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';
import { SignerType } from 'src/services/wallets/enums';
import { getKeyUID } from 'src/utils/utilities';
import { windowWidth, wp } from 'src/constants/responsive';
import DashedCta from 'src/components/DashedCta';
import Plus from 'src/assets/images/add-plus-white.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import HardwareModalMap, { InteracationMode } from 'src/screens/Vault/HardwareModalMap';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useSelector } from 'react-redux';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';

const SignerList = ({ navigation, handleModalOpen }) => {
  const { signers } = useSigners('', false);
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { signer } = translations;
  const [showSSModal, setShowSSModal] = useState(false);

  const list = signers.filter((signer) => !signer.hidden);
  const { typeBasedIndicator } = useIndicatorHook({
    types: [uaiType.SIGNING_DEVICES_HEALTH_CHECK, uaiType.RECOVERY_PHRASE_HEALTH_CHECK],
  });
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const PrivateThemeLight = themeMode === 'PRIVATE_LIGHT';
  const HexagonIcon = ThemedColor({ name: 'HexagonIcon' });

  const handleCardSelect = (signer) => {
    navigation.dispatch(
      CommonActions.navigate('SigningDeviceDetails', {
        signerId: getKeyUID(signer),
      })
    );
  };

  const closeSSModal = () => setShowSSModal(false);
  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];

  const customStyle: ViewStyle = {
    width: windowWidth * 0.42,
    height: wp(135),
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3,
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
              signer.type !== SignerType.MY_KEEPER &&
              typeBasedIndicator?.[uaiType.SIGNING_DEVICES_HEALTH_CHECK]?.[item.masterFingerprint];

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
                icon={SDIcons({ type: signer.type, light: true }).Icon}
                image={signer?.extraData?.thumbnailPath}
                showSelection={false}
                showDot={showDot}
                colorVarient="green"
                colorMode={colorMode}
              />
            );
          })}
          <DashedCta
            backgroundColor={PrivateThemeLight ? `transparent` : `${colorMode}.dullGreen`}
            hexagonBackgroundColor={HexagonIcon}
            textColor={`${colorMode}.greenWhiteText`}
            name={signer.addKey}
            callback={handleModalOpen}
            icon={<Plus width={12.9} height={12.9} />}
            iconWidth={33}
            iconHeight={30}
            customStyle={customStyle}
          />
        </Box>
        <HardwareModalMap
          visible={showSSModal}
          close={closeSSModal}
          type={SignerType.POLICY_SERVER}
          mode={InteracationMode.VAULT_ADDITION}
          isMultisig={true}
          primaryMnemonic={primaryMnemonic}
          addSignerFlow={true}
        />
      </Box>
    </ScrollView>
  );
};

export default SignerList;

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
    width: windowWidth,
  },
  addedSignersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
    paddingBottom: 20,
  },
});
