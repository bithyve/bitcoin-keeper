import React, { useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { Box, Text } from 'native-base';
import {
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
// components
import DevicesComponent from './DevicesComponent';
import Heading from './Heading';
// icons and images
import SettingIcon from 'src/assets/images/svgs/settings.svg';
import Btc from 'src/assets/images/svgs/btcIcon.svg';
// data
import {
  BACKUP_KEYS,
  defaultBackupKeys,
} from 'src/common/data/defaultData/defaultData';

const Vaults = () => {
  const [backupKeys, setBackupKeys] = useState<BACKUP_KEYS[]>([...defaultBackupKeys])

  const Header = ({ title, subTitle }) => {
    return (
      <Box marginY={2}>
        <Text color={'light.lightBlack'} fontSize={14} fontFamily={'body'} fontWeight={200} letterSpacing={0.7}>
          {title}
        </Text>
        <Text color={'light.lightBlack'} fontSize={12} fontFamily={'body'} fontWeight={100} letterSpacing={0.6}>
          {subTitle}
        </Text>
      </Box>
    )
  }

  const renderBackupKeys = ({ item }) => {
    return <DevicesComponent title={item.title} onPress={item.onPress} Icon={item.Icon} />;
  };

  return (
    <Box
      backgroundColor={'light.lightYellow'}
      height={'100%'}
      borderLeftRadius={20}
      marginTop={10}
      paddingY={6}
      paddingX={8}
    >
      {/* this is Vault card Heading*/}

      <Heading title={'Vault'} subTitle={'Your super secure bitcoin'} />
      {/* this is brown card */}

      <Box
        width={'100%'}
        height={220}
        backgroundColor={'#B2844E'}
        marginY={4}
        borderRadius={10}
        paddingX={5}
        paddingY={8}
      >
        <SettingIcon />

        <Box marginY={8}>
          <Text color={'light.lightYellow'} fontSize={14} letterSpacing={0.7} fontFamily={'body'} fontWeight={200}>
            Retirement
          </Text>
          <Text color={'light.white1'} fontSize={12} letterSpacing={0.6} fontFamily={'body'} fontWeight={100}>
            Beach and sunshine baby!
          </Text>
        </Box>
        <Text color={'light.white1'} fontSize={34} letterSpacing={1.7} fontFamily={'body'} fontWeight={200}>
          <Box marginBottom={2} marginX={1}>
            <Btc />
          </Box>
          0.000024
        </Text>
      </Box>

      {/* these are my signers */}

      <Box marginY={3}>
        <Header title={'My Signers'} subTitle={'Used for securing funds'} />
        <FlatList
          data={backupKeys}
          renderItem={renderBackupKeys}
          keyExtractor={(item) => item?.id}
          horizontal={true}
          style={styles.flatlistContainer}
          showsHorizontalScrollIndicator={false}
        />
      </Box>

      {/* Inheritance section*/}

      <Box marginY={3} flexDirection={'row'} justifyContent={'space-between'}>
        <Header title={'Inheritance'} subTitle={'Set up inheritance to your sats'} />
        <TouchableOpacity style={styles.button}>
          <Text
            color={'light.textDark'}
            fontSize={RFValue(11)}
            fontFamily={'body'}
            fontWeight={'300'}
            letterSpacing={0.88}
          >
            Setup
          </Text>
        </TouchableOpacity>
      </Box>
    </Box>
  )
}

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
  },
  button: {
    borderRadius: 10,
    marginTop: hp(1),
    width: 80,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAC48B'
  },
  flatlistContainer: {
    maxHeight: hp(30),
  },

});

export default Vaults 