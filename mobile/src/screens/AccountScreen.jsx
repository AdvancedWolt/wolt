import { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import AppText from '../components/AppText';
import Button from '../components/Button';
import Field from '../components/Field';
import Screen from '../components/Screen';
import { getUser, updateUser } from '../api/endpoints';
import { ROLES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useImagePicker } from '../hooks/useImagePicker';
import { validateUsername, validateDisplayName, validateCoordinate } from '../utils/validators';

const validators = {
  username: validateUsername,
  displayName: validateDisplayName,
  locationX: (value) => validateCoordinate(value, 'Latitude'),
  locationY: (value) => validateCoordinate(value, 'Longitude'),
};

const toForm = (profile) => ({
  username: profile?.username || '',
  displayName: profile?.displayName || '',
  locationX: profile?.location?.x !== undefined ? String(profile.location.x) : '',
  locationY: profile?.location?.y !== undefined ? String(profile.location.y) : '',
});

// Profile editing for the signed-in user (EX5-11): display name, username,
// delivery location and photo. Mirrors the web ManageAccount page — PATCHes
// /api/users/:id, then updates the cached auth user so the drawer/header refresh.
const AccountScreen = () => {
  const { user, updateAuthUser } = useAuth();
  const { theme } = useTheme();
  const image = useImagePicker(user?.image || null);

  const [form, setForm] = useState(() => toForm(user));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const noticeTimer = useRef(null);

  // Refresh from the server (the source of truth) when the screen opens, falling
  // back to the cached profile already shown if the request fails.
  useEffect(() => {
    if (!user?.id) return undefined;
    let active = true;
    getUser(user.id)
      .then((profile) => {
        if (!active || !profile) return;
        setForm(toForm(profile));
        image.setImageData(profile.image || null);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [user?.id]);

  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  const setField = (name) => (value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (validators[name]) {
      setErrors((prev) => ({ ...prev, [name]: validators[name](value) }));
    }
    if (serverError) setServerError('');
    if (notice) setNotice('');
  };

  const handleBlur = (name) => () => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (validators[name]) setErrors((prev) => ({ ...prev, [name]: validators[name](form[name]) }));
  };

  const getFieldErrors = () => {
    const fieldErrors = {};
    for (const key of Object.keys(validators)) fieldErrors[key] = validators[key](form[key]);
    return fieldErrors;
  };

  const currentErrors = getFieldErrors();
  const disabled = submitting || Boolean(image.error) || Object.values(currentErrors).some(Boolean);

  const submit = async () => {
    setServerError('');
    setNotice('');
    const fieldErrors = getFieldErrors();
    setErrors(fieldErrors);
    setTouched({ username: true, displayName: true, locationX: true, locationY: true });
    if (Object.values(fieldErrors).some(Boolean) || image.error) return;

    setSubmitting(true);
    try {
      const updates = {
        username: form.username.trim(),
        displayName: form.displayName.trim(),
        location: { x: Number(form.locationX), y: Number(form.locationY) },
        image: image.imageData,
      };
      await updateUser(user.id, updates);
      updateAuthUser(updates);
      setNotice('Profile updated successfully!');
      clearTimeout(noticeTimer.current);
      noticeTimer.current = setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      setServerError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const roleName = user?.role === ROLES.OWNER ? 'Restaurant owner' : 'Customer';

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppText variant="title" weight="800">Profile settings</AppText>
        <AppText muted style={styles.subtitle}>Update your display name, photo and delivery location.</AppText>

        {serverError ? (
          <View style={[styles.banner, { backgroundColor: theme.dangerSoft, borderColor: theme.danger }]}>
            <AppText color={theme.danger} weight="700">{serverError}</AppText>
          </View>
        ) : null}
        {notice ? (
          <View style={[styles.banner, { borderColor: theme.success }]}>
            <AppText color={theme.success} weight="700">{notice}</AppText>
          </View>
        ) : null}

        <View style={styles.avatarBlock}>
          <Pressable
            onPress={image.pick}
            style={[styles.avatar, { borderColor: theme.border, backgroundColor: theme.card }]}
          >
            {image.imageData ? (
              <Image source={{ uri: image.imageData }} style={styles.avatarImage} />
            ) : (
              <AppText variant="title" weight="800">
                {(user?.displayName || user?.username || '?').slice(0, 1).toUpperCase()}
              </AppText>
            )}
          </Pressable>
          <View style={styles.avatarMeta}>
            <AppText weight="800">{user?.displayName || user?.username}</AppText>
            <AppText variant="small" muted>@{user?.username}</AppText>
            <View style={[styles.roleBadge, { backgroundColor: theme.brandSoft }]}>
              <AppText variant="small" weight="700" color={theme.brand}>{roleName}</AppText>
            </View>
          </View>
        </View>
        <View style={styles.avatarActions}>
          <Button title="Change photo" variant="secondary" onPress={image.pick} style={styles.smallButton} />
          {image.imageData ? (
            <Button title="Remove" variant="secondary" onPress={image.remove} style={styles.smallButton} />
          ) : null}
        </View>
        {image.error ? <AppText color={theme.danger} variant="small" style={styles.imageError}>{image.error}</AppText> : null}

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

        <AppText variant="subtitle" weight="800" style={styles.sectionTitle}>Delivery location</AppText>
        <View style={styles.row}>
          <Field
            label="Latitude (X)"
            value={form.locationX}
            onChangeText={setField('locationX')}
            onBlur={handleBlur('locationX')}
            keyboardType="numbers-and-punctuation"
            placeholder="e.g. 32.0853"
            error={touched.locationX && errors.locationX}
            style={styles.rowField}
          />
          <Field
            label="Longitude (Y)"
            value={form.locationY}
            onChangeText={setField('locationY')}
            onBlur={handleBlur('locationY')}
            keyboardType="numbers-and-punctuation"
            placeholder="e.g. 34.7818"
            error={touched.locationY && errors.locationY}
            style={styles.rowField}
          />
        </View>

        <Button
          title={submitting ? 'Saving changes…' : 'Save changes'}
          onPress={submit}
          disabled={disabled}
          loading={submitting}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  subtitle: { marginTop: 4, marginBottom: 20 },
  banner: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16 },
  avatarBlock: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  avatar: { width: 84, height: 84, borderRadius: 42, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarMeta: { flex: 1, gap: 4, alignItems: 'flex-start' },
  roleBadge: { borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10, marginTop: 2 },
  avatarActions: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  smallButton: { height: 40, flex: 1 },
  imageError: { marginBottom: 12 },
  sectionTitle: { marginTop: 4, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 10 },
  rowField: { flex: 1 },
});

export default AccountScreen;
