import { useColorMode } from 'native-base';
import * as React from 'react';
import { useSelector } from 'react-redux';
import InheritanceToolsIllustration from 'src/assets/images/InheritanceToolsIllustration.svg';
import InheritanceToolsIllustrationDark from 'src/assets/images/InheritanceToolsIllustrationDark.svg';
import InhertanceToolsPrivate from 'src/assets/privateImages/inheritance-tool-illustration.svg';

function InheritanceToolsIllustartion() {
  const { colorMode } = useColorMode();
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateTheme = themeMode === 'PRIVATE';

  return privateTheme ? (
    <InhertanceToolsPrivate />
  ) : colorMode === 'light' ? (
    <InheritanceToolsIllustration />
  ) : (
    <InheritanceToolsIllustrationDark />
  );
}
export default InheritanceToolsIllustartion;
