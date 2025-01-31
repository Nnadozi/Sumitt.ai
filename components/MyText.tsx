import { Text, TextStyle } from 'react-native';
import React from 'react';
import { useTheme } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';

interface TextProps {
  color?: string;
  fontSize?: 'small' | 'medium' | 'large' | 'XL';  
  bold?: boolean;  
  opacity?: number;
  textAlign?: string;
  style?: TextStyle; 
  numberOfLines?: number;
  markdown?: boolean;
  children: React.ReactNode;
}

const fontSizes = {
  small: 12,
  medium: 15,
  large: 20,
  XL: 24,
};

const MyText = ({
  color = useTheme().colors.text,
  fontSize = 'medium',
  bold = false,
  children,
  style,
  opacity,
  textAlign,
  numberOfLines,
  markdown,
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
      numberOfLines={numberOfLines}
      style={[{ color, fontSize: fontSizes[fontSize], fontWeight, opacity, textAlign }, style]}
    >
      {children}
    </Text>
  );
};

export default MyText;
