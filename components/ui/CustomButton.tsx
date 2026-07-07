import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { ms } from "react-native-size-matters";
import { globalStyles } from "../../constants/theme";

type ButtonType = "primary" | "secondary";
type IconPosition = "left" | "right";

// Centralized so adding a new `type` (e.g. "outline") forces you to
// also decide its icon color — no silent fallback to the wrong color.
const BUTTON_ICON_COLORS: Record<ButtonType, string> = {
  primary: "#fff",
  secondary: "#fff",
};

interface CustomButtonProps {
  text?: string;
  onPress: (event: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
  children?: React.ReactNode;
  textStyle?: StyleProp<TextStyle>;
  textClassName?: string;
  type?: ButtonType;
  icon?: React.ReactElement<{ color?: string }>;
  iconPosition?: IconPosition;
  iconColor?: string; // explicit override, takes priority over type-derived color
}

const CustomButton: React.FC<CustomButtonProps> = ({
  text,
  onPress,
  loading = false,
  disabled = false,
  style,
  className,
  children,
  textStyle,
  textClassName,
  type = "primary",
  icon,
  iconPosition = "left",
  iconColor,
}) => {
  const isDisabled = disabled || loading;
  const resolvedIconColor = iconColor ?? BUTTON_ICON_COLORS[type];

  // Only inject color if the icon didn't already set one explicitly —
  // lets a caller do <Plus color="red" /> for a destructive action
  // without the type-based color silently overwriting it.
  const renderedIcon = icon
    ? React.cloneElement(icon, { color: icon.props.color ?? resolvedIconColor })
    : null;

  const containerStyle = StyleSheet.flatten([
    type === "secondary"
      ? globalStyles.secondaryButton
      : globalStyles.primaryButton,
    isDisabled && globalStyles.disabled,
    style,
  ]);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={className}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={text}
      style={containerStyle}
    >
      {loading ? (
        <ActivityIndicator color={resolvedIconColor} />
      ) : children ? (
        children
      ) : (
        <View
          style={{
            flexDirection: iconPosition === "right" ? "row-reverse" : "row",
            alignItems: "center",
          }}
        >
          {renderedIcon && (
            <View
              style={
                iconPosition === "right"
                  ? { marginLeft: ms(6) }
                  : { marginRight: ms(6) }
              }
            >
              {renderedIcon}
            </View>
          )}
          <Text
            className={textClassName}
            style={[globalStyles.buttonText, textStyle]}
          >
            {text}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
