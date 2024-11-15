import { HStack } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import { hp } from 'src/constants/responsive';
import MenuCard from './MenuCard';

type MenuCardWrapperProps = {
  menuData: {
    title: string;
    description?: string;
    icon: Element;
    selectedIcon: Element;
  }[];
  selectedCard: number;
  onCardSelect: (cardName: number) => void;
  numberOfLines?: number;
};

const MenuCardWrapper = ({
  menuData,
  selectedCard,
  onCardSelect,
  numberOfLines,
}: MenuCardWrapperProps) => {
  return (
    <HStack style={styles.container}>
      {menuData.map((item, index) => (
        <MenuCard
          key={index}
          id={index + 1}
          title={item.title}
          description={item.description}
          icon={item.icon}
          selectedIcon={item.selectedIcon}
          selectedCard={selectedCard}
          onCardSelect={onCardSelect}
          numberOfLines={numberOfLines}
          isFirst={index === 0}
          isLast={index === menuData.length - 1}
        />
      ))}
    </HStack>
  );
};

export default MenuCardWrapper;

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginTop: hp(30),
    marginBottom: hp(10),
  },
});
