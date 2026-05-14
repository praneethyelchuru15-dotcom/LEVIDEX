import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Dimensions, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CATEGORIES: any[] = [
  { id: 'resistors', name: 'Resistors', icon: 'resistor', color: '#FF9500', imageSource: require('../../assets/images/cat_resistor.jpg') },
  { id: 'capacitors', name: 'Capacitors', icon: 'capacitor', color: '#5856D6', imageSource: require('../../assets/images/cat_capacitor.png') },
  { id: 'diodes', name: 'Diodes & LEDs', icon: 'diode', color: '#FF2D55', imageSource: require('../../assets/images/cat_diode.jpg') },
  { id: 'transistors', name: 'Transistors', icon: 'transistor', color: '#007AFF', imageSource: require('../../assets/images/cat_transistor.jpg') },
  { id: 'ics', name: 'Integrated Circuits', icon: 'chip', color: '#AF52DE', imageSource: require('../../assets/images/cat_ics.jpg') },
  { id: 'sensors', name: 'Sensors', icon: 'leak', color: '#34C759', imageSource: require('../../assets/images/cat_sensors.jpg') },
  { id: 'logic', name: 'Logic Gates', icon: 'gate-and', color: '#FFCC00', imageSource: require('../../assets/images/cat_logic.png') },
  { id: 'tools', name: 'Calculators', icon: 'calculator', color: '#8E8E93' },
];

export default function HomeScreen() {
  const router = useRouter();

  // Track app usage
  useEffect(() => {
    const logSession = async () => {
      try {
        if (auth.currentUser) {
          await addDoc(collection(db, "app_sessions"), {
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser.email,
            action: "app_open",
            timestamp: serverTimestamp()
          });
        }
      } catch (e) {
        // Silently fail — tracking should never break the app
      }
    };
    logSession();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  const renderItem = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => {
        if (item.id === 'tools') {
          router.push('/tools/resistor');
        } else {
          router.push({ pathname: '/category/[id]', params: { id: item.id, name: item.name } });
        }
      }}
      activeOpacity={0.8}
    >
      {item.imageSource ? (
        <Image source={item.imageSource} style={styles.categoryImage} resizeMode="contain" />
      ) : item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.categoryImage} resizeMode="cover" />
      ) : (
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <MaterialCommunityIcons name={item.icon as any} size={36} color="#FFF" />
        </View>
      )}
      <Text style={styles.cardTitle}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.title}>Levidex Library</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => router.push('/admin' as any)} style={styles.profileBtn}>
            <MaterialCommunityIcons name="cog" size={24} color="#5856D6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.profileBtn}>
            <MaterialCommunityIcons name="logout" size={24} color="#ff3b30" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchBar}
        activeOpacity={0.7}
        onPress={() => router.push('/search' as any)}
      >
        <MaterialCommunityIcons name="magnify" size={20} color="#8E8E93" />
        <Text style={styles.searchPlaceholder}>Search components...</Text>
      </TouchableOpacity>

      <FlatList
        data={CATEGORIES}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7' // iOS light grey background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40, // manual padding for standard android status bar overlap
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 4
  },
  title: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: '#1C1C1E',
    letterSpacing: -0.5
  },
  profileBtn: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: '#8E8E93',
    flex: 1,
  },
  grid: {
    padding: 10
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 10,
    width: (width / 2) - 30, // 2 columns with padding
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#F2F2F7',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  }
});
