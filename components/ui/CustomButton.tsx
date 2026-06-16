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
  type?: string;
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
  type,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={className}
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
        <Text
          className={textClassName}
          style={[globalStyles.buttonText, textStyle]}
        >
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
