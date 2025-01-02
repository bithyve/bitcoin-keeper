import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { hp } from 'src/constants/responsive';

function TabBar({ tabs, activeTab, setActiveTab, width = '100%', radius = 15 }) {
  const { colorMode } = useColorMode();
  return (
    <Box
      style={styles.tabBarContainer}
      borderColor={`${colorMode}.receiptBorder`}
      width={width}
      borderRadius={radius}
    >
      {tabs.map((tab, index) => (
        <Pressable key={index} onPress={() => setActiveTab(index)} style={styles.tabBarItem}>
          <Box
            style={[
              styles.tabBar,
              {
                borderRadius: 0,
                borderTopLeftRadius: index === 0 ? radius : 0,
                borderBottomLeftRadius: index === 0 ? radius : 0,
                borderTopRightRadius: index === tabs.length - 1 ? radius : 0,
                borderBottomRightRadius: index === tabs.length - 1 ? radius : 0,
              },
            ]}
            backgroundColor={
              activeTab === index
                ? `${colorMode}.pantoneGreen`
                : `${colorMode}.boxSecondaryBackground`
            }
          >
            <Text
              color={
                activeTab === index && colorMode === 'light'
                  ? `${colorMode}.white`
                  : `${colorMode}.primaryText`
              }
            >
              {tab.label}
            </Text>
          </Box>
        </Pressable>
      ))}
    </Box>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
    height: hp(38),
    borderWidth: 1,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TabBar;
