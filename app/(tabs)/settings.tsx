import React from "react";
import { Linking, StyleSheet, View } from "react-native";
import Page from "@/components/Page";
import MyText from "@/components/MyText";
import { Picker } from "@react-native-picker/picker";
import { Divider, Icon } from "@rneui/base";
import Version from "@/constants/Version";
import { useNavigation } from "expo-router";
import { useSettings } from "@/context/SettingsContext";

const Settings = () => {
  const { theme, setTheme, resolvedTheme } = useSettings();
  const navigation = useNavigation();

  return (
    <Page style={styles.page}>
      <MyText bold fontSize="large">Theme</MyText>
      <MyText fontSize="small" opacity={0.5}>Customize your appearance</MyText>
      <Picker
        style={{ ...styles.picker, color: resolvedTheme.colors.text }}
        dropdownIconColor={resolvedTheme.colors.text}
        selectedValue={theme}
        onValueChange={(value) => setTheme(value)}
      >
        <Picker.Item label="Light" value="light" />
        <Picker.Item label="Dark" value="dark" />
        <Picker.Item label="Device Settings" value="system" />
      </Picker>
      <Divider width={3} />
      <View style={styles.row}>
        <MyText bold fontSize="large">Privacy Policy</MyText>
        <Icon
          name="external-link"
          type="feather"
          size={20}
          color={resolvedTheme.colors.text}
          onPress={() => Linking.openURL("https://www.termsfeed.com/live/cd0fe929-9586-4ec3-a520-92eb05b678be")}
        />
      </View>
      <MyText fontSize="small" opacity={0.5}> Review Sumitt's privacy policy</MyText>
      <Divider width={10} />
      <MyText bold fontSize="large">Version</MyText>
      <MyText opacity={0.5} fontSize="small">{Version}</MyText>
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
  picker: {
    width: "100%",
    marginLeft: "-1%",
  },
  row: {
    flexDirection: "row",
    gap: "2%",
    alignItems: "center",
  },
});
