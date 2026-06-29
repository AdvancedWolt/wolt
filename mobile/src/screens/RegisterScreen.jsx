import { useState } from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';

import Screen from '../components/Screen';
import AppText from '../components/AppText';
import Field from '../components/Field';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useImagePicker } from '../hooks/useImagePicker';
import { ROLES } from '../constants';
import {
  validateUsername,
  validatePassword,
  validateConfirmPassword,
  validateDisplayName,
  validateCoordinate,
} from '../utils/validators';

const validators = {
  username: validateUsername,
  password: validatePassword,
  confirmPassword: validateConfirmPassword,
  displayName: validateDisplayName,
  locationX: (value) => validateCoordinate(value, 'Latitude'),
  locationY: (value) => validateCoordinate(value, 'Longitude'),
};

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const { theme } = useTheme();
  const image = useImagePicker();

  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    locationX: '',
    locationY: '',
    role: ROLES.CUSTOMER,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setField = (name) => (value) => {
    const next = { ...form, [name]: value };
    setForm(next);
    if (touched[name] && validators[name]) {
      setErrors((prev) => ({ ...prev, [name]: validators[name](value, next) }));
    }
    // Re-check the confirmation whenever the password itself changes.
    if (name === 'password' && touched.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: validators.confirmPassword(next.confirmPassword, next) }));
    }
  };

  const handleBlur = (name) => () => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (validators[name]) setErrors((prev) => ({ ...prev, [name]: validators[name](form[name], form) }));
  };

  const validateAll = () => {
    const fieldErrors = {};
    for (const key of Object.keys(validators)) fieldErrors[key] = validators[key](form[key], form);
    setErrors(fieldErrors);
    setTouched(Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return Object.values(fieldErrors).every((message) => !message);
  };

  const submit = async () => {
    setServerError('');
    if (!validateAll() || image.error) return;

    setSubmitting(true);
    try {
      await register({
        username: form.username,
        password: form.password,
        displayName: form.displayName,
        image: image.imageData,
        role: form.role,
        location: { x: parseFloat(form.locationX), y: parseFloat(form.locationY) },
      });
      navigation.replace('Login');
    } catch (err) {
      setServerError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const renderRole = (value, icon, title, subtitle) => {
    const active = form.role === value;
    return (
      <Pressable
        onPress={() => setField('role')(value)}
        style={[
          styles.role,
          { borderColor: active ? theme.brand : theme.border, backgroundColor: active ? theme.brandSoft : theme.card },
        ]}
      >
        <AppText variant="subtitle">{icon}</AppText>
        <View style={styles.roleCopy}>
          <AppText weight="700">{title}</AppText>
          <AppText variant="small" muted>{subtitle}</AppText>
        </View>
      </Pressable>
    );
  };

  return (
    <Screen scroll>
      <View>
        <AppText variant="title" weight="800">Create your account</AppText>
        <AppText muted style={styles.subtitle}>Set up your profile to start ordering.</AppText>

        {serverError ? (
          <View style={[styles.banner, { backgroundColor: theme.dangerSoft, borderColor: theme.danger }]}>
            <AppText color={theme.danger}>{serverError}</AppText>
          </View>
        ) : null}

        <View style={styles.roles}>
          {renderRole(ROLES.CUSTOMER, '🛍️', 'Customer', 'Browse and order food')}
          {renderRole(ROLES.OWNER, '🍽️', 'Restaurant owner', 'Create and manage restaurants')}
        </View>

        <Pressable
          onPress={image.pick}
          style={[styles.imagePicker, { borderColor: theme.border, backgroundColor: theme.card }]}
        >
          {image.imageData ? (
            <Image source={{ uri: image.imageData }} style={styles.preview} />
          ) : (
            <>
              <AppText variant="title">📷</AppText>
              <AppText muted>Add photo (optional)</AppText>
            </>
          )}
        </Pressable>
        {image.imageData ? (
          <Pressable onPress={image.remove}>
            <AppText color={theme.danger} style={styles.removePhoto}>Remove photo</AppText>
          </Pressable>
        ) : null}
        {image.error ? <AppText color={theme.danger} variant="small">{image.error}</AppText> : null}

        <Field
          label="Username"
          value={form.username}
          onChangeText={setField('username')}
          onBlur={handleBlur('username')}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Choose a username"
          error={touched.username && errors.username}
        />
        <Field
          label="Display name"
          value={form.displayName}
          onChangeText={setField('displayName')}
          onBlur={handleBlur('displayName')}
          placeholder="Shown to others"
          error={touched.displayName && errors.displayName}
        />
        <Field
          label="Latitude"
          value={form.locationX}
          onChangeText={setField('locationX')}
          onBlur={handleBlur('locationX')}
          keyboardType="numbers-and-punctuation"
          placeholder="e.g. 32.0853"
          error={touched.locationX && errors.locationX}
        />
        <Field
          label="Longitude"
          value={form.locationY}
          onChangeText={setField('locationY')}
          onBlur={handleBlur('locationY')}
          keyboardType="numbers-and-punctuation"
          placeholder="e.g. 34.7818"
          error={touched.locationY && errors.locationY}
        />
        <Field
          label="Password"
          value={form.password}
          onChangeText={setField('password')}
          onBlur={handleBlur('password')}
          secureTextEntry
          placeholder="8+ chars, letters & digits"
          error={touched.password && errors.password}
        />
        <Field
          label="Confirm password"
          value={form.confirmPassword}
          onChangeText={setField('confirmPassword')}
          onBlur={handleBlur('confirmPassword')}
          secureTextEntry
          placeholder="Re-enter password"
          error={touched.confirmPassword && errors.confirmPassword}
        />

        <Button
          title={submitting ? 'Creating account…' : 'Register'}
          onPress={submit}
          disabled={submitting}
          loading={submitting}
        />

        <View style={styles.footer}>
          <AppText muted>Already have an account? </AppText>
          <AppText color={theme.brand} weight="700" onPress={() => navigation.replace('Login')}>
            Log in
          </AppText>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  subtitle: { marginTop: 4, marginBottom: 20 },
  banner: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16 },
  roles: { gap: 10, marginBottom: 18 },
  role: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1.5, borderRadius: 12 },
  roleCopy: { flex: 1 },
  imagePicker: {
    height: 130,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%' },
  removePhoto: { marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
});

export default RegisterScreen;
