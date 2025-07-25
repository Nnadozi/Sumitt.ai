import React, { useEffect, useState } from 'react';
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
import * as Clipboard from 'expo-clipboard';
import MyText from './MyText';

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
  dontShowClear?: boolean;
  showLength?: boolean;
}

const MyInput = (props: MyInputProps) => {
  const { colors } = useTheme();
  const screenHeight = Dimensions.get('window').height;
  const dynamicHeight = props.height ? (parseFloat(props.height) / 100) * screenHeight : null;

  const [text, setText] = useState(props.value || '');

  useEffect(() => {
    setText(props.value || '');
  }, [props.value]);

  const handleClear = () => {
    setText('');
    if (props.onChangeText) props.onChangeText('');
  };

  const handlePaste = async () => {
    const clipboardText = await Clipboard.getStringAsync();
    setText(clipboardText);
    if (props.onChangeText) props.onChangeText(clipboardText);
  };

  return (
    <>
      {!props.dontShowClear && 
      <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={handlePaste}>
            <ResponsiveIcon primary name="content-paste" size={20} />
            <MyText color={useTheme().colors.primary} fontSize='small'>Paste</MyText>
          </TouchableOpacity>
          {text.length > 0 && (
          <TouchableOpacity style={styles.iconButton} onPress={handleClear}>
            <ResponsiveIcon primary name="highlight-remove" size={20} />
            <MyText color={useTheme().colors.primary} fontSize='small'>Clear</MyText>
          </TouchableOpacity>
            )}
      </View> 
      }
      <View style={styles.con}>
        <TextInput
          style={[styles.textInput, {
            borderColor: colors.border,
            backgroundColor: colors.card,
            color: colors.text,
            height: dynamicHeight, 
            borderRadius: 20
          }, props.style]}
          value={text} 
          onChangeText={(newText) => {
            setText(newText);
            if (props.onChangeText) props.onChangeText(newText);
          }}
          placeholder={props.placeholder}
          placeholderTextColor={"darkgray"}
          multiline={props.multiline}
          keyboardType={props.keyboardType}
          textAlignVertical={props.textAlignVertical || "top"}
          maxLength={props.maxLength}
          {...(Platform.OS === 'ios' ? { submitBehavior: 'blurAndSubmit' } : {})}
        />    
      </View>
      {props.showLength && (
        <MyText style={{marginTop:5,marginBottom:15,marginLeft:5,alignSelf:"flex-start"}} fontSize="small" gray>{text.length}/{props.maxLength}</MyText>
      )}
    </>
  );
};

export default MyInput;

const styles = StyleSheet.create({
  con: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  textInput: {
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    gap: 7.5,
  },
  iconButton: {
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: 'center',
    gap: 3,
  },
});
