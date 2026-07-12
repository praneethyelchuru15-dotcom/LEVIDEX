import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../../services/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Component = {
  id: string;
  name: string;
  categoryId: string;
  symbol?: string;
  description?: string;
};

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Component[]>([]);
  const [allComponents, setAllComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Load search history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const saved = await AsyncStorage.getItem('search_history');
        if (saved) {
          setHistory(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load search history:', e);
      }
    };
    loadHistory();
  }, []);

  // Fetch all components once from Firestore
  const fetchAll = async () => {
    if (fetched) return;
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'components'));
      const data: Component[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as Component);
      });
      setAllComponents(data);
      setFetched(true);
    } catch (e) {
      console.error('Search fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (!fetched) await fetchAll();
    if (text.trim() === '') {
      setResults([]);
      return;
    }
    const lower = text.toLowerCase();
    const filtered = allComponents.filter(c =>
      (c.name || '').toLowerCase().includes(lower) ||
      (c.categoryId || '').toLowerCase().includes(lower) ||
      (c.description || '').toLowerCase().includes(lower) ||
      (c.symbol || '').toLowerCase().includes(lower)
    );
    setResults(filtered);
  }, [allComponents, fetched]);

  // Save query to history
  const saveSearchTerm = async (term: string) => {
    if (!term || !term.trim()) return;
    const trimmed = term.trim();
    try {
      const updated = [trimmed, ...history.filter(h => h.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      setHistory(updated);
      await AsyncStorage.setItem('search_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save search term:', e);
    }
  };

  // Delete single history item
  const deleteHistoryItem = async (term: string) => {
    try {
      const updated = history.filter(h => h !== term);
      setHistory(updated);
      await AsyncStorage.setItem('search_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete history item:', e);
    }
  };

  // Clear all history
  const clearAllHistory = async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem('search_history');
    } catch (e) {
      console.error('Failed to clear search history:', e);
    }
  };

  const CATEGORY_COLORS: Record<string, string> = {
    resistors: '#FF9500',
    capacitors: '#5856D6',
    diodes: '#FF2D55',
    transistors: '#007AFF',
    ics: '#AF52DE',
    sensors: '#34C759',
    logic: '#FFCC00',
    inductors: '#5AC8FA',
    motors: '#4CD964',
    electromechanical: '#FF3B30',
    power: '#FF9500',
    prototyping: '#FFCC00',
    development: '#5856D6',
    wires: '#8E8E93',
  };

  // Custom text highlighter helper
  const renderHighlightedText = (text: string, highlight: string, baseStyle: any, highlightStyle: any) => {
    if (!highlight.trim()) return <Text style={baseStyle}>{text}</Text>;
    const escapedHighlight = highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));
    return (
      <Text style={baseStyle}>
        {parts.map((part, index) => 
          part.toLowerCase() === highlight.toLowerCase()
            ? <Text key={index} style={highlightStyle}>{part}</Text>
            : <Text key={index}>{part}</Text>
        )}
      </Text>
    );
  };

  const renderResult = ({ item }: { item: Component }) => {
    const color = CATEGORY_COLORS[item.categoryId] || '#8E8E93';
    return (
      <TouchableOpacity
        style={styles.resultCard}
        activeOpacity={0.75}
        onPress={async () => {
          await saveSearchTerm(query || item.name);
          router.push({ pathname: '/component/[componentId]', params: { componentId: item.id, name: item.name } });
        }}
      >
        <View style={[styles.symbolBox, { backgroundColor: color + '22' }]}>
          <Text style={[styles.symbolText, { color }]}>{item.symbol || item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.resultInfo}>
          {renderHighlightedText(item.name, query, styles.resultName, styles.highlightText)}
          <Text style={styles.resultCategory}>{item.categoryId?.toUpperCase()}</Text>
          {!!item.description && (
            renderHighlightedText(item.description, query, styles.resultDesc, styles.highlightTextDesc)
          )}
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#C7C7CC" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Components</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={22} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search resistors, capacitors, LM741..."
          placeholderTextColor="#8E8E93"
          value={query}
          onChangeText={handleSearch}
          onSubmitEditing={() => saveSearchTerm(query)}
          autoFocus
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#5856D6" />
          <Text style={styles.loadingText}>Loading components...</Text>
        </View>
      )}

      {/* History and Empty state */}
      {!loading && query.length === 0 && (
        <View style={{ flex: 1 }}>
          {history.length > 0 ? (
            <View style={styles.historyContainer}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={clearAllHistory}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={history}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.historyRow}>
                    <TouchableOpacity 
                      style={styles.historyItemBtn}
                      onPress={() => handleSearch(item)}
                    >
                      <MaterialCommunityIcons name="history" size={20} color="#8E8E93" style={{ marginRight: 12 }} />
                      <Text style={styles.historyItemText}>{item}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteHistoryBtn}
                      onPress={() => deleteHistoryItem(item)}
                    >
                      <MaterialCommunityIcons name="close" size={18} color="#C7C7CC" />
                    </TouchableOpacity>
                  </View>
                )}
                scrollEnabled={false}
              />
            </View>
          ) : (
            <View style={styles.center}>
              <MaterialCommunityIcons name="text-search" size={64} color="#C7C7CC" />
              <Text style={styles.emptyTitle}>Search Components</Text>
              <Text style={styles.emptySubtitle}>Type a name, category or symbol to find components</Text>
            </View>
          )}
        </View>
      )}

      {/* No results */}
      {!loading && query.length > 0 && results.length === 0 && (
        <View style={styles.center}>
          <MaterialCommunityIcons name="emoticon-sad-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>No results for "{query}"</Text>
          <Text style={styles.emptySubtitle}>Try a different name or category</Text>
        </View>
      )}

      {/* Results */}
      {query.length > 0 && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={renderResult}
          contentContainerStyle={styles.resultsList}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultsCount}>{results.length} result{results.length !== 1 ? 's' : ''}</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    paddingVertical: 0,
  },
  resultsList: { paddingHorizontal: 16, paddingBottom: 24 },
  resultsCount: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 10,
    marginTop: 4,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  symbolBox: {
    width: 46, height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  symbolText: { fontSize: 16, fontWeight: '800' },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 15, fontWeight: '700', color: '#1C1C1E', marginBottom: 2 },
  resultCategory: { fontSize: 11, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.5 },
  resultDesc: { fontSize: 13, color: '#8E8E93', marginTop: 2, lineHeight: 18 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginTop: 16, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: '#8E8E93', marginTop: 6, textAlign: 'center', lineHeight: 20 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#8E8E93' },

  // History & Highlighting Styles
  historyContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  clearAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
  },
  historyItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyItemText: {
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  deleteHistoryBtn: {
    padding: 4,
  },
  highlightText: {
    color: '#007AFF',
    fontWeight: '800',
  },
  highlightTextDesc: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
