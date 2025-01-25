import { Button, StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native'
import MyText from './MyText';

interface ButtonProps {
  title: string;
  onPress: () => void;
  width?: string;
  marginVertical?: string;
  marginTop?: string;
  disabled?: boolean;
}

const MyButton = (props: ButtonProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      activeOpacity={0.75}
      onPress={props.disabled ? () => {} : props.onPress}
      disabled={props.disabled}
      style={[ styles.con,{ 
        width: props.width,
         marginVertical: props.marginVertical, 
         marginTop: props.marginTop, 
         backgroundColor:colors.primary,
         opacity: props.disabled ? 0.25 : 1
          }]}>
      <MyText numberOfLines={1} color='white' bold fontSize='small' >{props.title}</MyText>
    </TouchableOpacity>
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
