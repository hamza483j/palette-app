import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, TextInput,
  KeyboardAvoidingView, Platform, Alert, RefreshControl,
  Modal, FlatList
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

const API = 'http://192.168.11.161:5000/api';

export default function ScanScreen({ route, navigation }) {
  const { user, token } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [matieres, setMatieres] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [lastAdded, setLastAdded] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showMatierePicker, setShowMatierePicker] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const [form, setForm] = useState({
    matiere_id: '',
    quantite: '',
    fournisseur: '',
    date_entree: new Date().toISOString().split('T')[0]
  });
  const scanned = useRef(false);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
    fetchMatieres();
    fetchTodayCount();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTodayCount();
      fetchMatieres();
    }, [])
  );

  const fetchMatieres = async () => {
    try {
      const res = await axios.get(`${API}/matieres`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatieres(res.data);
      if (res.data.length > 0 && !selectedMatiere) {
        setSelectedMatiere(res.data[0]);
        setForm(f => ({ ...f, matiere_id: res.data[0].id.toString() }));
      }
    } catch (err) {
      console.log('Erreur matieres:', err.message);
    }
  };

  const fetchTodayCount = async () => {
    try {
      const res = await axios.get(`${API}/palettes/my-palettes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const today = res.data.filter(p =>
        new Date(p.scan_time).toDateString() === new Date().toDateString()
      ).length;
      setTodayCount(today);
    } catch (err) {
      console.log('Erreur today count:', err.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTodayCount();
    await fetchMatieres();
    setRefreshing(false);
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned.current) return;
    scanned.current = true;
    setScanning(false);
    setScannedCode(data);
    setLastAdded(null);
    await fetchMatieres();
    setShowForm(true);
  };

  const handleSelectMatiere = (m) => {
    setSelectedMatiere(m);
    setForm(f => ({ ...f, matiere_id: m.id.toString() }));
    setShowMatierePicker(false);
  };

  const handleSubmit = async () => {
    if (!form.matiere_id || !form.quantite) {
      Alert.alert('Erreur', 'Matière et quantité sont requis');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/palettes`, {
        code_barre: scannedCode,
        matiere_id: parseInt(form.matiere_id),
        quantite: parseFloat(form.quantite),
        fournisseur: form.fournisseur,
        date_entree: form.date_entree
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const matiereName = selectedMatiere?.nom;
      setLastAdded({ code: scannedCode, matiere: matiereName, quantite: form.quantite });
      setShowForm(false);
      setScannedCode('');
      setForm({
        matiere_id: matieres[0]?.id.toString() || '',
        quantite: '',
        fournisseur: '',
        date_entree: new Date().toISOString().split('T')[0]
      });
      setSelectedMatiere(matieres[0] || null);
      scanned.current = false;
      await fetchTodayCount();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur ajout');
    }
    setLoading(false);
  };

  const resetScan = () => {
    setShowForm(false);
    setScannedCode('');
    setLastAdded(null);
    scanned.current = false;
    setForm({
      matiere_id: matieres[0]?.id.toString() || '',
      quantite: '',
      fournisseur: '',
      date_entree: new Date().toISOString().split('T')[0]
    });
    setSelectedMatiere(matieres[0] || null);
  };

  if (!permission?.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff', marginBottom: 20 }}>Autorisation caméra requise</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Autoriser</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      {/* Modal Matières */}
      <Modal visible={showMatierePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir une matière</Text>
              <TouchableOpacity onPress={() => setShowMatierePicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={matieres}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.matiereItem,
                    selectedMatiere?.id === item.id && styles.matiereItemSelected
                  ]}
                  onPress={() => handleSelectMatiere(item)}
                >
                  <View style={styles.matiereItemLeft}>
                    <Text style={styles.matiereItemIcon}>📦</Text>
                    <View>
                      <Text style={[
                        styles.matiereItemNom,
                        selectedMatiere?.id === item.id && { color: '#00b894' }
                      ]}>
                        {item.nom}
                      </Text>
                      {item.description && (
                        <Text style={styles.matiereItemDesc}>{item.description}</Text>
                      )}
                    </View>
                  </View>
                  {selectedMatiere?.id === item.id && (
                    <Text style={{ color: '#00b894', fontSize: 20 }}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>PaletteApp</Text>
          <Text style={styles.headerSub}>👷 {user.name}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}
            onPress={() => navigation.navigate('History', { user, token })}>
            <Text style={styles.iconBtnText}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}
            onPress={() => navigation.navigate('Profile', { user, token })}>
            <Text style={styles.iconBtnText}>👤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn}
            onPress={() => navigation.replace('Login')}>
            <Text style={styles.logoutText}>Quitter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00b894" />
        }
      >
        {!showForm && !scanning && (
          <View style={styles.todayCard}>
            <View>
              <Text style={styles.todayLabel}>Palettes scannées aujourd'hui</Text>
              <Text style={styles.todayCount}>{todayCount} palette{todayCount > 1 ? 's' : ''}</Text>
              <Text style={styles.todayHint}>↓ Tirez pour rafraîchir</Text>
            </View>
            <Text style={{ fontSize: 48 }}>📦</Text>
          </View>
        )}

        {lastAdded && !showForm && (
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✅</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.successTitle}>Palette ajoutée !</Text>
              <Text style={styles.successInfo}>{lastAdded.matiere} — {lastAdded.quantite} unités</Text>
              {lastAdded.code && <Text style={styles.successCode}>Code : {lastAdded.code}</Text>}
            </View>
            <TouchableOpacity onPress={() => setLastAdded(null)}>
              <Text style={{ color: '#888', fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {scanning && (
          <View style={styles.scannerBox}>
            <CameraView
              style={styles.camera}
              barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'ean13', 'ean8'] }}
              onBarcodeScanned={handleBarCodeScanned}
            />
            <View style={styles.overlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanHint}>Pointez vers le code barre de la palette</Text>
            </View>
            <TouchableOpacity style={styles.cancelBtn}
              onPress={() => { setScanning(false); scanned.current = false; }}>
              <Text style={styles.cancelText}>✕ Annuler</Text>
            </TouchableOpacity>
          </View>
        )}

        {!scanning && !showForm && (
          <View style={styles.scanPrompt}>
            <Text style={styles.scanEmoji}>📷</Text>
            <Text style={styles.scanTitle}>Scanner une palette</Text>
            <Text style={styles.scanDesc}>
              Scannez le code barre de la palette pour enregistrer son entrée
            </Text>
            <TouchableOpacity style={styles.scanBtn}
              onPress={() => { setScanning(true); scanned.current = false; setLastAdded(null); }}>
              <Text style={styles.scanBtnText}>📸 Démarrer le scan</Text>
            </TouchableOpacity>
          </View>
        )}

        {showForm && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formIcon}>📋</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.formTitle}>Informations palette</Text>
                <Text style={styles.formSub}>
                  {scannedCode ? `Code : ${scannedCode}` : 'Saisie manuelle'}
                </Text>
              </View>
            </View>

            {/* Matière */}
            <Text style={styles.label}>Matière *</Text>
            <TouchableOpacity
              style={styles.matiereSelector}
              onPress={() => setShowMatierePicker(true)}>
              <View style={styles.matiereSelectorLeft}>
                <Text style={styles.matiereSelectorIcon}>📦</Text>
                <Text style={[
                  styles.matiereSelectorText,
                  !selectedMatiere && { color: '#aaa' }
                ]}>
                  {selectedMatiere ? selectedMatiere.nom : 'Sélectionner une matière'}
                </Text>
              </View>
              <Text style={styles.matiereSelectorArrow}>▼</Text>
            </TouchableOpacity>

            {/* Quantité */}
            <Text style={styles.label}>Quantité *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 100"
              value={form.quantite}
              onChangeText={v => setForm({ ...form, quantite: v })}
              keyboardType="numeric"
            />

            {/* Fournisseur */}
            <Text style={styles.label}>Fournisseur</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Centrale Danone"
              value={form.fournisseur}
              onChangeText={v => setForm({ ...form, fournisseur: v })}
            />

            {/* Date */}
            <Text style={styles.label}>Date d'entrée</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={form.date_entree}
              onChangeText={v => setForm({ ...form, date_entree: v })}
            />

            <TouchableOpacity
              style={[styles.submitBtn, (!form.matiere_id || !form.quantite) && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={loading || !form.matiere_id || !form.quantite}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitBtnText}>✅ Confirmer l'entrée</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelFormBtn} onPress={resetScan}>
              <Text style={styles.cancelFormText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: { backgroundColor: '#0f2027', padding: 20, paddingTop: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: '#ffffff80', fontSize: 13, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { backgroundColor: '#ffffff20', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  iconBtnText: { fontSize: 18 },
  logoutBtn: { backgroundColor: '#ffffff20', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  content: { padding: 16, paddingBottom: 40 },
  todayCard: { backgroundColor: '#0f2027', borderRadius: 16, padding: 20, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  todayLabel: { color: '#ffffff80', fontSize: 13, marginBottom: 4 },
  todayCount: { color: '#00b894', fontSize: 28, fontWeight: 'bold' },
  todayHint: { color: '#ffffff40', fontSize: 11, marginTop: 4 },
  successCard: { backgroundColor: '#e8f8f5', borderRadius: 14, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 4, borderLeftColor: '#00b894' },
  successIcon: { fontSize: 30 },
  successTitle: { fontSize: 16, fontWeight: 'bold', color: '#00b894' },
  successInfo: { fontSize: 14, color: '#0f2027', marginTop: 2 },
  successCode: { fontSize: 12, color: '#888', marginTop: 2 },
  scanPrompt: { backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  scanEmoji: { fontSize: 64, marginBottom: 16 },
  scanTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f2027', marginBottom: 8 },
  scanDesc: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  scanBtn: { backgroundColor: '#00b894', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  scanBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  scannerBox: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, height: 380 },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 260, height: 160, borderWidth: 3, borderColor: '#00b894', borderRadius: 12, backgroundColor: 'transparent' },
  scanHint: { color: '#fff', marginTop: 16, fontSize: 13, backgroundColor: '#00000080', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, textAlign: 'center' },
  cancelBtn: { position: 'absolute', bottom: 16, alignSelf: 'center', backgroundColor: '#e74c3c', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  cancelText: { color: '#fff', fontWeight: 'bold' },
  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 3, borderTopWidth: 4, borderTopColor: '#00b894' },
  formHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  formIcon: { fontSize: 36 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f2027' },
  formSub: { fontSize: 13, color: '#888', marginTop: 2 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 15, backgroundColor: '#f8f9fa' },
  matiereSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, marginBottom: 14, backgroundColor: '#f8f9fa' },
  matiereSelectorLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  matiereSelectorIcon: { fontSize: 20 },
  matiereSelectorText: { fontSize: 15, color: '#0f2027', fontWeight: '500' },
  matiereSelectorArrow: { color: '#00b894', fontSize: 14, fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#00b894', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 10 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelFormBtn: { alignItems: 'center', padding: 12 },
  cancelFormText: { color: '#888', fontSize: 15 },
  btn: { backgroundColor: '#00b894', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#00000060', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#0f2027' },
  modalClose: { fontSize: 20, color: '#888' },
  matiereItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  matiereItemSelected: { backgroundColor: '#e8f8f5' },
  matiereItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  matiereItemIcon: { fontSize: 24 },
  matiereItemNom: { fontSize: 16, fontWeight: '600', color: '#0f2027' },
  matiereItemDesc: { fontSize: 12, color: '#888', marginTop: 2 },
});