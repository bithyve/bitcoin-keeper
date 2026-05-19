import { useColorMode } from '@gluestack-ui/themed-native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, useColorScheme, View } from 'react-native';
import Buttons from 'src/components/Buttons';
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
  // Workaround: react-redux 7.x does not reliably trigger child re-renders
  // with React 19 when parent passes new props via useAppSelector.
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => forceUpdate((n) => n + 1), 100);
    return () => clearTimeout(t);
  }, [draftStatus]);
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
      <Text style={{ fontWeight: '600', color: uiColors.primaryText }}>
        {draft.kind === 'bug' ? 'Bug Draft' : 'Feature Draft'}
      </Text>

      {fields.map((field) => {
        const isArray = Array.isArray(field.value);
        return (
          <View key={field.label} style={{ marginTop: hp(7) }}>
            <Text style={{ fontSize: 12, color: uiColors.secondaryText, fontWeight: '600' }}>
              {field.label}
            </Text>
            {isArray ? (
              <View>
                {(field.value as string[]).map((line, idx) => (
                  <Text
                    key={`${field.label}-${idx}`}
                    style={{ fontSize: 12, color: uiColors.primaryText }}
                  >
                    {`${idx + 1}. ${line}`}
                  </Text>
                ))}
              </View>
            ) : (
              <Text
                style={{
                  fontSize: 12,
                  color: uiColors.primaryText,
                }}
              >
                {(field.value as string) ?? ''}
              </Text>
            )}
          </View>
        );
      })}

      {draftStatus === 'pending_review' && (
        <View style={{ marginTop: hp(12) }}>
          <Buttons primaryText={'Review & Submit'} primaryCallback={onReview} fullWidth />
        </View>
      )}

      {draftStatus === 'confirming_public_submission' && (
        <View style={[{ marginTop: hp(12) }, styles.gap10]}>
          <Text style={{ fontSize: 12, color: uiColors.secondaryText }}>
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
          <Text style={{ fontSize: 12, color: uiColors.secondaryText }}>Submitting issue...</Text>
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
          <Text style={{ fontSize: 12, color: uiColors.pantoneGreen }}>
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
