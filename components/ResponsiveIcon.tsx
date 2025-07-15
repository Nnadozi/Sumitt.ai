import { StyleSheet, Text, View, Dimensions, StyleProp, TextStyle } from 'react-native';
import React from 'react';
import { Icon } from '@rneui/base';
import { useTheme } from '@react-navigation/native';

interface IconProps {
  color?: string;
  type?: string;
  primary?: boolean;
  name: string;
  size: number; 
  onPress?: () => void; 
  style?:TextStyle;
}

const ResponsiveIcon = ({ color = useTheme().colors.text, size, name, type, primary, onPress,style }: IconProps) => {
  const { colors } = useTheme();
  /*
  const { width } = Dimensions.get('window');
  const scaleSize = (size: number) => {
    return (width / 395) * size;
  };
  */
  return (
    <Icon
      color={primary ? colors.primary : color}
      name={name}
      type={type}
      size={size} 
      onPress={onPress}
      style={style}
    />
  );
};

export default ResponsiveIcon;

const styles = StyleSheet.create({});
