import React from 'react';
import { StyleSheet, ActivityIndicator, Modal, View } from 'react-native';

function ActivityIndicatorView({ visible }: any) {
  if (visible) {
    return (
      <Modal transparent visible={visible} statusBarTranslucent>
        <View style={styles.container}>
          <ActivityIndicator size="large" animating color="#00836A" />
        </View>
      </Modal>
    );
  }
  return null;
}

export default ActivityIndicatorView;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    bottom: 0,
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
