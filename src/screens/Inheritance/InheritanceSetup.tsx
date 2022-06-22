import React, { useContext } from 'react';
import { Box, Text, ScrollView, StatusBar } from 'native-base';
import { SafeAreaView, TouchableOpacity } from 'react-native';
import InheritanceCard from './InheritanceCard';
import BackIcon from 'src/assets/icons/back.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import { LocalizationContext } from 'src/common/content/LocContext';

const InheritanceSetup = ({ navigation }) => {

  const { translations } = useContext(LocalizationContext);
  const inheritence = translations['inheritence'];

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: 'light.ReceiveBackground',
      }}
    >
      <StatusBar backgroundColor={'light.ReceiveBackground'} barStyle="dark-content" />
      <ScrollView>
      <Box mx={10} my={10}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </Box>
      <Box mx={3}>
        <Text color={'light.headerText'} fontSize={RFValue(16)} fontFamily={'heading'} pl={10}>
          {inheritence.SetupInheritance}
        </Text>
      </Box>
      <InheritanceCard
            number={1}
            title={inheritence.SetupInheritance}
            description={inheritence.UpgradetoElitetier}
            my={2}
            icon={false}
        />
        <InheritanceCard
            number={2}
            title={inheritence.ActivateInheritance}
            description={inheritence.Downloadandsafelykeepinheritencedocuments}
            my={2}
            icon={false}
        />
        <InheritanceCard
            number={3}
            title={inheritence.Setupfalserecoveryalert}
            description={inheritence.tryingtorecoveryourwallet}
            my={2}
            icon={false}
        />
        <InheritanceCard
            number={4}
            title={inheritence.IndependentRecovery}
            description={inheritence.UnderstandhowyoucanrecoveryourVault}
            my={2}
            icon={false}
        />
        <InheritanceCard
            number={5}
            title={inheritence.Practicehealthcheck}
            description={inheritence.Makessureyousignersareaccessible}
            my={2}
            icon={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
export default InheritanceSetup;