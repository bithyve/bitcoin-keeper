import { Box, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import HorizontalAddCard from 'src/components/HorizontalAddCard';
import KeeperHeader from 'src/components/KeeperHeader';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import OptionPicker from 'src/components/OptionPicker';
import { useNavigation } from '@react-navigation/native';
import { ADDRESERVEKEY } from 'src/navigation/contants';
import useSignerMap from 'src/hooks/useSignerMap';
import HorizontalSignerCard from '../AddSigner/HorizontalSignerCard';
import { getSignerNameFromType } from 'src/hardware';
import moment from 'moment';
import { SDIcons } from './SigningDeviceIcons';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import KEEPERAPP from 'src/assets/images/KeeperIcon.svg';
import KEEPERAPPLIGHT from 'src/assets/images/KeeperIconLight.svg';
import Note from 'src/components/Note/Note';
import Buttons from 'src/components/Buttons';
import CreateReserveKeyVault from './CreateReserveKeyVault';

const TIMELOCK_DURATIONS = [
  { label: '3 months', value: 3 * 30 * 24 * 60 * 60 * 1000 },
  { label: '6 months', value: 6 * 30 * 24 * 60 * 60 * 1000 },
  { label: '1 year', value: 12 * 30 * 24 * 60 * 60 * 1000 },
  { label: '2 years', value: 24 * 30 * 24 * 60 * 60 * 1000 },
];

const AddReserveKey = ({ route }) => {
  const { vaultKeys, name, scheme, description, vaultId } = route.params;
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { signerMap } = useSignerMap();
  const { translations } = useContext(LocalizationContext);
  const { common, vault: vaultTranslations } = translations;
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedSigner, setSelectedSigner] = useState(null);
  const [vaultCreating, setCreating] = useState(false);

  const reservedKey = selectedSigner ? signerMap[selectedSigner[0]?.masterFingerprint] : null;
  const isDarkMode = colorMode === 'dark';

  const userKeyCallback = () => {
    navigation.push('AddSigningDevice', {
      parentScreen: ADDRESERVEKEY,
      selectedSignersFromParams: vaultKeys,
      selectedReserveKey: selectedSigner,
      scheme: scheme,
      onGoBack: (signer) => setSelectedSigner(signer),
    });
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={vaultTranslations.addInheritanceKey}
        subtitle={vaultTranslations.setIKSForVault}
      />
      <Box style={styles.container}>
        <Box style={styles.contentContainer}>
          <Box style={styles.optionContainer}>
            <Box style={styles.textContainer}>
              <Text color={`${colorMode}.greenishGreyText`} fontSize={12}>
                {vaultTranslations.IKSModalDesc}
              </Text>
            </Box>
            <Box style={styles.cardContainer}>
              {!reservedKey ? (
                <HorizontalAddCard
                  name={vaultTranslations.addReserveKey}
                  cardStyles={{ minHeight: hp(92) }}
                  iconWidth={25}
                  iconHeight={22}
                  callback={userKeyCallback}
                  KeyIcon={isDarkMode ? KEEPERAPPLIGHT : KEEPERAPP}
                />
              ) : (
                <HorizontalSignerCard
                  key={reservedKey.masterFingerprint}
                  name={getSignerNameFromType(reservedKey.type, reservedKey.isMock, false)}
                  description={`${common.added} ${moment(reservedKey.addedOn).calendar()}`}
                  icon={SDIcons(reservedKey.type).Icon}
                  isSelected={false}
                  showSelection={false}
                  changeKey={userKeyCallback}
                  colorMode={colorMode}
                />
              )}
            </Box>
          </Box>
          <Box style={styles.optionContainer}>
            <Box style={styles.textContainer}>
              <Text color={`${colorMode}.primaryText`}>
                {vaultTranslations.inheritanceKeyActivation}
              </Text>
              <Text color={`${colorMode}.greenishGreyText`} fontSize={12}>
                {vaultTranslations.availableAfterDelay}
              </Text>
            </Box>
            <Box style={styles.cardContainer}>
              <OptionPicker
                label={vaultTranslations.setTimeLock}
                options={TIMELOCK_DURATIONS}
                selectedOption={selectedOption}
                onOptionSelect={(option) => setSelectedOption(option)}
              />
            </Box>
          </Box>
        </Box>
        <Box style={styles.bottomContainer}>
          <Note title={common.note} subtitle={vaultTranslations.reserveKeyNote} />
          <Buttons
            primaryText={common.confirm}
            fullWidth
            primaryDisable={!selectedSigner || !selectedOption}
            primaryCallback={() => setCreating(true)}
          />
        </Box>
      </Box>
      <CreateReserveKeyVault
        vaultCreating={vaultCreating}
        setCreating={setCreating}
        vaultKeys={vaultKeys}
        scheme={scheme}
        name={name}
        description={description}
        vaultId={vaultId}
      />
    </ScreenWrapper>
  );
};

export default AddReserveKey;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: hp(20),
    paddingHorizontal: wp(10),
    justifyContent: 'space-between',
  },
  textContainer: {
    gap: hp(5),
  },
  optionContainer: {},
  cardContainer: {
    marginTop: hp(22),
  },
  contentContainer: {
    gap: hp(25),
  },
  bottomContainer: {
    gap: hp(20),
  },
  noteContainer: {
    justifyContent: 'flex-end',
    width: wp(330),
  },
});
