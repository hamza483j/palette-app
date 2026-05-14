import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';

const API = 'http://192.168.11.161:5000/api';

export default function AdminScanScreen({ route, navigation }) {
  const { user, token } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matiere, setMatiere] = useState(null);
  const [palettesToday, setPalettesToday] = useState([]);
  const scanned = useRef(false);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned.current) return;
    scanned.current = true;
    setScanning(false);
    setLoading(true);

    try {
      // Chercher la matière par QR code
      const res = await axios.get(`${API}/matieres/qr/${data}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatiere(res.data);

      // Charger les palettes du jour
      const palRes = await axios.get(`${API}/palettes/matiere/${res.data.id}/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPalettesToday(palRes.data);
    } catch (err) {
      Alert.alert('Erreur', 'QR code non reconnu ou matière introuvable');
      scanned.current = false;
    }
    setLoading(false);
  };

  const resetScan = () => {
    setMatiere(null);
    setPalettesToday([]);
    scanned.current = false;
  };

  const goToOperateur = () => {
    navigation.replace('Scan', { user, token });
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>PaletteApp</Text>
          <Text style={styles.headerSub}>👑 Admin — {user.name}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.operateurBtn} onPress={goToOperateur}>
            <Text style={styles.operateurBtnText}>👷 Mode opérateur</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn}
            onPress={() => navigation.replace('Login')}>
            <Text style={styles.logoutText}>Quitter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Scanner */}
        {scanning && (
          <View style={styles.scannerBox}>
            <CameraView
              style={styles.camera}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleBarCodeScanned}
            />
            <View style={styles.overlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanHint}>Scannez le QR code de la matière</Text>
            </View>
            <TouchableOpacity style={styles.cancelBtn}
              onPress={() => { setScanning(false); scanned.current = false; }}>
              <Text style={styles.cancelText}>✕ Annuler</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#f39c12" />
            <Text style={styles.loadingText}>Chargement des données...</Text>
          </View>
        )}

        {/* Bouton scanner */}
        {!scanning && !matiere && !loading && (
          <View style={styles.scanPrompt}>
            <Text style={styles.scanEmoji}>🏭</Text>
            <Text style={styles.scanTitle}>Scanner une matière</Text>
            <Text style={styles.scanDesc}>
              Scannez le QR code d'une matière affiché sur le mur du poste de travail pour voir ses statistiques en temps réel
            </Text>
            <TouchableOpacity style={[styles.scanBtn, { backgroundColor: '#f39c12' }]}
              onPress={() => { setScanning(true); scanned.current = false; }}>
              <Text style={styles.scanBtnText}>📸 Scanner QR matière</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Résultats matière */}
        {matiere && (
          <>
            {/* Header matière */}
            <View style={styles.matiereHeader}>
              <View style={styles.matiereIconBox}>
                <Text style={styles.matiereIcon}>📦</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.matiereNom}>{matiere.nom}</Text>
                {matiere.description && (
                  <Text style={styles.matiereDesc}>{matiere.description}</Text>
                )}
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{matiere.stock_total || 0}</Text>
                <Text style={styles.statLabel}>Stock total</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: '#f39c12' }]}>{palettesToday.length}</Text>
                <Text style={styles.statLabel}>Aujourd'hui</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: '#6f42c1' }]}>{matiere.total_palettes || 0}</Text>
                <Text style={styles.statLabel}>Total palettes</Text>
              </View>
            </View>

            {/* Palettes aujourd'hui */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                📋 Palettes d'aujourd'hui ({palettesToday.length})
              </Text>
              {palettesToday.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>Aucune palette aujourd'hui</Text>
                </View>
              ) : (
                palettesToday.map(p => (
                  <View key={p.id} style={styles.paletteItem}>
                    <View style={styles.paletteLeft}>
                      <Text style={styles.paletteCode}>{p.code_barre || 'Sans code'}</Text>
                      <Text style={styles.paletteInfo}>
                        {p.fournisseur || 'Fournisseur inconnu'}
                      </Text>
                      <Text style={styles.paletteOperateur}>
                        👷 {p.operateur_nom || '—'}
                      </Text>
                    </View>
                    <View style={styles.paletteRight}>
                      <Text style={styles.paletteQuantite}>{p.quantite}</Text>
                      <Text style={styles.paletteUnite}>unités</Text>
                      <Text style={styles.paletteHeure}>
                        {new Date(p.scan_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Boutons */}
            <TouchableOpacity style={[styles.scanBtn, { backgroundColor: '#f39c12', marginBottom: 10 }]}
              onPress={() => { resetScan(); setScanning(true); }}>
              <Text style={styles.scanBtnText}>🔄 Scanner une autre matière</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.scanBtn, { backgroundColor: '#0f2027' }]}
              onPress={resetScan}>
              <Text style={styles.scanBtnText}>← Retour</Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: { backgroundColor: '#0f2027', padding: 20, paddingTop: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: '#f39c12', fontSize: 13, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  operateurBtn: { backgroundColor: '#00b89430', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  operateurBtnText: { color: '#00b894', fontSize: 12, fontWeight: '600' },
  logoutBtn: { backgroundColor: '#ffffff20', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  content: { padding: 16, paddingBottom: 40 },
  loadingBox: { backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', marginBottom: 16 },
  loadingText: { marginTop: 12, color: '#888', fontSize: 15 },
  scanPrompt: { backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  scanEmoji: { fontSize: 64, marginBottom: 16 },
  scanTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f2027', marginBottom: 8 },
  scanDesc: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  scanBtn: { backgroundColor: '#00b894', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 4 },
  scanBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  scannerBox: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, height: 380 },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 240, height: 240, borderWidth: 3, borderColor: '#f39c12', borderRadius: 16, backgroundColor: 'transparent' },
  scanHint: { color: '#fff', marginTop: 16, fontSize: 13, backgroundColor: '#00000080', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, textAlign: 'center' },
  cancelBtn: { position: 'absolute', bottom: 16, alignSelf: 'center', backgroundColor: '#e74c3c', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  cancelText: { color: '#fff', fontWeight: 'bold' },
  matiereHeader: { backgroundColor: '#0f2027', borderRadius: 16, padding: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 16 },
  matiereIconBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#f39c12', justifyContent: 'center', alignItems: 'center' },
  matiereIcon: { fontSize: 28 },
  matiereNom: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  matiereDesc: { color: '#ffffff80', fontSize: 13, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#00b894' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4, textAlign: 'center' },
  sectionCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#0f2027', marginBottom: 12 },
  emptyBox: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 14 },
  paletteItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  paletteLeft: { flex: 1 },
  paletteCode: { fontSize: 15, fontWeight: 'bold', color: '#0f2027' },
  paletteInfo: { fontSize: 13, color: '#888', marginTop: 2 },
  paletteOperateur: { fontSize: 12, color: '#00b894', marginTop: 2 },
  paletteRight: { alignItems: 'flex-end' },
  paletteQuantite: { fontSize: 22, fontWeight: 'bold', color: '#00b894' },
  paletteUnite: { fontSize: 11, color: '#888' },
  paletteHeure: { fontSize: 12, color: '#6f42c1', marginTop: 4, fontWeight: '600' },
  btn: { backgroundColor: '#00b894', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});