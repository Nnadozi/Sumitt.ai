import React, { useState } from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  TextInput,
  Dimensions,
  TextStyle,
  Platform,
  View,
  TouchableOpacity,
} from 'react-native'; 
import { useTheme } from '@react-navigation/native';
import ResponsiveIcon from './ResponsiveIcon';

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
  dontShowClear?:boolean
}

const MyInput = (props: MyInputProps) => {
  const { colors } = useTheme();
  const screenHeight = Dimensions.get('window').height;
  const dynamicHeight = props.height ? (parseFloat(props.height) / 100) * screenHeight : 50;

  const [text, setText] = useState(props.value || '');
  
  const handleClear = () => {
    setText('');
    if (props.onChangeText) props.onChangeText('');
  };

  return (
    <View style={styles.con}>
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
        value={text}  
        onChangeText={(newText) => {
          setText(newText);
          if (props.onChangeText) props.onChangeText(newText);
        }}
        placeholder={props.placeholder}
        placeholderTextColor={colors.text}
        multiline={props.multiline}
        keyboardType={props.keyboardType}
        textAlignVertical={props.textAlignVertical || "top"}
        maxLength={props.maxLength}
        {...(Platform.OS === 'ios' ? { submitBehavior: 'blurAndSubmit' } : {})}
      />
      {text.length > 0 && !props.dontShowClear && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <ResponsiveIcon primary name="highlight-remove" size={20} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MyInput;

const styles = StyleSheet.create({
  con: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    position: "relative"
  },
  textInput: {
    borderWidth: 1,
    width: '100%',
    padding: '3%',
    paddingRight: "9%",
    borderRadius: 5,
  },
  clearButton: {
    position: 'absolute',
    right: "3%",
    top: '50%',
    transform: [{ translateY: -10 }]
  }
});
