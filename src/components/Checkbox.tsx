import { Pressable, StyleSheet, View } from 'react-native';
import React from 'react';
import Selected from 'src/assets/images/selected.svg';
import UnSelected from 'src/assets/images/unselected.svg';
import Text from './KeeperText';

function CheckBox(props) {
  const IconName = props.isChecked ? <Selected /> : <UnSelected />;

  return (
    <View style={styles.container}>
      <Pressable onPress={props.onPress}>{IconName}</Pressable>
      <View style={{ flexDirection: 'column', marginLeft: 15 }}>
        <Text style={styles.title} medium>
          {props.title}
        </Text>
        {props.subTitle && props.subTitle.length > 0 && (
          <Text style={styles.subtitle} color="light.secondaryText">
            {props.subTitle}
          </Text>
        )}
      </View>
    </View>
  );
}

export default CheckBox;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 5,
    marginHorizontal: 5,
  },
  title: {
    fontSize: 14,
    color: '#041513',
  },
  subtitle: {
    fontSize: 15,
  },
});
