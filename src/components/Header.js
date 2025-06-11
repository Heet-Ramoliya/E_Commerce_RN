import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {ArrowLeft} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import Spacing from '../constants/Spacing';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';

const Header = ({title}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <ArrowLeft size={Typography.sizes.xxl} color={Colors.text.primary} />
      </TouchableOpacity>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  title: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.lg,
    color: Colors.text.primary,
    letterSpacing: Typography.letterSpacing.tight,
    lineHeight: Typography.sizes.xxl * Typography.lineHeights.normal,
  },
});

export default Header;
