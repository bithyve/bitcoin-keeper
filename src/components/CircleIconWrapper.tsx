import { Box } from 'native-base';
import { StyleSheet } from 'react-native';

type Props = {
  icon: Element;
  width?: number;
  backgroundColor?: string;
};

function CircleIconWrapper({ icon, width = 50, backgroundColor }: Props) {
  return (
    <Box
      width={width}
      height={width}
      borderRadius={width / 2}
      backgroundColor={backgroundColor}
      style={styles.alignItems}
    >
      {icon}
    </Box>
  );
}

const styles = StyleSheet.create({
  alignItems: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CircleIconWrapper;
