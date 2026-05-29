import React, { useState, useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import Relay from 'src/services/backend/Relay';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { useColorMode } from '@gluestack-ui/themed-native-base';
import { useMemo } from 'react';
import Colors from 'src/theme/Colors';

const RagChunkAdminScreen = () => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const uiColors = useMemo(
    () => ({
      separator: isDarkMode ? '#3a3a3a' : '#d8d8d8',
      primaryText: isDarkMode ? Colors.bodyText : Colors.secondaryBlack,
      secondaryText: isDarkMode ? Colors.darkGrey : Colors.secondaryDarkGrey,
      buttonText: '#ffffff',
      placeholderText: isDarkMode ? '#9b9b9b' : '#8a8a8a',
    }),
    [isDarkMode]
  );

  const { publicId }: KeeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp);
  const [isAllowed, setIsAllowed] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [ragTimestamp, setRagTimestamp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);

  useEffect(() => {
    const checkAccess = async () => {
      setCheckingAccess(true);
      setAccessChecked(false);
      try {
        const response = await Relay.ragChunkAccessCheck(publicId);
        setIsAllowed(!!response?.allowed);
      } catch {
        setIsAllowed(false);
      } finally {
        setAccessChecked(true);
        setCheckingAccess(false);
      }
    };
    checkAccess();
  }, [publicId]);

  const resetFormForAnotherEntry = () => {
    setResponseData(null);
    setContent('');
    setTitle('');
    setUrl('');
    setRagTimestamp('');
  };

  const isValidDate = (value: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    if (isNaN(date.getTime())) return false;
    const [year, month, day] = value.split('-').map(Number);
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() + 1 === month &&
      date.getUTCDate() === day
    );
  };

  const submitChunk = async () => {
    if (!content || content.trim().length < 10) {
      Alert.alert('Error', 'Content must be at least 10 characters long');
      return;
    }
    if (ragTimestamp.trim().length && !isValidDate(ragTimestamp.trim())) {
      Alert.alert('Error', 'Date must be in YYYY-MM-DD format (e.g. 2025-07-22)');
      return;
    }
    setSubmitting(true);
    try {
      const payload: {
        publicId: string;
        content: string;
        title?: string;
        url?: string;
        ragTimestamp?: string;
      } = {
        publicId,
        content: content.trim(),
      };
      if (title.trim().length) payload.title = title.trim();
      if (url.trim().length) payload.url = url.trim();
      if (ragTimestamp.trim().length) payload.ragTimestamp = ragTimestamp.trim();
      const result = await Relay.addRagChunkFrontend(payload);
      setResponseData(result);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper>
      <WalletHeader title="Knowledge Addition" />
      <View style={styles.container}>
        {!accessChecked || checkingAccess ? (
          <Text style={[styles.info, { color: uiColors.secondaryText }]}>Checking access...</Text>
        ) : !isAllowed ? (
          <Text style={[styles.info, { color: uiColors.secondaryText }]}>Access not available</Text>
        ) : responseData ? (
          <View>
            <Text style={[styles.info, { color: uiColors.secondaryText }]}>Ingestion result</Text>
            <Text selectable style={[styles.responseText, { color: uiColors.primaryText }]}>
              {JSON.stringify(responseData, null, 2)}
            </Text>
            <Pressable
              style={[styles.actionButton, { backgroundColor: Colors.primaryGreen }]}
              onPress={resetFormForAnotherEntry}
            >
              <Text style={[styles.actionButtonText, { color: uiColors.buttonText }]}>
                Add another
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            style={styles.formContainer}
            contentContainerStyle={styles.formContentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.fieldLabel, { color: uiColors.secondaryText }]}>
              Title (optional)
            </Text>
            <TextInput
              placeholderTextColor={uiColors.placeholderText}
              value={title}
              onChangeText={setTitle}
              style={[
                styles.input,
                { borderColor: uiColors.separator, color: uiColors.primaryText },
              ]}
            />
            <Text style={[styles.fieldLabel, { color: uiColors.secondaryText }]}>
              URL (optional)
            </Text>
            <TextInput
              placeholderTextColor={uiColors.placeholderText}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.input,
                { borderColor: uiColors.separator, color: uiColors.primaryText },
              ]}
            />
            <Text style={[styles.fieldLabel, { color: uiColors.secondaryText }]}>
              Date (YYYY-MM-DD, optional)
            </Text>
            <TextInput
              placeholderTextColor={uiColors.placeholderText}
              value={ragTimestamp}
              onChangeText={setRagTimestamp}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numeric"
              style={[
                styles.input,
                { borderColor: uiColors.separator, color: uiColors.primaryText },
              ]}
            />
            <Text style={[styles.fieldLabel, { color: uiColors.secondaryText }]}>
              Content (required)
            </Text>
            <TextInput
              placeholderTextColor={uiColors.placeholderText}
              value={content}
              onChangeText={setContent}
              multiline
              scrollEnabled
              style={[
                styles.input,
                styles.contentInput,
                { borderColor: uiColors.separator, color: uiColors.primaryText },
              ]}
            />
          </ScrollView>
        )}
        {!responseData && isAllowed && (
          <Pressable
            style={[
              styles.actionButton,
              { backgroundColor: Colors.primaryGreen },
              submitting && styles.actionButtonDisabled,
              styles.submitButton,
            ]}
            onPress={submitChunk}
            disabled={submitting}
          >
            <Text style={[styles.actionButtonText, { color: uiColors.buttonText }]}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Text>
          </Pressable>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
  },
  formContentContainer: {
    paddingTop: hp(8),
    paddingBottom: hp(90),
  },
  info: {
    textAlign: 'center',
    marginBottom: hp(8),
  },
  fieldLabel: {
    fontSize: 12,
    marginBottom: hp(3),
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: hp(8),
  },
  contentInput: {
    minHeight: windowHeight * 0.35,
    maxHeight: windowHeight * 0.35,
    textAlignVertical: 'top',
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: hp(4),
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  submitButton: {
    position: 'absolute',
    bottom: hp(10), // Fixed at the bottom
    left: wp(16),
    right: wp(16),
  },
  responseText: {
    fontSize: 12,
    marginTop: hp(4),
  },
});

export default RagChunkAdminScreen;
