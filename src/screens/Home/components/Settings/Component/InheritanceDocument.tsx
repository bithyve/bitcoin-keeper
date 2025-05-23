import React from 'react';
import { Box, useColorMode } from 'native-base';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Text from 'src/components/KeeperText';
import { StyleSheet } from 'react-native';
import { windowWidth, wp } from 'src/constants/responsive';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import WhiteRightArrowIcon from 'src/assets/images/whiteRightIcon.svg';

interface InheritanceDocumentProps {
  backgroundColor?: string;
  borderColor?: any;
  title?: string;
  titleColor?: string;
  subtitleColor?: string;
  description?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
}

const InheritanceDocument: React.FC<InheritanceDocumentProps> = ({
  backgroundColor = 'transparent',
  title,
  titleColor,
  borderColor,
  subtitleColor,
  icon,
  description,
  onPress,
}) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  return (
    <TouchableOpacity onPress={onPress} testID={`btn_inheritance_${title}`}>
      <Box backgroundColor={backgroundColor} borderColor={borderColor} style={styles.Container}>
        <Box style={styles.document}>
          <Box style={styles.icon}>
            <CircleIconWrapper
              width={wp(25)}
              icon={icon}
              backgroundColor={`${colorMode}.pantoneGreen`}
            />
          </Box>
          <Box>
            <Text color={titleColor} fontSize={14} medium style={styles.title}>
              {title}
            </Text>
            {description && (
              <Text fontSize={12} color={subtitleColor}>
                {description}
              </Text>
            )}
          </Box>
        </Box>
        <Box>{isDarkMode ? <WhiteRightArrowIcon /> : <RightArrowIcon />}</Box>
      </Box>
    </TouchableOpacity>
  );
};

export default InheritanceDocument;

const styles = StyleSheet.create({
  Container: {
    width: windowWidth * 0.89,
    height: wp(76),
    marginBottom: wp(14),
    borderRadius: 15,
    padding: wp(21),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  document: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 10,
  },
  title: {
    marginBottom: wp(2),
  },
  icon: {
    paddingBottom: wp(3),
  },
});
