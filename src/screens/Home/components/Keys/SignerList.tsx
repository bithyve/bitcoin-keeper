import { CommonActions } from '@react-navigation/native';
import { Box, useColorMode } from 'native-base';
import React, { useContext, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import SignerCard from 'src/screens/AddSigner/SignerCard';
import { getSignerDescription, getSignerNameFromType } from 'src/hardware';
import { useIndicatorHook } from 'src/hooks/useIndicatorHook';
import useSigners from 'src/hooks/useSigners';
import { uaiType } from 'src/models/interfaces/Uai';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';
import { SignerStorage, SignerType } from 'src/services/wallets/enums';
import { getKeyUID } from 'src/utils/utilities';
import { wp } from 'src/constants/responsive';
import DashedCta from 'src/components/DashedCta';
import Colors from 'src/theme/Colors';
import Plus from 'src/assets/images/add-plus-white.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { AppSubscriptionLevel } from 'src/models/enums/SubscriptionTier';
import useSubscriptionLevel from 'src/hooks/useSubscriptionLevel';
import HardwareModalMap, { InteracationMode } from 'src/screens/Vault/HardwareModalMap';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

const SignerList = ({ navigation, handleModalOpen }) => {
  const { signers } = useSigners();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { signer } = translations;
  const [showSSModal, setShowSSModal] = useState(false);
  const { level } = useSubscriptionLevel();

  const list = signers.filter((signer) => !signer.hidden);
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

  const setupSignigngServer = async () => {
    setShowSSModal(true);
  };
  const closeSSModal = () => setShowSSModal(false);
  const shellKeys = [];
  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];

  const shellAssistedKeys = useMemo(() => {
    const generateShellAssistedKey = (signerType: SignerType) => ({
      type: signerType,
      storageType: SignerStorage.WARM,
      signerName: getSignerNameFromType(signerType, false, false),
      lastHealthCheck: new Date(),
      addedOn: new Date(),
      masterFingerprint: Date.now().toString() + signerType,
      signerXpubs: {},
      hidden: false,
    });

    let hasSigningServer = false;
    let isSigningServerShellCreated = false;

    if (shellKeys.filter((signer) => signer.type === SignerType.POLICY_SERVER).length > 0) {
      isSigningServerShellCreated = true;
    }

    for (const signer of signers) {
      if (signer.type === SignerType.POLICY_SERVER) hasSigningServer = true;
    }

    if (!isSigningServerShellCreated && !hasSigningServer && level >= AppSubscriptionLevel.L2) {
      shellKeys.push(generateShellAssistedKey(SignerType.POLICY_SERVER));
    }

    const addedSignersTypes = signers.map((signer) => signer.type);
    return shellKeys.filter((shellSigner) => !addedSignersTypes.includes(shellSigner.type));
  }, [signers]);

  const renderAssistedKeysShell = () => {
    return shellAssistedKeys.map((shellSigner) => {
      const isAMF = false;
      return (
        <SignerCard
          key={getKeyUID(shellSigner)}
          onCardSelect={() => {
            if (shellSigner.type === SignerType.POLICY_SERVER) setupSignigngServer();
          }}
          name={getSignerNameFromType(shellSigner.type, shellSigner.isMock, isAMF)}
          description="Setup required"
          icon={SDIcons(shellSigner.type).Icon}
          showSelection={false}
          showDot={true}
          colorVarient="green"
          colorMode={colorMode}
        />
      );
    });
  };

  const customStyle: ViewStyle = {
    width: wp(160),
    height: wp(132),
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
                icon={SDIcons(signer.type, true).Icon}
                image={signer?.extraData?.thumbnailPath}
                showSelection={false}
                showDot={showDot}
                colorVarient="green"
                colorMode={colorMode}
              />
            );
          })}
          {renderAssistedKeysShell()}
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
    alignContent: 'center',
    justifyContent: 'center',
  },
  addedSignersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 20,
    gap: wp(2),
  },
});
