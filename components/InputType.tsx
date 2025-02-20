import { StyleSheet, Text, View, Pressable, TouchableOpacity } from 'react-native';
import React from 'react';
import { useTheme } from '@react-navigation/native';
import MyText from './MyText';
import { Icon } from '@rneui/base';
import ResponsiveIcon from './ResponsiveIcon';

interface InputTypeProps {
    name?: string;
    subtitle?: string;
    onPress: () => void;
}

const InputType = (props: InputTypeProps) => {
  const { colors } = useTheme();

  const iconName = (): string => {
    switch (props.name) {
      case "Website URL":
        return "link";
      case "Manual Input":
        return "keyboard";
      case "Image":
          return "image";
      default:
        return 'help-outline';
    }
  };

  return (
    <TouchableOpacity style={[styles.con,{ backgroundColor: colors.card, borderColor: colors.border }]} 
    onPress={props.onPress} activeOpacity={0.5}>
        <ResponsiveIcon color={colors.primary} size={30} name={iconName()} />
        <View style={styles.textCon}>
            <MyText style={{ color: colors.text }} bold>{props.name}</MyText>
            <MyText style={{ color: colors.text }} opacity={0.75} fontSize="small">{props.subtitle}</MyText>
        </View>
    </TouchableOpacity>
  );
};

export default InputType;

const styles = StyleSheet.create({
  con: {
    borderWidth: 1,
    width: "100%",
    marginBottom: '3%',
    padding: "4%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius:10
  },
  textCon: {
    marginLeft: '5%'
  }
});
