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
import {Mail, Lock} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import Typography from '../../constants/Typography';
import {useAuth} from '../../context/AuthContext';
import {string} from '../../constants/string';

export default function LoginScreen() {
  const navigation = useNavigation();
  const {login, authLoading} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const {success} = await login(email, password);

    if (success) {
      setEmail('');
      setPassword('');
      navigation.navigate('BottomTab');
    }
  };

  return (
    <LinearGradient
      colors={[Colors.primary[100], Colors.primary[300]]}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{string.welcome_back}</Text>
          <Text style={styles.subtitle}>
            {string.sign_in_to_explore_exclusive_deals_and_manage_your_orders}
          </Text>
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

        <View style={styles.buttonContainer}>
          <LinearGradient
            colors={[Colors.primary[600], Colors.primary[500]]}
            style={styles.gradientButton}>
            <Button
              title={string.sign_in}
              onPress={handleLogin}
              loading={authLoading}
              fullWidth
              variant="primary"
              size="large"
              style={styles.authButton}
              textStyle={styles.authButtonText}
            />
          </LinearGradient>
        </View>

        <View style={styles.socialLogin}>
          <Text style={styles.socialLoginText}>{string.or_sign_in_with}</Text>
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

        <View style={styles.switchAuth}>
          <TouchableOpacity
            onPress={() => navigation.navigate('signup')}
            disabled={authLoading}
            accessibilityLabel="Navigate to sign up screen">
            <Text style={styles.switchAuthText}>
              {string.do_not_have_an_account}{' '}
              <Text style={styles.signUpLink}>{string.sign_up}</Text>
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
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.lg,
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
    marginBottom: Spacing.xl,
    lineHeight: Typography.sizes.lg * 1.5,
  },
  input: {
    backgroundColor: 'transparent',
    marginBottom: Spacing.md,
  },
  buttonContainer: {
    marginTop: Spacing.md,
  },
  gradientButton: {
    borderRadius: Spacing.radius.lg,
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
  socialLogin: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  socialLoginText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  socialButton: {
    backgroundColor: Colors.neutral[100],
    borderRadius: Spacing.radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
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
  switchAuth: {
    marginTop: Spacing.md,
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
