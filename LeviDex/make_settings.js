const fs = require('fs');
const file = 'c:/Users/prane/.gemini/antigravity/playground/sidereal-oort/ElectroGuide/src/app/settings.tsx';
const content = "import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => signOut(auth) }
      ]
    );
  };

  const clearSearchHistory = async () => {
    try {
      await AsyncStorage.removeItem('recentSearches');
      Alert.alert('Success', 'Search history cleared.');
    } catch (e) {
      Alert.alert('Error', 'Could not clear search history.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name='arrow-left' size={24} color='#1C1C1E' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <MaterialCommunityIcons name='account-circle' size={24} color='#8E8E93' />
            <Text style={styles.rowText}>{user?.email || 'Not logged in'}</Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <MaterialCommunityIcons name='logout' size={24} color='#FF3B30' />
            <Text style={[styles.rowText, { color: '#FF3B30' }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={clearSearchHistory}>
            <MaterialCommunityIcons name='history' size={24} color='#007AFF' />
            <Text style={styles.rowText}>Clear Search History</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/feedback' as any)}>
            <MaterialCommunityIcons name='message-draw' size={24} color='#34C759' />
            <Text style={styles.rowText}>Send Feedback</Text>
            <MaterialCommunityIcons name='chevron-right' size={24} color='#C7C7CC' style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15
  },
  backBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 20, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', marginBottom: 8, marginLeft: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  rowText: { fontSize: 16, color: '#1C1C1E', marginLeft: 12 },
  divider: { height: 1, backgroundColor: '#C7C7CC', marginLeft: 52 }
});";
fs.writeFileSync(file, content);
console.log('Wrote settings.tsx');
