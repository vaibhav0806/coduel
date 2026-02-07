import { Text as RNText, TextProps, TextStyle } from "react-native";
import { forwardRef } from "react";

interface CustomTextProps extends TextProps {
  weight?: "regular" | "medium" | "semibold" | "bold";
}

const fontFamilies: Record<string, string> = {
  regular: "Outfit_400Regular",
  medium: "Outfit_500Medium",
  semibold: "Outfit_600SemiBold",
  bold: "Outfit_700Bold",
};

export const Text = forwardRef<RNText, CustomTextProps>(
  ({ style, weight = "regular", ...props }, ref) => {
    const fontStyle: TextStyle = {
      fontFamily: fontFamilies[weight],
    };

    return (
      <RNText
        ref={ref}
        style={[fontStyle, style]}
        {...props}
      />
    );
  }
);

Text.displayName = "Text";

// Export styled text variants for convenience
export const TextMedium = forwardRef<RNText, TextProps>((props, ref) => (
  <Text ref={ref} weight="medium" {...props} />
));
TextMedium.displayName = "TextMedium";

export const TextSemibold = forwardRef<RNText, TextProps>((props, ref) => (
  <Text ref={ref} weight="semibold" {...props} />
));
TextSemibold.displayName = "TextSemibold";

export const TextBold = forwardRef<RNText, TextProps>((props, ref) => (
  <Text ref={ref} weight="bold" {...props} />
));
TextBold.displayName = "TextBold";
