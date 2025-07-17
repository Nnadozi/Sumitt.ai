import { StyleSheet, Text, View, Pressable, TouchableOpacity } from 'react-native';
import React from 'react';
import { useTheme } from '@react-navigation/native';
import MyText from './MyText';
import { Icon } from '@rneui/base';
import ResponsiveIcon from './ResponsiveIcon';

interface InputTypeProps {
    name: string;
    subtitle: string;
    inputType:string;
    onPress?: () => void;
}

const InputType = (props: InputTypeProps) => {
  const { colors } = useTheme();

  const iconName = (): string => {
    switch (props.name) {
      case "Text":
        return "keyboard";
      case "Website URL":
          return "link";
      case "Image":
          return "image";
      case "PDF":
          return "pdffile1";
      default:
        return 'help-outline';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.con, 
        { backgroundColor: colors.card, 
          borderColor: colors.border }]} 
      onPress={props.onPress} 
      activeOpacity={0.5}
    >
        <ResponsiveIcon  type={props.name === "PDF" ? "antdesign" : "material"} color={colors.primary} size={30} name={iconName()} />
        <View style={styles.textCon}>
            <MyText bold>{props.name}</MyText>
            <MyText fontSize="small" gray>{props.subtitle}</MyText>
        </View>
    </TouchableOpacity>
  );
};

export default InputType;

const styles = StyleSheet.create({
  con: {
    borderWidth: 1,
    width: "100%",
    marginBottom: 10,
    padding: 12.5,
    flexDirection: "row",
    alignItems: "center",
    borderRadius:20
  },
  textCon: {
    marginLeft:10
  }
});
