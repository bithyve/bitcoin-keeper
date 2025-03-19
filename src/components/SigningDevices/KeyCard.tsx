import React from 'react';
import { Box, VStack, HStack, useColorMode } from 'native-base';
import { StyleSheet, ActivityIndicator } from 'react-native';
import Text from 'src/components/KeeperText';
import ActionChip from 'src/components/ActionChip';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import { hp } from 'src/constants/responsive';

function KeyCard({
  icon,
  name,
  description,
  descriptionTitle,
  isLoading,
  primaryAction,
  secondaryAction,
  primaryText,
  secondaryText,
  primaryIcon,
  secondaryIcon,
  dateAdded,
}) {
  const { colorMode } = useColorMode();
  return (
    <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.signerContainer}>
      <VStack space={3} width="100%">
        <HStack justifyContent="space-between" alignItems="center">
          <VStack alignItems="center" style={styles.iconContainer}>
            <HexagonIcon
              width={40}
              height={40}
              backgroundColor={Colors.primaryGreen}
              icon={icon.element}
            />
            <Text medium style={styles.nameText} color={`${colorMode}.primaryText`}>
              {name}
            </Text>
          </VStack>
          <Text fontSize={10} color={`${colorMode}.greenText`} style={styles.dateAdded}>
            {dateAdded}
          </Text>
        </HStack>

        <VStack space={1}>
          {descriptionTitle && (
            <Text medium style={styles.descriptionTitleText} color={`${colorMode}.secondaryText`}>
              {descriptionTitle}
            </Text>
          )}
          {description && (
            <Text style={styles.descriptionText} color={`${colorMode}.secondaryText`}>
              {description}
            </Text>
          )}
        </VStack>

        <HStack space={0.5} justifyContent="flex-end">
          {primaryText && (
            <ActionChip text={primaryText} onPress={primaryAction} Icon={primaryIcon} />
          )}
          {secondaryText && (
            <ActionChip
              text={secondaryText}
              onPress={secondaryAction}
              Icon={isLoading ? <ActivityIndicator color={'white'} /> : secondaryIcon}
            />
          )}
        </HStack>
      </VStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  signerContainer: {
    width: '95%',
    borderRadius: 10,
    padding: 15,
    marginBottom: hp(15),
    alignSelf: 'center',
  },
  dateAdded: {
    marginBottom: hp(30),
  },
  descriptionTitleText: {
    marginTop: hp(8),
    lineHeight: 17,
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 12,
    lineHeight: 14,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: hp(5),
  },
  iconContainer: {
    alignItems: 'flex-start',
  },
});

export default KeyCard;
