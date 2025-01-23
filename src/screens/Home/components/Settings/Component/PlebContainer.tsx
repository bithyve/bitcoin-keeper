import React from 'react';
import { Box } from 'native-base';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Text from 'src/components/KeeperText';
import { StyleSheet } from 'react-native';
import { windowWidth, wp } from 'src/constants/responsive';

interface PlebContainerProps {
  backgroundColor?: string;
  title?: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  description?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
}

const PlebContainer: React.FC<PlebContainerProps> = ({
  backgroundColor = 'transparent',
  title,
  titleColor,
  subtitleColor,
  subtitle,
  icon,
  description,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Box backgroundColor={backgroundColor} style={styles.Container}>
        <Box>
          <Text color={titleColor} fontSize={14} semiBold style={styles.title}>
            {title}{' '}
            {subtitle && (
              <Text color={subtitleColor} fontSize={12} medium>
                ({subtitle})
              </Text>
            )}
          </Text>
          {description && (
            <Text fontSize={12} color={subtitleColor}>
              {description}
            </Text>
          )}
        </Box>

        <Box>{icon}</Box>
      </Box>
    </TouchableOpacity>
  );
};

export default PlebContainer;

const styles = StyleSheet.create({
  Container: {
    width: windowWidth * 0.89,
    height: wp(84),
    marginBottom: wp(18),
    borderRadius: 15,
    padding: 21,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    marginBottom: 2,
  },
});
