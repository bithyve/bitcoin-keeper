import React, { useContext, useEffect } from 'react';
import { Box, Text, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import KeeperModal from 'src/components/KeeperModal';
import { getSignerDescription, getSignerNameFromType } from 'src/hardware';
import config, {
  APP_STAGE,
  PENDING_HEALTH_CHECK_TIME_DEV,
  PENDING_HEALTH_CHECK_TIME_PROD,
} from 'src/utils/service-utilities/config';
import { SignerType, EntityKind, NetworkType } from 'src/services/wallets/enums';
import { wp, hp } from 'src/constants/responsive';
import SignerCard from 'src/screens/AddSigner/SignerCard';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const PendingHealthCheckModal = ({
  selectedItem,
  vaultKeys,
  signerMap,
  keys,
  showHealthCheckModal,
  setShowHealthCheckModal,
  pendingHealthCheckCount,
  setPendingHealthCheckCount,
  title = '',
  subTitle = '',
  description = '',
  buttonText = '',
  primaryButtonCallback,
}) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultTranslation, common } = translations;

  useEffect(() => {
    const countPendingHealthChecks = () => {
      let count = 0;
      keys.forEach((item) => {
        const signer = vaultKeys?.length ? signerMap[item.masterFingerprint] : item;
        if (isHealthCheckPending(signer, vaultKeys, selectedItem)) {
          count++;
        }
      });
      if (count !== pendingHealthCheckCount) {
        setPendingHealthCheckCount(count);
      }
    };

    if (selectedItem?.entityKind === EntityKind.VAULT) {
      countPendingHealthChecks();
    }
  }, [keys, vaultKeys, signerMap, selectedItem]);

  const isHealthCheckPending = (signer, vaultKeys, vault) => {
    const now = new Date();
    const lastHealthCheck = new Date(signer.lastHealthCheck);
    const timeDifference = now.getTime() - lastHealthCheck.getTime();

    if (config.ENVIRONMENT === APP_STAGE.DEVELOPMENT) {
      return (
        vaultKeys?.length && vault.isMultiSig && timeDifference > PENDING_HEALTH_CHECK_TIME_DEV
      );
    } else {
      return (
        vaultKeys?.length &&
        !signer.isMock &&
        vault.isMultiSig &&
        timeDifference > PENDING_HEALTH_CHECK_TIME_PROD
      );
    }
  };

  const SignersList = ({ vaultKeys, signerMap, vault, keys }) => {
    if (!vault) return null;

    const pendingSigners = keys
      .map((item) => {
        const signer = vaultKeys?.length ? signerMap[item.masterFingerprint] : item;
        return { item, signer };
      })
      .filter(({ signer }) => isHealthCheckPending(signer, vaultKeys, vault));

    return (
      <Box style={styles.addedSignersContainer}>
        {pendingSigners.map(({ item, signer }) => {
          return (
            <SignerCard
              key={signer.masterFingerprint}
              name={getSignerNameFromType(signer.type, signer.isMock, signer.isAMF)}
              description={getSignerDescription(signer)}
              customStyle={styles.signerCard}
              icon={SDIcons(signer.type).Icon}
              image={signer?.extraData?.thumbnailPath}
              showSelection={false}
              showDot={true}
              isFullText
              colorVarient="green"
              colorMode={colorMode}
            />
          );
        })}
      </Box>
    );
  };

  return (
    <KeeperModal
      visible={showHealthCheckModal}
      close={() => {
        setShowHealthCheckModal(false);
      }}
      modalBackground={`${colorMode}.modalWhiteBackground`}
      textColor={`${colorMode}.modalWhiteContent`}
      title={title || vaultTranslation.pendingHealthCheck}
      subTitle={subTitle || `${vaultTranslation.pendingHealthCheckSubtitle}`}
      buttonText={buttonText || common.ok}
      buttonCallback={primaryButtonCallback}
      subTitleWidth={wp(280)}
      Content={() => (
        <Box style={styles.signerListContainer}>
          {selectedItem.entityKind === EntityKind.VAULT && (
            <SignersList
              vaultKeys={vaultKeys}
              signerMap={signerMap}
              vault={selectedItem}
              keys={keys}
            />
          )}
          <Text style={styles.desc} color={`${colorMode}.modalWhiteContent`}>
            {description || `${vaultTranslation.pendingHealthCheckDec}`}
          </Text>
        </Box>
      )}
      buttonTextColor={`${colorMode}.buttonText`}
      buttonBackground={`${colorMode}.pantoneGreen`}
      showCloseIcon={false}
    />
  );
};

const styles = StyleSheet.create({
  addedSignersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  signerCard: {
    width: wp(125),
    marginBottom: hp(5),
  },
  signerListContainer: {
    marginTop: hp(-16),
  },
  desc: {
    marginTop: hp(15),
    fontSize: 14,
    fontWeight: '400',
    width: wp(280),
  },
});

export default PendingHealthCheckModal;
