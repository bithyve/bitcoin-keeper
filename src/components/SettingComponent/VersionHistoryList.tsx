import React from 'react';
import Text from 'src/components/KeeperText';
import { FlatList, Box, useColorMode } from 'native-base';
import moment from 'moment';

import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useQuery } from '@realm/react';
import DotView from '../DotView';

function VersionHistoryList() {
  const { colorMode } = useColorMode();
  const VersionHistoryData = useQuery(RealmSchema.VersionHistory).map(getJSONFromRealmObject);

  return (
    <FlatList
      style={{ overflow: 'visible' }}
      data={VersionHistoryData.reverse()}
      renderItem={({ item }) => (
        <Box padding={1} position="relative">
          <Box
            zIndex={99}
            position="absolute"
            left={-3}
            top={0}
            backgroundColor={`${colorMode}.secondaryBackground`}
            padding={1}
            borderRadius={15}
          >
            <DotView height={2} width={2} color="light.lightAccent" />
          </Box>
          <Box borderLeftColor="light.lightAccent" borderLeftWidth={1} width="100%">
            <Text
              color={`${colorMode}.GreyText`}
              fontSize={10}
              bold
              ml={5}
              opacity={0.7}
              letterSpacing={0.3}
            >
              {/* {item.date} */}
              {moment(item.date).format('ddd DD MMM YYYY HH:mma')}
            </Text>
            <Box
              backgroundColor={`${colorMode}.seashellWhite`}
              padding={5}
              borderRadius={10}
              my={2}
              ml={5}
            >
              <Text color={`${colorMode}.headerText`} letterSpacing={1} fontSize={14}>
                {item.title}
              </Text>
              <Text color={`${colorMode}.GreyText`} letterSpacing={1} fontSize={12}>
                {item.version}
              </Text>
              <Text color={`${colorMode}.GreyText`} letterSpacing={1} fontSize={12}>
                {item.releaseNote}
              </Text>
            </Box>
          </Box>
        </Box>
      )}
      keyExtractor={(item) => item.version}
    />
  );
}
export default VersionHistoryList;
