import React, { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import Page from "@/components/Page";
import MyText from "@/components/MyText";
import { Divider, Icon, ButtonGroup } from "@rneui/base";
import Version from "@/constants/Version";
import { useNavigation } from "expo-router";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@react-navigation/native";

const Settings = () => {
  const { theme, setTheme, resolvedTheme } = useSettings();
  const [selectedIndex, setSelectedIndex] = useState(
    theme === "light" ? 0 : theme === "dark" ? 1 : 2
  );
  const navigation = useNavigation();
  const { colors } = useTheme();

  const handleThemeChange = (index: number) => {
    setSelectedIndex(index);
    const selectedTheme = index === 0 ? "light" : index === 1 ? "dark" : "system";
    setTheme(selectedTheme);
  };

  return (
    <Page style={styles.page}>
      <MyText bold fontSize="large">Theme</MyText>
      <MyText fontSize="small" opacity={0.5}>Customize your appearance</MyText>
      <ButtonGroup
        buttons={["Light", "Dark", "System"]}
        selectedIndex={selectedIndex}
        onPress={handleThemeChange}
        selectedButtonStyle={{ backgroundColor: colors.primary }}
        innerBorderStyle={{ color: colors.border }}
        containerStyle={{
          marginVertical: "5%",
          width: "100%",
          marginLeft: "0%",
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      />
      <View style={styles.row}>
        <MyText bold fontSize="large">Privacy Policy</MyText>
        <Icon
          name="external-link"
          type="feather"
          size={20}
          color={resolvedTheme.colors.text}
          onPress={() =>
            Linking.openURL(
              "https://www.termsfeed.com/live/cd0fe929-9586-4ec3-a520-92eb05b678be"
            )
          }
        />
      </View>
      <MyText fontSize="small" opacity={0.5}>
        Review Sumitt's privacy policy
      </MyText>
      <Divider width={15} />
      <MyText bold fontSize="large">Version</MyText>
      <MyText opacity={0.5} fontSize="small">
        {Version}
      </MyText>
    </Page>
  );
};

export default Settings;

const styles = StyleSheet.create({
  page: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: "5%",
  },
  row: {
    flexDirection: "row",
    gap: "2%",
    alignItems: "center",
  },
});
