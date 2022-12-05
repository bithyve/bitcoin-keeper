import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import CheckBoxIconUnchecked from 'src/assets/icons/checkbox.svg';
import CheckBoxIconChecked from 'src/assets/icons/checkbox_filled.svg';
import { authStatus } from '../../constants';

function AuthCard({ type, status = authStatus.QUEUED }) {
  return (
    <View style={styles.authTypeContatiner}>
      <View style={styles.authStatusConatiner}>
        {status === authStatus.APPROVED ? <CheckBoxIconChecked /> : <CheckBoxIconUnchecked />}
        <Text style={[styles.authText, getStyles(status).authText]}>{type}</Text>
      </View>
      <View style={styles.authStatusConatiner}>
        <Text style={[styles.authStatusText, getStyles(status).authStatusText]}>{status}</Text>
      </View>
    </View>
  );
}

export default AuthCard;

const getStyles = (status) => {
  if (status === authStatus.QUEUED) return queuedStyles;
  if (status === authStatus.APPROVED) return approvedStyles;
  if (status === authStatus.IN_PROGRESS) return inProgressStyles;
};

const styles = StyleSheet.create({
  authTypeContatiner: { margin: 30, flexDirection: 'row', justifyContent: 'space-between' },
  authText: { marginLeft: 10, color: '#FDF7F0', fontSize: 22 },
  authStatusConatiner: { flexDirection: 'row', alignItems: 'center' },
  authStatusText: { alignSelf: 'flex-end', fontSize: 14, color: '#FDF7F0' },
});

const inProgressStyles = StyleSheet.create({
  authText: { fontSize: 18 },
  authStatusText: { color: '#FDF7F0' },
});

const queuedStyles = StyleSheet.create({
  authText: { fontSize: 12, color: '#7D7E7B' },
  authStatusText: { fontSize: 10, color: '#7D7E7B' },
});

const approvedStyles = StyleSheet.create({
  authText: { fontSize: 14 },
  authStatusText: { fontSize: 12, color: '#62C5BF' },
});
