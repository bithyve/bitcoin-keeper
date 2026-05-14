import React from 'react';
import { Box, useColorMode } from '@gluestack-ui/themed-native-base';
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

  const fields: Array<{ label: string; value?: string | string[] }> = [
    { label: 'Title', value: draft.title },
    ...(draft.steps ? [{ label: 'Steps', value: draft.steps }] : []),
    ...(draft.expected ? [{ label: 'Expected', value: draft.expected }] : []),
    ...(draft.actual ? [{ label: 'Actual', value: draft.actual }] : []),
    ...(draft.problem ? [{ label: 'Problem', value: draft.problem }] : []),
    ...(draft.proposed ? [{ label: 'Proposed', value: draft.proposed }] : []),
  ];

  return (
    <Box
      borderWidth={1}
      borderColor={`${colorMode}.separator`}
      backgroundColor={`${colorMode}.textInputBackground`}
      borderRadius={10}
      p={wp(14)}
      mt={hp(10)}
    >
      <Text medium color={`${colorMode}.primaryText`}>
        {draft.kind === 'bug' ? 'Bug Draft' : 'Feature Draft'}
      </Text>

      {fields.map((field) => (
        <Box key={field.label} mt={hp(7)}>
          <Text fontSize={12} color={`${colorMode}.secondaryText`} medium>
            {field.label}
          </Text>
          {Array.isArray(field.value) ? (
            field.value.map((line, idx) => (
              <Text key={`${field.label}-${idx}`} fontSize={12} color={`${colorMode}.primaryText`}>
                {`${idx + 1}. ${line}`}
              </Text>
            ))
          ) : (
            <Text fontSize={12} color={`${colorMode}.primaryText`}>
              {field.value}
            </Text>
          )}
        </Box>
      ))}

      {draftStatus === 'pending_review' && (
        <Box mt={hp(12)}>
          <Buttons primaryText={'Review & Submit'} primaryCallback={onReview} fullWidth />
        </Box>
      )}

      {draftStatus === 'confirming_public_submission' && (
        <Box mt={hp(12)} style={styles.gap10}>
          <Text fontSize={12} color={`${colorMode}.secondaryText`}>
            This will create a public GitHub issue. Confirm only if you are comfortable sharing this information publicly.
          </Text>
          <Buttons primaryText={'Confirm Public Submission'} primaryCallback={onConfirm} fullWidth />
          <Buttons primaryText={'Cancel'} primaryCallback={onCancel} fullWidth />
        </Box>
      )}

      {draftStatus === 'submitting' && (
        <Box mt={hp(12)} style={styles.row}>
          <ActivityIndicator size="small" />
          <Text fontSize={12} color={`${colorMode}.secondaryText`}>
            Submitting issue...
          </Text>
        </Box>
      )}

      {draftStatus === 'failed_retryable' && (
        <Box mt={hp(12)} style={styles.gap10}>
          <Buttons primaryText={'Retry Submission'} primaryCallback={onRetry} fullWidth />
          <Buttons primaryText={'Cancel'} primaryCallback={onCancel} fullWidth />
        </Box>
      )}

      {draftStatus === 'submitted' && (
        <Box mt={hp(12)}>
          <Text fontSize={12} color={`${colorMode}.pantoneGreen`}>
            Submitted successfully.
          </Text>
        </Box>
      )}
    </Box>
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
