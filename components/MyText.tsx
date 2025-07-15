import { Text, TextStyle } from 'react-native';
import React from 'react';
import { useTheme } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';

interface TextProps {
  color?: string;
  gray?: boolean;
  fontSize?: 'small' | 'medium' | 'large' | 'XL';  
  bold?: boolean;  
  opacity?: number;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: TextStyle; 
  numberOfLines?: number;
  markdown?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
}

const fontSizes = {small: 13, medium: 17, large: 25, XL: 30}; 

const MyText = ({
  color = useTheme().colors.text,
  gray = false,
  fontSize = 'medium',
  bold = false,
  children,
  style,
  opacity,
  textAlign,
  numberOfLines,
  markdown,
  onPress
}: TextProps) => {
  const fontWeight = bold ? 'bold' : 'normal';  

  const markdownStyles = {
    body: {
      color:useTheme().colors.text, 
      fontSize: fontSizes[fontSize],
    },
  };

  return markdown ? (
    <Markdown style={markdownStyles}>
      {children}
    </Markdown>
  ) : (
    <Text
    onPress={onPress}
      numberOfLines={numberOfLines}
      style={[{ color: gray ? "gray" : color, fontSize: fontSizes[fontSize], fontWeight, opacity, textAlign }, style]}
    >
      {children}
    </Text>
  );
};

export default MyText;
