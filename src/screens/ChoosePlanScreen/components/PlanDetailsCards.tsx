import { Box, Flex, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import PlanCheckMark from 'src/assets/images/planCheckMark.svg';
import PlanCheckMarkWhite from 'src/assets/images/plan-white-check.svg';

const PlanDetailsCards = ({ plansData, currentPosition }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  return (
    <Flex style={styles.container} backgroundColor={`${colorMode}.secondaryBackground`}>
      <Box>
        {plansData?.[currentPosition]?.benifits.map(
          (benifit) =>
            benifit !== '*Coming soon' && (
              <Box style={styles.benefitContainer} key={benifit}>
                <Box style={styles.iconContainer}>
                  {isDarkMode ? <PlanCheckMarkWhite /> : <PlanCheckMark />}
                </Box>
                <Text fontSize={13} color={`${colorMode}.subPlansubtitle`}>
                  {`${benifit}`}
                </Text>
              </Box>
            )
        )}
      </Box>
    </Flex>
  );
};

export default PlanDetailsCards;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  benefitContainer: {
    flexDirection: 'row',
    gap: 10,
    width: wp(260),
    alignItems: 'flex-start',
    marginVertical: hp(6),
  },
  iconContainer: {
    marginTop: 6,
  },
  titleContainer: {
    position: 'absolute',
    top: -19,
    left: 10,
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 1,
  },
});
