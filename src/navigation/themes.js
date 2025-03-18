import Colors from 'src/theme/Colors';
import { extendTheme } from 'native-base';
import Fonts from 'src/constants/Fonts';

export const customTheme = extendTheme({
  fontConfig: {
    Inter: {
      100: {
        normal: Fonts.InterLight,
        italic: Fonts.InterLightItalic,
      },
      200: {
        normal: Fonts.InterRegular,
        italic: Fonts.InterItalic,
      },
      300: {
        normal: Fonts.InterMedium,
        italic: Fonts.InterMediumItalic,
      },
      400: {
        normal: Fonts.InterSemiBold,
        italic: Fonts.InterSemiBoldItalic,
      },
      500: {
        normal: Fonts.InterBold,
        italic: Fonts.InterBoldItalic,
      },
      600: {
        normal: Fonts.InterRegular,
        italic: Fonts.InterItalic,
      },
      700: {
        normal: Fonts.InterRegular,
        italic: Fonts.InterItalic,
      },
      800: {
        normal: Fonts.InterRegular,
        italic: Fonts.InterItalic,
      },
      900: {
        normal: Fonts.InterRegular,
        italic: Fonts.InterItalic,
      },
    },
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'Inter',
  },
  colors: {
    light: {
      buttonText: Colors.headerWhite,
      modalGreenSecButtonText: Colors.headerWhite,
      modalWhiteButton: Colors.headerWhite,
      white: Colors.headerWhite,
      headerWhite: Colors.headerWhite,

      primaryGreen: Colors.TagLight2,
      greenText2: Colors.TagLight2,

      primaryBackground: Colors.secondaryCreamWhite,
      receiveQrBackground: Colors.secondaryCreamWhite,
      QrCode: Colors.secondaryCreamWhite,
      fadedGray: Colors.secondaryCreamWhite,
      secondaryCreamWhite: Colors.secondaryCreamWhite,
      linkPreviewBackground: Colors.secondaryCreamWhite,
      seedCard: Colors.secondaryCreamWhite,
      greyBackground: Colors.secondaryCreamWhite,

      modalWhiteBackground: Colors.primaryCream,
      thirdBackground: Colors.primaryCream,
      whiteCircle: Colors.primaryCream,

      pantoneGreen: Colors.primaryGreen,
      SeaweedGreen: Colors.primaryGreen,
      dashedButtonBorder: Colors.primaryGreen,
      dashedButtonBorderColor: Colors.primaryGreen,
      primaryGreenBackground: Colors.primaryGreen,
      darkBorderGreen: Colors.primaryGreen,
      textGreen: Colors.primaryGreen,
      greenWhiteText: Colors.primaryGreen,

      pillText: Colors.TertiaryBlack,
      btcPillText: Colors.TertiaryBlack,

      pantoneGreenLight: Colors.pantoneGreenLight,

      modalWhiteContent: Colors.ashGreen,
      secondaryText: Colors.ashGreen,
      secondarySubtitle: Colors.ashGreen,
      coalGreen: Colors.ashGreen,

      modalGreenTitle: Colors.PrimaryBlack,
      backgroundbitSaga: Colors.PrimaryBlack,
      black: Colors.PrimaryBlack,

      modalGreenLearnMore: Colors.CastelGreenDark,

      dashedButtonBackground: Colors.TagDark2,
      dateText: Colors.TagDark2,

      boxSecondaryBackground: Colors.brightCream,
      textInputBackground: Colors.brightCream,
      seashellWhite: Colors.brightCream,
      seashellWhiteText: Colors.brightCream,
      ChampagneBliss: Colors.brightCream,
      appStatusTextColor: Colors.brightCream,
      whiteSecButtonText: Colors.brightCream,

      hexagonIconBackColor: Colors.DullGreenDark,

      choosePlanIconBack: Colors.PaleKhaki,

      coffeeBackground: Colors.Coffee,
      yellowButtonTextColor: Colors.Coffee,
      learnMoreBorder: Colors.Coffee,

      yellowButtonBackground: Colors.MacaroniAndCheese,
      accent: Colors.MacaroniAndCheese,
      lightAccent: Colors.MacaroniAndCheese,

      btcLabelBack: Colors.Periwinkle,

      primaryText: Colors.SecondaryBlack,
      inActiveMsg: Colors.SecondaryBlack,
      feeInfoColor: Colors.SecondaryBlack,

      textBlack: Colors.DarkGreen,
      textDarkGreen: Colors.DarkGreen,

      greenText: Colors.TagDark3,
      gradientEnd: Colors.TagDark3, // linearGradient

      sliderStep: Colors.TropicalRainForestDark,

      hardWareImageBackGround: Colors.SoftJadeTint,

      GreenishGrey: Colors.GreenishGrey,
      GreyText: Colors.GreenishGrey,
      balanceText: Colors.GreenishGrey,
      keyPadText: Colors.GreenishGrey,
      ctaFooterBackground: Colors.GreenishGrey,
      DarkGreyText: Colors.GreenishGrey,
      greenishGreyText: Colors.GreenishGrey,

      Border: Colors.TagLight1,
      forestGreen: Colors.TagLight1,

      textColor: Colors.dullGreen,
      overlayGreen: Colors.dullGreen,
      sliderUnfilled: Colors.dullGreen,
      dullGreen: Colors.dullGreen,

      textColor2: Colors.DeepSpaceSparkle,

      divider: Colors.darkGrey,

      alertRedLight: Colors.redAlert,
      alertRed: Colors.redAlert,

      SlateGreen: Colors.SlateGreen,

      textWallet: Colors.TagDark5,
      indicator: Colors.OutrageousOrange,
      sendMax: Colors.JackoBean,
      walletTypePillBack: Colors.Bisque,
      pillPlaceholderBack: Colors.LightKhaki,
      error: Colors.CongoPink,
      LightGreenish: Colors.TagDark9,
      fadedblue: Colors.FadeBlue,
      lightSeashell: Colors.lightSeashell,
      BrownNeedHelp: Colors.primaryBrown,
      RecoveryBorderColor: Colors.RussetBrownLight,
      primaryBrown: Colors.primaryBrown,
      LightBrown: Colors.LightBrown,
      SignleSigCardPillBackColor: Colors.PaleTurquoise,
      dropdownSeparator: Colors.Taupe,
      lightSkin: Colors.LightSkin,
      greyBorder: Colors.secondaryLightGrey,
      placeHolderTextColor: Colors.secondaryDarkGrey,
      dullGreyBorder: Colors.SilverMistTranslucent,
      greyBorderTransparent: Colors.SilverMistTransparent,
      greyBorderTranslucent: Colors.secondaryLightGrey,
      border: Colors.separator,
      limeText: Colors.LimeYellow,
      disabledDiamond: Colors.secondaryLightGrey,
      secondaryGrey: Colors.secondaryLightGrey,
      appStatusButtonBackground: Colors.WarmBeigeTranslucent,
      labelColor2: Colors.LabelLight2,
      boxBackground: Colors.BoxGolden,
      borderBrown: Colors.primaryBrown,
      separator: Colors.separator,
      FlameOrange: Colors.FlameOrange,
      newBadgeGreen: Colors.NewBadgeGreen,
      errorToastBackground: Colors.ErrorToast,

      receiptBorder: Colors.secondaryLightGrey,
      brownBackground: Colors.primaryBrown,

      solidGreyBorder: Colors.greyBorder,
      menuCardTitleColor: Colors.secondaryDarkGrey,
      newDashedButtonBackground: Colors.SoftTealOverlay,

      LightGraycolor: Colors.LightGraycolor,
      darkBrownCircle: Colors.primaryBrown,
      lightBrownCircle: Colors.RussetBrownLight,

      termsText: Colors.termsGrey,
      graphiteTranslucentBG: Colors.GraphiteTranslucent,
      SeaweedGreenTranslucentBG: Colors.SeaweedGreenTranslucent,
      modalSubtitleBlack: Colors.secondaryBlack,
    },
    dark: {
      modalWhiteContent: Colors.headerWhite,
      receiveQrBackground: Colors.headerWhite,
      yellowButtonTextColor: Colors.headerWhite,
      greenWhiteText: Colors.headerWhite,
      black: Colors.headerWhite,
      feeInfoColor: Colors.headerWhite,
      btcPillText: Colors.headerWhite,
      balanceText: Colors.headerWhite,
      textDarkGreen: Colors.headerWhite,
      headerWhite: Colors.headerWhite,

      primaryGreen: Colors.TagLight2,
      gradientEnd: Colors.TagLight2,

      QrCode: Colors.secondaryCreamWhite,
      secondaryCreamWhite: Colors.secondaryCreamWhite,

      dashedButtonBorderColor: Colors.primaryCream,

      SeaweedGreen: Colors.primaryGreen,

      pillText: Colors.TertiaryBlack,
      seashellWhite: Colors.TertiaryBlack,
      overlayGreen: Colors.TertiaryBlack,
      seedCard: Colors.TertiaryBlack,

      pantoneGreenLight: Colors.pantoneGreenLight,
      ChampagneBliss: Colors.pantoneGreenLight,

      coalGreen: Colors.ashGreen,

      primaryBackground: Colors.PrimaryBlack,
      modalGreenLearnMore: Colors.PrimaryBlack,
      yellowButtonBackground: Colors.PrimaryBlack,

      termsText: Colors.brightCream,
      appStatusTextColor: Colors.brightCream,

      modalWhiteButton: Colors.DullGreenDark,
      dashedButtonBackground: Colors.DullGreenDark,
      hexagonIconBackColor: Colors.DullGreenDark,
      pantoneGreen: Colors.DullGreenDark,

      primaryGreenBackground: Colors.SecondaryBlack,
      white: Colors.SecondaryBlack,
      boxSecondaryBackground: Colors.SecondaryBlack,
      thirdBackground: Colors.SecondaryBlack,
      ctaFooterBackground: Colors.SecondaryBlack,

      modalGreenSecButtonText: Colors.TropicalRainForestDark,
      greenText2: Colors.TropicalRainForestDark,
      sliderStep: Colors.TropicalRainForestDark,

      GreenishGrey: Colors.GreenishGrey,
      newBadgeGreen: Colors.GreenishGrey,

      forestGreen: Colors.TagLight1,

      textColor: Colors.dullGreen,

      choosePlanIconBack: Colors.darkGrey,
      divider: Colors.darkGrey,
      placeHolderTextColor: Colors.darkGrey,
      greenishGreyText: Colors.darkGrey,
      menuCardTitleColor: Colors.darkGrey,
      secondarySubtitle: Colors.darkGrey,
      greyBackground: Colors.darkGrey,

      alertRedLight: Colors.redAlert,

      SlateGreen: Colors.SlateGreen,

      buttonText: Colors.bodyText,
      disabledDiamond: Colors.secondaryLightGrey,
      modalSubtitleBlack: Colors.bodyText,
      modalWhiteBackground: Colors.ModalBlack,
      modalGreenTitle: Colors.bodyText,

      coffeeBackground: Colors.primaryBrown,
      btcLabelBack: Colors.PeriwinkleDark,
      FlameOrange: Colors.FlameOrange,
      primaryText: Colors.bodyText,
      secondaryText: Colors.bodyText,
      learnMoreBorder: Colors.bodyText,
      textBlack: Colors.bodyText,

      accent: Colors.ToastBg,
      lightAccent: Colors.ToastBg,
      textInputBackground: Colors.SecondaryBackgroundDark,
      GreyText: Colors.bodyText,
      dateText: Colors.bodyText,
      Border: Colors.bodyText,

      textColor2: Colors.secondaryLightGrey,
      textWallet: Colors.TagDark5,
      indicator: Colors.OutrageousOrange,
      sendMax: Colors.JackoBean,
      inActiveMsg: Colors.secondaryLightGrey,
      walletTypePillBack: Colors.LabelDark1,
      pillPlaceholderBack: Colors.LabelDark1,
      error: Colors.CongoPink,
      backgroundbitSaga: Colors.secondaryLightGrey,
      darkBorderGreen: Colors.TagDark9,
      fadedGray: Colors.bodyText,
      fadedblue: Colors.FadeBlue,
      seashellWhiteText: Colors.bodyText,
      lightSeashell: Colors.lightSeashell,
      BrownNeedHelp: Colors.primaryBrown,
      RecoveryBorderColor: Colors.RussetBrownLight,
      primaryBrown: Colors.primaryBrown,
      LightGraycolor: Colors.LightGraycolor,
      LightBrown: Colors.LightBrown,
      SignleSigCardPillBackColor: Colors.Turquoise,
      dropdownSeparator: Colors.Taupe,
      lightSkin: Colors.secondaryDarkGrey,
      hardWareImageBackGround: Colors.hardWareDarkImageBackGround,
      greyBorder: Colors.secondaryLightGrey,
      greyBorderTransparent: Colors.SilverMistTransparent,
      greyBorderTranslucent: Colors.secondaryLightGrey,
      border: Colors.SilverMistTransparent,
      placeHolderTextColor: Colors.secondaryDarkGrey,
      dullGreyBorder: Colors.separator,
      linkPreviewBackground: Colors.ModalBlack,
      limeText: Colors.LimeYellow,
      greenText: Colors.bodyText,
      secondaryGrey: Colors.separator,
      appStatusButtonBackground: Colors.WarmBeigeTranslucent,

      labelColor2: Colors.LabelDark2,
      boxBackground: Colors.SecondaryBackgroundDark,
      borderBrown: Colors.SilverMistTransparent,
      separator: Colors.separator,
      alertRed: Colors.AlertRedDark,
      textGreen: Colors.bodyText,
      errorToastBackground: Colors.ErrorToastDark,
      receiptBorder: Colors.separator,
      modalUnitColor: Colors.SoftGray,
      brownBackground: Colors.DullBrown,
      keyPadText: Colors.SoftGray,
      solidGreyBorder: Colors.separator,
      dashedButtonBorder: Colors.separator,
      newDashedButtonBackground: Colors.FadedMossOverlay,
      whiteSecButtonText: Colors.SoftGray,
      DarkGreyText: Colors.RichBlackDark,
      whiteCircle: Colors.bodyText,
      darkBrownCircle: Colors.primaryBrown,
      lightBrownCircle: Colors.RussetBrownLight,
      sliderUnfilled: Colors.CharcoalGreen,
      dullGreen: Colors.DeepCharcoalGreen,
      graphiteTranslucentBG: Colors.GraphiteTranslucent,
      SeaweedGreenTranslucentBG: Colors.SeaweedGreenTranslucent,
    },
  },
  config: {
    initialColorMode: 'light',
  },
});

export default customTheme;
