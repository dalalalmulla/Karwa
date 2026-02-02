import { Image } from 'expo-image';
import { StyleSheet, ImageStyle} from 'react-native';

interface LogoProps {
  size?: number;
  style?: ImageStyle;
}

export default function Logo({ size = 120, style }: LogoProps) {
  return (
    <Image
      source={require('../../assets/images/Karwa.png')}
      style={[styles.logo, { width: size, height: size }, style]}
      contentFit="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
    marginTop: -24, 
  },
});