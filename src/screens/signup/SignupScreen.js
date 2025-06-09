import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {User, Mail, Lock, Image as ImageIcon} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import Typography from '../../constants/Typography';
import {launchImageLibrary} from 'react-native-image-picker';
import {useAuth} from '../../context/AuthContext';
import {showToast} from '../../components/Toast';
import {string} from '../../constants/string';

export default function SignupScreen() {
  const navigation = useNavigation();
  const {register, authLoading} = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleImagePick = () => {
    if (authLoading) return;
    launchImageLibrary({mediaType: 'photo', quality: 0.8}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        showToast({
          type: 'error',
          title: 'Image Picker Error',
          message: `Failed to pick image: ${response.errorMessage}`,
        });
      } else if (response.assets && response.assets[0].uri) {
        setProfilePic(response.assets[0]);
      }
    });
  };

  const handleRegister = async () => {
    const success = await register(
      firstName,
      lastName,
      gender,
      email,
      password,
      confirmPassword,
      profilePic,
    );
    if (success) {
      setFirstName('');
      setLastName('');
      setGender('');
      setProfilePic(null);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      navigation.navigate('BottomTab');
    }
  };

  return (
    <LinearGradient
      colors={[Colors.primary[100], Colors.primary[300]]}
      style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{string.create_account}</Text>
          <Text style={styles.subtitle}>
            {string.join_us_to_shop_and_enjoy_exclusive_offers}
          </Text>
        </View>

        <View style={styles.avatarContainer}>
          <TouchableOpacity
            onPress={handleImagePick}
            style={[styles.avatar, authLoading && styles.disabledAvatar]}
            disabled={authLoading}
            accessibilityLabel={string.upload_profile_picture_accessibility}>
            {profilePic ? (
              <Image
                source={{uri: profilePic.uri}}
                style={styles.avatarImage}
              />
            ) : (
              <ImageIcon size={40} color={Colors.primary[600]} />
            )}
          </TouchableOpacity>
          <Text style={styles.avatarText}>{string.upload_profile_picture}</Text>
        </View>

        <InputField
          label={string.first_name}
          placeholder={string.enter_first_name}
          value={firstName}
          onChangeText={setFirstName}
          required
          leftIcon={<User size={20} color={Colors.primary[600]} />}
          style={styles.input}
          editable={!authLoading}
          accessibilityLabel={string.first_name_input_accessibility}
        />

        <InputField
          label={string.last_name}
          placeholder={string.enter_last_name}
          value={lastName}
          onChangeText={setLastName}
          required
          leftIcon={<User size={20} color={Colors.primary[600]} />}
          style={styles.input}
          editable={!authLoading}
          accessibilityLabel={string.last_name_input_accessibility}
        />

        <View
          style={[
            styles.pickerContainer,
            authLoading && styles.disabledPicker,
          ]}>
          <Text style={styles.label}>{string.gender}</Text>
          <Picker
            selectedValue={gender}
            onValueChange={setGender}
            style={styles.picker}
            enabled={!authLoading}
            accessibilityLabel={string.gender_selector_accessibility}>
            <Picker.Item label={string.select_gender} value="" />
            <Picker.Item label={string.male} value="male" />
            <Picker.Item label={string.female} value="female" />
            <Picker.Item label={string.other} value="other" />
          </Picker>
        </View>

        <InputField
          label={string.email_address}
          placeholder={string.enter_email}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          required
          leftIcon={<Mail size={20} color={Colors.primary[600]} />}
          style={styles.input}
          editable={!authLoading}
          accessibilityLabel={string.email_input_accessibility}
        />

        <InputField
          label={string.password}
          placeholder={string.enter_password}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          required
          leftIcon={<Lock size={20} color={Colors.primary[600]} />}
          style={styles.input}
          editable={!authLoading}
          accessibilityLabel={string.password_input_accessibility}
        />

        <InputField
          label={string.confirm_password}
          placeholder={string.confirm_your_password}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          required
          leftIcon={<Lock size={20} color={Colors.primary[600]} />}
          style={styles.input}
          editable={!authLoading}
          accessibilityLabel={string.confirm_password_input_accessibility}
        />

        <View style={styles.buttonContainer}>
          <LinearGradient
            colors={[Colors.primary[600], Colors.primary[500]]}
            style={styles.gradientButton}>
            <Button
              title={string.create_account_btn}
              onPress={handleRegister}
              loading={authLoading}
              fullWidth
              variant="primary"
              size="large"
              style={styles.authButton}
              textStyle={styles.authButtonText}
            />
          </LinearGradient>
        </View>

        <View style={styles.socialLoginContainer}>
          <Text style={styles.socialLoginText}>{string.or_sign_up_with}</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialButton}
              disabled={authLoading}
              accessibilityLabel={string.sign_up_with_google}>
              <Image
                source={require('../../assets/images/google.png')}
                style={styles.socialButtonImage}
              />
              <Text style={styles.socialButtonText}>{string.google}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              disabled={authLoading}
              accessibilityLabel={string.sign_up_with_facebook}>
              <Image
                source={require('../../assets/images/facebook.png')}
                style={styles.socialButtonImage}
              />
              <Text style={styles.socialButtonText}>{string.facebook}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.switchAuthMode}>
          <TouchableOpacity
            onPress={() => navigation.navigate('login')}
            disabled={authLoading}
            accessibilityLabel={string.navigate_to_login_screen}>
            <Text style={styles.switchAuthText}>
              {string.already_have_an_account}{' '}
              <Text style={styles.signUpLink}>{string.sign_in}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.md,
    flexGrow: 1,
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.xxxl,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    letterSpacing: 1.2,
  },
  subtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.lg,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.lg * 1.5,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  disabledAvatar: {
    opacity: 0.6,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  avatarText: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  input: {
    borderRadius: Spacing.radius.lg,
    marginBottom: Spacing.md,
  },
  pickerContainer: {
    marginBottom: Spacing.md,
    borderRadius: Spacing.radius.sm,
  },
  disabledPicker: {
    opacity: 0.6,
  },
  picker: {
    backgroundColor: Colors.background,
    borderRadius: Spacing.radius.full,
  },
  label: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  buttonContainer: {
    marginTop: Spacing.sm,
  },
  gradientButton: {
    borderRadius: Spacing.radius.lg,
    padding: 2,
  },
  authButton: {
    borderRadius: Spacing.radius.lg,
    backgroundColor: 'transparent',
  },
  authButtonText: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.lg,
    color: Colors.background,
  },
  socialLoginContainer: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  socialLoginText: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  socialButton: {
    backgroundColor: Colors.neutral[100],
    borderRadius: Spacing.radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialButtonImage: {
    width: 20,
    height: 20,
    marginRight: Spacing.sm,
  },
  socialButtonText: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.text.primary,
  },
  switchAuthMode: {
    marginTop: Spacing.sm,
    alignSelf: 'center',
  },
  switchAuthText: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
  },
  signUpLink: {
    color: Colors.primary[600],
    textDecorationLine: 'underline',
  },
});
