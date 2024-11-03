import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import { wp } from 'src/constants/responsive';

function ApproveTransVaultContent({ setVisibleTransVaultModal, onTransferNow }) {
  const { colorMode } = useColorMode();
  return (
    <>
      <Box style={styles.approveTransContainer}>
        <Text color={`${colorMode}.secondaryText`} fontSize={13} style={styles.pv10}>
          Once approved, bitcoin will be transferred from the wallets to the vault for safekeeping
        </Text>
        <Text color={`${colorMode}.secondaryText`} fontSize={13} style={styles.pv10}>
          You can change the policy that triggers auto-transfer to suit your needs
        </Text>
      </Box>
      <Buttons
        secondaryText="Remind me Later"
        secondaryCallback={() => {
          setVisibleTransVaultModal(false);
        }}
        primaryText="Transfer Now"
        primaryCallback={() => onTransferNow()}
        paddingHorizontal={wp(20)}
      />
    </>
  );
}

export default ApproveTransVaultContent;

const styles = StyleSheet.create({
  approveTransContainer: {
    marginVertical: 25,
  },
  pv10: {
    paddingVertical: 10,
  },
});
