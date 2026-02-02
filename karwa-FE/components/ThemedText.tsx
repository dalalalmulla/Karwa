import { StyleSheet, Text, TextProps } from "react-native";

type ThemedTextType = "default" | "title" | "link";

type ThemedTextProps = TextProps & {
  type?: ThemedTextType;
};

export function ThemedText({ type = "default", style, ...rest }: ThemedTextProps) {
  return (
    <Text
      {...rest}
      style={[
        styles.default,
        type === "title" && styles.title,
        type === "link" && styles.link,
        style, // نخلي أي style ينرسل من برا له أولوية
      ]}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  link: {
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
