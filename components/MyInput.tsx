import React from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  TextInput,
  Dimensions,
  TextStyle,
  Keyboard,
  Platform,
} from 'react-native'; 
import { useTheme } from '@react-navigation/native';

interface MyInputProps {
  height?: string; 
  keyboardType?: KeyboardTypeOptions;
  value?: string;
  multiline?: boolean;
  maxLength?: number;
  textAlignVertical?: "auto" | "center" | "top" | "bottom" | undefined;
  onChangeText?: (text: string) => void;
  style?: TextStyle;
  placeholder: string;
}

const MyInput = (props: MyInputProps) => {
  const { colors } = useTheme();

  const screenHeight = Dimensions.get('window').height;
  const dynamicHeight = props.height ? (parseFloat(props.height) / 100) * screenHeight : 50;

  return (
    <TextInput
      style={[
        styles.textInput,
        {
          borderColor: colors.border,
          backgroundColor: colors.card,
          color: colors.text,
          height: dynamicHeight, 
        },
        props.style,
      ]}
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
      placeholderTextColor={colors.text}
      multiline={props.multiline}
      keyboardType={props.keyboardType}
      textAlignVertical={props.textAlignVertical || "top"}
      maxLength={props.maxLength}
    />
  );
};

export default MyInput;

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    width: '100%',
    padding: '3%',
    borderRadius: 5,
  },
});
