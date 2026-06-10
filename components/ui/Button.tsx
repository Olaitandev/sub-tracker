import React from "react";
import {
    ActivityIndicator,
    GestureResponderEvent,
    StyleProp,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from "react-native";
import { globalStyles } from "../../constants/theme";

interface PrimaryButtonProps {
  text?: string;
  onPress: (event: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  textStyle?: StyleProp<TextStyle>;
  type?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  text,
  onPress,
  loading = false,
  disabled = false,
  style,
  children,
  textStyle,
  type,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        type === "secondary"
          ? globalStyles.secondaryButton
          : globalStyles.primaryButton,
        (disabled || loading) && globalStyles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : children ? (
        children
      ) : (
        <Text style={[globalStyles.buttonText, textStyle]}>{text}</Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
