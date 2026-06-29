import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

import Screen from '../components/Screen';
import AppText from '../components/AppText';
import Field from '../components/Field';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { requiredField } from '../utils/validators';

const LABELS = { username: 'Username', password: 'Password' };

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const { theme } = useTheme();

  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setField = (name) => (value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) setErrors((prev) => ({ ...prev, [name]: requiredField(value, LABELS[name]) }));
  };

  const handleBlur = (name) => () => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: requiredField(form[name], LABELS[name]) }));
  };

  const submit = async () => {
    setServerError('');
    const next = {
      username: requiredField(form.username, 'Username'),
      password: requiredField(form.password, 'Password'),
    };
    if (next.username || next.password) {
      setErrors(next);
      setTouched({ username: true, password: true });
      return;
    }

    setSubmitting(true);
    try {
      await login(form.username, form.password);
      // Drop the auth screens and land back on the main app, signed in.
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      setServerError(err.message || 'Invalid username or password');
    } finally {
      setSubmitting(false);
    }
  };

  const disabled = submitting || !form.username || !form.password;

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppText variant="title" weight="800">Welcome back</AppText>
        <AppText muted style={styles.subtitle}>Log in to keep ordering from places you love.</AppText>

        {serverError ? (
          <View style={[styles.banner, { backgroundColor: theme.dangerSoft, borderColor: theme.danger }]}>
            <AppText color={theme.danger}>{serverError}</AppText>
          </View>
        ) : null}

        <Field
          label="Username"
          value={form.username}
          onChangeText={setField('username')}
          onBlur={handleBlur('username')}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Enter your username"
          error={touched.username && errors.username}
        />
        <Field
          label="Password"
          value={form.password}
          onChangeText={setField('password')}
          onBlur={handleBlur('password')}
          secureTextEntry
          placeholder="Enter your password"
          error={touched.password && errors.password}
        />

        <Button
          title={submitting ? 'Logging in…' : 'Log in'}
          onPress={submit}
          disabled={disabled}
          loading={submitting}
        />

        <View style={styles.footer}>
          <AppText muted>Don&apos;t have an account? </AppText>
          <AppText color={theme.brand} weight="700" onPress={() => navigation.navigate('Register')}>
            Register
          </AppText>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  subtitle: { marginTop: 4, marginBottom: 20 },
  banner: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
});

export default LoginScreen;
