import { Pressable, PressableProps } from "react-native";

type HapticTabProps = PressableProps;

export function HapticTab(props: HapticTabProps) {
  return <Pressable {...props} />;
}
