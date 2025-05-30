// components/Toast.js (unchanged, verified)
import Toast from 'react-native-toast-message';
import {View, Text, StyleSheet} from 'react-native';
import Colors from '../constants/Colors';
import Spacing from '../constants/Spacing';
import Typography from '../constants/Typography';

const toastConfig = {
  success: ({text1, text2, ...rest}) => (
    <View style={styles.successmodal}>
      <Text style={styles.modalText}>{text1}</Text>
      {text2 && <Text style={styles.modalMessage}>{text2}</Text>}
    </View>
  ),
  errorModal: ({text1, text2, ...rest}) => (
    <View style={styles.errorModal}>
      <Text style={styles.modalText}>{text1}</Text>
      {text2 && <Text style={styles.modalMessage}>{text2}</Text>}
    </View>
  ),
  modal: ({text1, text2, ...rest}) => (
    <View style={styles.modal}>
      <Text style={styles.modalText}>{text1}</Text>
      {text2 && <Text style={styles.modalMessage}>{text2}</Text>}
    </View>
  ),
};

const styles = StyleSheet.create({
  successmodal: {
    backgroundColor: Colors.success[600],
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    width: '90%',
    maxWidth: 400,
    shadowColor: Colors.text.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  errorModal: {
    backgroundColor: Colors.error[600],
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    width: '90%',
    maxWidth: 400,
    shadowColor: Colors.text.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modal: {
    backgroundColor: Colors.primary[600],
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    width: '90%',
    maxWidth: 400,
    shadowColor: Colors.text.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.md,
    color: Colors.text.inverse,
  },
  modalMessage: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.text.inverse,
    marginTop: Spacing.xs,
  },
});

export const showToast = ({
  type = 'success',
  title,
  message,
  duration = 3000,
  position = 'top',
}) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position,
    visibilityTime: duration,
    autoHide: true,
    topOffset: Spacing.xl,
    bottomOffset: Spacing.xl,
  });
};

const ToastComponent = () => {
  return <Toast config={toastConfig} />;
};

export default ToastComponent;
