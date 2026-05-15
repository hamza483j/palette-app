import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import axios from 'axios';

const API = 'http://192.168.11.161:5000/api';

export default function ProfileScreen({ route, navigation }) {
  const { user, token } = route.params;
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, today: 0, totalUnites: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/palettes/my-palettes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const total = res.data.length;
      const today = res.data.filter(p =>
        new Date(p.scan_time).toDateString() === new Date().toDateString()
      ).length;
      const totalUnites = res.data.reduce((sum, p) => sum + (p.quantite || 0), 0);
      setStats({ total, today, totalUnites });
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setLoading(true);
    try {
      await axios.put(`${API}/users/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('✅ Succès', 'Mot de passe modifié avec succès !');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur modification');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon profil</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>👷 Opérateur</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total palettes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#f39c12' }]}>{stats.today}</Text>
            <Text style={styles.statLabel}>Aujourd'hui</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#6f42c1' }]}>{stats.totalUnites}</Text>
            <Text style={styles.statLabel}>Total unités</Text>
          </View>
        </View>

        {/* Infos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Text style={{ color: '#00b894' }}>ℹ️ </Text>
            Informations personnelles
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nom</Text>
            <Text style={styles.infoValue}>{user.name}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rôle</Text>
            <Text style={[styles.infoValue, { color: '#00b894' }]}>Opérateur</Text>
          </View>
        </View>

        {/* Changer mot de passe */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Text style={{ color: '#00b894' }}>🔒 </Text>
            Changer le mot de passe
          </Text>

          <Text style={styles.label}>Ancien mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Nouveau mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Confirmer le mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.btn} onPress={handleChangePassword} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Modifier le mot de passe</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Déconnexion */}
        <TouchableOpacity style={styles.logoutBtn}
          onPress={() => {
            Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Oui', onPress: () => navigation.replace('Login') }
            ]);
          }}>
          <Text style={styles.logoutText}>🚪 Se déconnecter</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: { backgroundColor: '#0f2027', padding: 20, paddingTop: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { color: '#00b894', fontSize: 15, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginVertical: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#00b894', justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#00b894', shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#0f2027', marginBottom: 8 },
  roleBadge: { backgroundColor: '#e8f8f5', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  roleText: { color: '#00b894', fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#00b894' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f2027', marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  infoLabel: { color: '#888', fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#0f2027' },
  divider: { height: 1, backgroundColor: '#f0f0f0' },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 15, backgroundColor: '#f8f9fa' },
  btn: { backgroundColor: '#00b894', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: { backgroundColor: '#fdecea', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  logoutText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 16 },
});