import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { importLabels } from 'src/store/sagaActions/utxos';
import { generateAbbreviatedOutputDescriptors } from 'src/utils/service-utilities/utils';
import { importFile, exportFile } from 'src/services/fs';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';

interface ImportExportLabelsProps {
  vault: any;
  labels: any[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  translations: any;
}

const ImportExportLabels: React.FC<ImportExportLabelsProps> = ({
  vault,
  labels,
  onSuccess,
  onError,
  translations,
}) => {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const { vault: vaultText } = translations;

  const handleImportLabels = async () => {
    try {
      await importFile(
        async (fileContent) => {
          try {
            const labelsData = JSON.parse(fileContent);

            if (!Array.isArray(labelsData)) {
              throw new Error('Invalid labels format: expected an array');
            }

            const walletDescriptor = generateAbbreviatedOutputDescriptors(vault);

            const standardizeDescriptor = (descriptor) => {
              if (!descriptor) return '';

              let standardized = descriptor.replace(/'/g, 'h');

              standardized = standardized.replace(
                /\[([0-9a-f]+)(\/.*?)\]/gi,
                (match, fingerprint, path) => {
                  return `[${fingerprint.toUpperCase()}${path}]`;
                }
              );

              return standardized;
            };

            const normalizedWalletDescriptor = standardizeDescriptor(walletDescriptor);
            const walletLabels = labelsData
              .map((label) => {
                return {
                  ...label,
                  origin: label.origin ? label.origin : normalizedWalletDescriptor,
                };
              })
              .filter(
                (label) => standardizeDescriptor(label.origin) === normalizedWalletDescriptor
              );

            if (walletLabels.length === 0) {
              onError('No labels found for this wallet');
              return;
            }

            const standardizedLabels = walletLabels.map((label) => ({
              ...label,
              origin: standardizeDescriptor(label.origin),
            }));

            dispatch(importLabels({ labels: standardizedLabels }));

            onSuccess(`Imported ${walletLabels.length} labels successfully`);
          } catch (parseError) {
            console.log('Error parsing labels file:', parseError);
            onError('Failed to import the wallet labels');
          }
        },
        (error) => {
          console.log('Error importing labels:', error);
          onError('Failed to import the wallet labels');
        },
        'utf8'
      );
    } catch (error) {
      console.log('Unexpected error during import:', error);
    }
  };

  const handleExportLabels = async () => {
    try {
      const labelsToExport = Array.from(labels).map((tag) => {
        // Create a copy of the tag object
        const exportTag = {
          type: tag.type.toLowerCase(),
          ref: tag.ref,
          label: tag.label,
          origin: tag.origin,
        };

        return exportTag;
      });
      const jsonString = JSON.stringify(labelsToExport, null, 2);

      const fileName = `${vault.presentationData.name.replace(/\s+/g, '_')}_labels.json`;

      await exportFile(jsonString, fileName, (error) => {
        onError(error.message);
      });

      onSuccess('Wallet labels exported successfully');
    } catch (error) {
      console.log('Error exporting labels:', error);
      onError('Failed to export the wallet labels');
    }
  };

  return (
    <Box>
      <Text color={`${colorMode}.modalSubtitleBlack`} style={styles.modalDesc}>
        {vaultText.importExportLabelsModalDesc}
      </Text>
      <Box style={styles.modalButtonsContainer}>
        <TouchableOpacity onPress={handleImportLabels}>
          <Box backgroundColor={`${colorMode}.textInputBackground`} style={styles.modalButton}>
            <Text color={`${colorMode}.textGreen`} style={styles.modalButtonText}>
              {vaultText.importLabels}
            </Text>
          </Box>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleExportLabels}>
          <Box backgroundColor={`${colorMode}.textInputBackground`} style={styles.modalButton}>
            <Text color={`${colorMode}.textGreen`} style={styles.modalButtonText}>
              {vaultText.exportLabels}
            </Text>
          </Box>
        </TouchableOpacity>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  modalDesc: {
    fontSize: 14,
    padding: 1,
    marginBottom: 15,
    width: wp(295),
  },
  modalButtonsContainer: {
    marginTop: 20,
    flexDirection: 'column',
    width: '100%',
  },
  modalButton: {
    alignItems: 'center',
    gap: wp(20),
    paddingHorizontal: wp(20),
    paddingVertical: hp(16),
    borderRadius: 10,
    marginBottom: hp(10),
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ImportExportLabels;
