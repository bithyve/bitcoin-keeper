import React from 'react';
import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
// components and functions
import { wp, hp, windowHeight } from 'src/common/data/responsiveness/responsive';
import HeaderTitle from 'src/components/HeaderTitle';
import Buttons from 'src/components/Buttons';
import Note from 'src/components/Note/Note';
import KeeperModal from 'src/components/KeeperModal';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import { setInheritance } from 'src/store/reducers/settings';
// icons and asserts
import Assert from 'src/assets/images/illustration.svg';
import Vault from 'src/assets/images/svgs/vault.svg';
import SettingUp from 'src/assets/images/svgs/settingup.svg';
import Recovery from 'src/assets/images/svgs/recovery.svg';
import Inheritance from 'src/assets/images/svgs/inheritance_Inner.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import openLink from 'src/utils/OpenLink';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';

function SetupInheritance() {
  const navigtaion = useNavigation();
  const dispatch = useAppDispatch();
  const introModal = useAppSelector((state) => state.settings.inheritanceModal);
  const { showToast } = useToastMessage();

  const inheritanceData = [
    {
      title: 'Safeguarding Tips',
      subTitle: 'For yourself',
      description:
        'Consists of tips on things to consider while storing your signing devices for the purpose of inheritance (when it will be needed by someone else)',
      Icon: Vault,
    },
    {
      title: 'Letter to the Attorney',
      subTitle: 'For the estate management company',
      description:
        'A partly pre-filled pdf template uniquely identifying the vault and ability to add the beneficiary details',
      Icon: SettingUp,
    },
    {
      title: 'Recovery Instructions',
      subTitle: 'For the heir or beneficiary',
      description:
        'A document that will help the beneficiary recover the vault with or without the Keeper app',
      Icon: Recovery,
    },
  ];

  function InheritancePoint({ title, subTitle, description, Icon }) {
    return (
      <Box style={styles.modalContainer}>
        <Box style={styles.modalTopContainer}>
          <Icon />
          <Box style={{ marginLeft: wp(15) }}>
            <Text color="light.white" numberOfLines={2} style={styles.modalTitle}>
              {title}
            </Text>
            <Text color="light.white" numberOfLines={2} style={styles.modalSubtitle}>
              {subTitle}
            </Text>
          </Box>
        </Box>
        <Text color="light.white" style={styles.modalDesc}>
          {description}
        </Text>
      </Box>
    );
  }

  function InheritanceContent() {
    return (
      <Box>
        {inheritanceData.map((item) => (
          <InheritancePoint
            title={item.title}
            description={item.description}
            subTitle={item.subTitle}
            Icon={item.Icon}
          />
        ))}
      </Box>
    );
  }

  function GradientIcon({ height, Icon }) {
    return (
      <LinearGradient
        colors={['#00836A', '#073E39']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          ...styles.gradientIcon,
          height: hp(height),
          width: hp(height),
          borderRadius: height,
        }}
      >
        <Icon />
      </LinearGradient>
    );
  }
  const proceedCallback = () => {
    dispatch(setInheritance(false));
    showToast('Inheritance flow coming soon');
  };
  return (
    <ScreenWrapper>
      <Box style={styles.header}>
        <HeaderTitle
          onPressHandler={() => navigtaion.goBack()}
          learnMore
          learnMorePressed={() => {
            dispatch(setInheritance(true));
          }}
        />
      </Box>
      <Box style={styles.topContainer}>
        <GradientIcon Icon={Inheritance} height={50} />
        <Text color="light.textWallet" style={styles.title}>
          Inheritance Support
        </Text>
        <Text color="light.secondaryText" style={styles.subtitle}>
          Keeper provides you with the tips and tools you need to include the vault in your estate
          planning
        </Text>
      </Box>

      <Box style={styles.bottomContainer}>
        <Assert />
        <Text numberOfLines={2} fontWeight={100} style={styles.message}>
          {`This can be activated once you are at the ${SubscriptionTier.L3} level`}
        </Text>
        <Box style={{ marginTop: windowHeight > 700 ? hp(50) : hp(20) }}>
          <Buttons
            primaryText="Select Country"
            primaryCallback={() => {
              showToast('Inheritance flow coming soon');
            }}
            paddingHorizontal={wp(20)}
          />
        </Box>
      </Box>
      <Box style={styles.note}>
        <Note
          title="Note"
          subtitle="Consult your estate planning company to ensure the documents provided here are suitable for your needs and are as per your jurisdiction"
          subtitleColor="GreyText"
        />
      </Box>
      <KeeperModal
        visible={introModal}
        close={() => {
          dispatch(setInheritance(false));
        }}
        title="Inheritance"
        subTitle="Securely bequeath your bitcoin"
        modalBackground={['#00836A', '#073E39']}
        textColor="#FFFFFF"
        buttonText="Proceed"
        buttonTextColor="#073E39"
        buttonBackground={['#FFFFFF', '#80A8A1']}
        buttonCallback={() => proceedCallback()}
        Content={InheritanceContent}
        DarkCloseIcon
        learnMore
        learnMoreCallback={() => openLink('https://www.bitcoinkeeper.app/')}
      />
    </ScreenWrapper>
  );
}

const styles = ScaledSheet.create({
  note: {
    position: 'absolute',
    bottom: hp(20),
    paddingHorizontal: 25,
    justifyContent: 'center',
    width: wp(340),
  },

  message: {
    opacity: 0.85,
    fontSize: 12,
    letterSpacing: 0.6,
    marginTop: hp(36),
    width: wp(220),
    textAlign: 'center',
  },
  bottomContainer: {
    marginTop: hp(30),
    alignItems: 'center',
    flex: 1,
  },
  topContainer: {
    alignItems: 'center',
    paddingHorizontal: 1,
  },
  title: {
    fontSize: 16,
    letterSpacing: 0.96,
    marginTop: hp(10),
  },
  subtitle: {
    textAlign: 'center',
    width: wp(250),
    marginTop: hp(4),
    fontSize: 13,
    letterSpacing: 1.3,
  },
  header: {
    marginBottom: -50,
  },
  modalContainer: {
    marginBottom: hp(25),
  },
  modalTitle: {
    fontSize: 15,
  },
  modalSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  modalDesc: {
    marginTop: hp(16),
    letterSpacing: 0.65,
    width: wp(280),
    alignItems: 'center',
    fontSize: 14,
  },
  modalTopContainer: {
    width: wp(300),
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradientIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default SetupInheritance;
