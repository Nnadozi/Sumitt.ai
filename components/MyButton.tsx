import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native'
import MyText from './MyText';
import { Button } from '@rneui/base';

interface ButtonProps {
  title: string;
  onPress: () => void;
  width?: string;
  marginVertical?: string;
  marginTop?: string;
  disabled?: boolean;
  iconName?: string;
  iconType?:string; 
}

const MyButton = (props: ButtonProps) => {
  const { colors } = useTheme();

  return (
    <Button 
      activeOpacity={0.5}
      onPress={props.disabled ? () => {} : props.onPress}
      disabled = {props.disabled}
      containerStyle = {{
        width:props.width, marginVertical:props.marginVertical,
        marginTop: props.marginTop
      }}
      icon = {props.iconName ? {name:props.iconName, type:props.iconType, color:colors.background,size:15} : null}
      buttonStyle = {{backgroundColor:colors.primary, borderRadius:0}}
    >
      <MyText style={{paddingVertical:"1%",fontSize:13.5}} numberOfLines={1} color={colors.background} bold >{props.title}</MyText>
    </Button>
  );
}

export default MyButton

const styles = StyleSheet.create({
  con:{
    justifyContent:"center",
    alignItems:"center",
    paddingVertical:"3%",
    borderRadius:5
  }
});

