import { StyleSheet, Text, View, Pressable } from 'react-native';
import React from 'react';
import { useTheme } from '@react-navigation/native';
import MyText from './MyText';
import { Icon } from '@rneui/base';
import ResponsiveIcon from './ResponsiveIcon';

interface InputTypeProps {
    name?: string;
    subtitle?: string;
    selected: boolean;
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
      default:
        return 'help-outline';
    }
  };

  return (
    <Pressable  
      style={[styles.con, 
        { backgroundColor: props.selected ? colors.primary : colors.card, 
          borderColor: props.selected ? colors.primary : colors.border }]} 
      onPress={props.onPress} 
    >
        <ResponsiveIcon color={props.selected ? colors.card : colors.primary} size={30} name={iconName()} />
        <View style={styles.textCon}>
            <MyText style={{ color: props.selected ? colors.card : colors.text }} bold>{props.name}</MyText>
            <MyText style={{ color: props.selected ? colors.card : colors.text }} opacity={0.75} fontSize="small">{props.subtitle}</MyText>
        </View>
    </Pressable>
  );
};

export default InputType;

const styles = StyleSheet.create({
  con: {
    borderWidth: 1,
    width: "100%",
    height: "10%",
    marginBottom: '3%',
    padding: "3%",
    flexDirection: "row",
    alignItems: "center"
  },
  textCon: {
    marginLeft: '5%'
  }
});
