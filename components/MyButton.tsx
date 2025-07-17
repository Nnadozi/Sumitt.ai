import { ViewStyle } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native'
import MyText from './MyText';
import { Button } from '@rneui/base';

interface ButtonProps {
  title: string;
  onPress: () => void;  
  width?: number | string;
  marginVertical?: number | string;
  marginTop?: number | string;
  disabled?: boolean;
  iconName?: string;
  iconType?:string; 
  style?:ViewStyle
}

  const MyButton = (props: ButtonProps) => {
  const { colors } = useTheme();

  return (
    <Button 
      activeOpacity={0.5}
      onPress={props.disabled ? () => {} : props.onPress}
      disabled = {props.disabled}
      disabledStyle = {{backgroundColor:colors.primary,opacity:0.35}}
      containerStyle = {{
        width:props.width ?? "100%", marginVertical:props.marginVertical,
        marginTop: props.marginTop,
        borderRadius:20,
        ...props.style
      }}
      icon = {props.iconName ? {name:props.iconName, type:props.iconType, color:colors.background,size:15} : undefined}
      buttonStyle = {{backgroundColor:colors.primary, borderRadius:0}}
    >
      <MyText style={{paddingVertical:2,fontSize:14.5}} numberOfLines={1} color={colors.background} bold >{props.title}</MyText>
    </Button>
  );
}

export default MyButton
