import React from 'react';
import { StyleSheet } from 'react-native';
import { Box } from 'native-base';
import ActionCard from 'src/components/ActionCard';
import { hp } from 'src/constants/responsive';
import HeaderDetails from '../components/HeaderDetails';

export function TopSection({ colorMode, top, cardsData }) {
  return (
    <Box
      backgroundColor={`${colorMode}.primaryGreenBackground`}
      style={[styles.wrapper, { paddingTop: top }]}
    >
      <Box width="90%" style={styles.padding}>
        <HeaderDetails />
      </Box>
      <Box style={styles.actionContainer}>
        {cardsData.map((data, index) => (
          <ActionCard
            key={`${index}_${data.name}`}
            cardName={data.name}
            callback={data.callback}
            icon={data.icon}
            dottedBorder
            cardPillText={data?.cardPillText}
          />
        ))}
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  padding: {
    paddingHorizontal: 10,
  },
  wrapper: {
    flex: 0.35,
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    position: 'absolute',
    top: hp(230),
  },
});
