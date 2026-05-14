import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

const API = 'http://192.168.11.161:5000/api';

export default function HistoryScreen({ route, navigation }) {
  const { user, token } = route.params;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => { fetchHistory(); }, []);

  useFocusEffect(
    useCallback(() => { fetchHistory(); }, [])
  );

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/palettes/my-palettes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
      const today = res.data.filter(p =>
        new Date(p.scan_time).toDateString() === new Date().toDateString()
      ).length;
      setTodayCount(today);
    } catch (err) {
      console.log('Erreur history:', err.message);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        <View style={[styles.dot, { backgroundColor: '#00b894' }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.itemCode}>{item.code_barre || 'Sans code barre'}</Text>
          <Text style={styles.itemMatiere}>📦 {item.matiere_nom}</Text>
          <Text style={styles.itemDate}>
            {new Date(item.scan_time).toLocaleDateString('fr-FR')} à{' '}
            {new Date(item.scan_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {item.fournisseur && (
            <Text style={styles.itemFournisseur}>🏭 {item.fournisseur}</Text>
          )}
        </View>
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.itemQuantite}>{item.quantite}</Text>
        <Text style={styles.itemUnite}>unités</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes palettes</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.todayCard}>
        <View style={styles.todayLeft}>
          <Text style={styles.todayEmoji}>📊</Text>
          <View>
            <Text style={styles.todayLabel}>Aujourd'hui</Text>
            <Text style={styles.todaySub}>Palettes ajoutées</Text>
          </View>
        </View>
        <Text style={styles.todayCount}>{todayCount}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{history.length}</Text>
          <Text style={styles.statLabel}>Total palettes</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#00b894' }]}>{todayCount}</Text>
          <Text style={styles.statLabel}>Aujourd'hui</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#6f42c1' }]}>
            {history.reduce((sum, p) => sum + (p.quantite || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Total unités</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Historique complet</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#00b894" style={{ marginTop: 40 }} />
      ) : history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>Aucune palette enregistrée</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00b894" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: { backgroundColor: '#0f2027', padding: 20, paddingTop: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { color: '#00b894', fontSize: 15, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  todayCard: { margin: 16, backgroundColor: '#0f2027', borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  todayLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  todayEmoji: { fontSize: 36 },
  todayLabel: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  todaySub: { color: '#ffffff80', fontSize: 13 },
  todayCount: { color: '#00b894', fontSize: 48, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#0f2027' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f2027', marginHorizontal: 16, marginBottom: 12 },
  item: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, minWidth: 10 },
  itemCode: { fontSize: 15, fontWeight: 'bold', color: '#0f2027' },
  itemMatiere: { fontSize: 13, color: '#00b894', marginTop: 2, fontWeight: '600' },
  itemDate: { fontSize: 12, color: '#888', marginTop: 2 },
  itemFournisseur: { fontSize: 12, color: '#6f42c1', marginTop: 2 },
  itemRight: { alignItems: 'flex-end' },
  itemQuantite: { fontSize: 22, fontWeight: 'bold', color: '#00b894' },
  itemUnite: { fontSize: 11, color: '#888' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 64 },
  emptyText: { color: '#888', fontSize: 16, marginTop: 12 },
});