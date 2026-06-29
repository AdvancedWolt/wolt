import { Text } from 'react-native';

import { useTheme } from '../context/ThemeContext';

const SIZES = { title: 24, subtitle: 18, body: 15, small: 13 };

// Text that defaults to the theme's foreground colour, so screens don't repeat
// the colour binding on every label. `muted` switches to the secondary colour.
const AppText = ({ variant = 'body', muted = false, weight, color, style, children, ...rest }) => {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        { color: color || (muted ? theme.muted : theme.text), fontSize: SIZES[variant] || SIZES.body },
        weight ? { fontWeight: weight } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default AppText;
