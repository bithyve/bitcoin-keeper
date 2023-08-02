import { useColorMode } from "native-base";
import * as React from "react"
import InheritanceToolsIllustration from 'src/assets/images/InheritanceToolsIllustration.svg'
import InheritanceToolsIllustrationDark from 'src/assets/images/InheritanceToolsIllustrationDark.svg'

function InheritanceToolsIllustartion() {
    const { colorMode } = useColorMode();
    return colorMode === 'light' ? <InheritanceToolsIllustration /> : <InheritanceToolsIllustrationDark />
}
export default InheritanceToolsIllustartion
