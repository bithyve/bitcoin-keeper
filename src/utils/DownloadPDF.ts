import Share from "react-native-share";
import ReactNativeBlobUtil from "react-native-blob-util"
import { Platform } from "react-native";

export default async function DownloadFile(pdfFileName) {
    const source = "https://www.africau.edu/images/default/sample.pdf";
    const { dirs } = ReactNativeBlobUtil.fs;
    const fileName = pdfFileName
    ReactNativeBlobUtil.config({
        fileCache: true,
        appendExt: 'pdf',
        path: `${dirs.DocumentDir}/${fileName}.pdf`,
        addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            title: fileName,
            description: 'File downloaded by download manager.',
            mime: 'application/pdf',
        },
    })
        .fetch('GET', source)
        .then((res) => {
            // in iOS, we want to save our files by opening up the saveToFiles bottom sheet action.
            // whereas in android, the download manager is handling the download for us.
            if (Platform.OS === 'ios') {
                const filePath = res.path();
                const options = {
                    type: 'application/pdf',
                    url: filePath,
                    saveToFiles: true,
                };
                Share.open(options)
                    .then((resp) => console.log(resp))
                    .catch((err) => console.log(err));
            }
        })
        .catch((err) => console.log('BLOB ERROR -> ', err));
};