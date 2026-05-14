import React from 'react';
import { useColorMode } from '@gluestack-ui/themed-native-base';
import { View } from 'react-native';
import { ActivityIndicator, StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import { HelpDraft } from 'src/models/interfaces/HelpAi';

type DraftStatus =
  | 'pending_review'
  | 'confirming_public_submission'
  | 'submitting'
  | 'submitted'
  | 'failed_retryable';

type HelpAiDraftCardProps = {
  draft: HelpDraft;
  draftStatus: DraftStatus;
  onReview: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onRetry: () => void;
};

const HelpAiDraftCard = ({
  draft,
  draftStatus,
  onReview,
  onConfirm,
  onCancel,
  onRetry,
}: HelpAiDraftCardProps) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const uiColors = React.useMemo(
    () => ({
      surface: isDarkMode ? '#1f1f1f' : '#ffffff',
      separator: isDarkMode ? '#3a3a3a' : '#d8d8d8',
      primaryText: isDarkMode ? '#e7e7e7' : '#272421',
      secondaryText: isDarkMode ? '#a5a5a5' : '#878787',
      pantoneGreen: '#2f4f4f',
    }),
    [isDarkMode]
  );

  const fields: Array<{ label: string; value?: string | string[] }> = [
    { label: 'Title', value: draft.title },
    ...(draft.steps ? [{ label: 'Steps', value: draft.steps }] : []),
    ...(draft.expected ? [{ label: 'Expected', value: draft.expected }] : []),
    ...(draft.actual ? [{ label: 'Actual', value: draft.actual }] : []),
    ...(draft.problem ? [{ label: 'Problem', value: draft.problem }] : []),
    ...(draft.proposed ? [{ label: 'Proposed', value: draft.proposed }] : []),
  ];

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: uiColors.separator,
        backgroundColor: uiColors.surface,
        borderRadius: 10,
        padding: wp(14),
        marginTop: hp(10),
      }}
    >
      <Text medium color={uiColors.primaryText}>
        {draft.kind === 'bug' ? 'Bug Draft' : 'Feature Draft'}
      </Text>

      {fields.map((field) => (
        <View key={field.label} style={{ marginTop: hp(7) }}>
          <Text fontSize={12} color={uiColors.secondaryText} medium>
            {field.label}
          </Text>
          {Array.isArray(field.value) ? (
            field.value.map((line, idx) => (
              <Text key={`${field.label}-${idx}`} fontSize={12} color={uiColors.primaryText}>
                {`${idx + 1}. ${line}`}
              </Text>
            ))
          ) : (
            <Text fontSize={12} color={uiColors.primaryText}>
              {field.value}
            </Text>
          )}
        </View>
      ))}

      {draftStatus === 'pending_review' && (
        <View style={{ marginTop: hp(12) }}>
          <Buttons primaryText={'Review & Submit'} primaryCallback={onReview} fullWidth />
        </View>
      )}

      {draftStatus === 'confirming_public_submission' && (
        <View style={[{ marginTop: hp(12) }, styles.gap10]}>
          <Text fontSize={12} color={uiColors.secondaryText}>
            This will create a public GitHub issue. Confirm only if you are comfortable sharing this
            information publicly.
          </Text>
          <Buttons
            primaryText={'Confirm Public Submission'}
            primaryCallback={onConfirm}
            fullWidth
          />
          <Buttons primaryText={'Cancel'} primaryCallback={onCancel} fullWidth />
        </View>
      )}

      {draftStatus === 'submitting' && (
        <View style={[{ marginTop: hp(12) }, styles.row]}>
          <ActivityIndicator size="small" />
          <Text fontSize={12} color={uiColors.secondaryText}>
            Submitting issue...
          </Text>
        </View>
      )}

      {draftStatus === 'failed_retryable' && (
        <View style={[{ marginTop: hp(12) }, styles.gap10]}>
          <Buttons primaryText={'Retry Submission'} primaryCallback={onRetry} fullWidth />
          <Buttons primaryText={'Cancel'} primaryCallback={onCancel} fullWidth />
        </View>
      )}

      {draftStatus === 'submitted' && (
        <View style={{ marginTop: hp(12) }}>
          <Text fontSize={12} color={uiColors.pantoneGreen}>
            Submitted successfully.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  gap10: {
    gap: hp(10),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
  },
});

export default HelpAiDraftCard;
