import { StyleSheet } from 'react-native';
import { color } from './constants/theme';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.white },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 16, color: color.black },
  input: {
    borderWidth: 1,
    borderColor: color.gray300,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: color.black,
  },
  button: {
    backgroundColor: color.blue,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: color.white, fontSize: 16, fontWeight: '600' },
  link: { color: color.blue, textAlign: 'center', marginTop: 16, fontSize: 15 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  flex1: { flex: 1 },
  addButton: {
    backgroundColor: color.blue,
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: color.gray200,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    backgroundColor: color.gray100,
  },
  wordText: { fontSize: 18, fontWeight: '600', color: color.black },
  meaningText: { fontSize: 15, color: color.gray900, marginTop: 4 },
  empty: { textAlign: 'center', color: color.gray500, marginTop: 40 },
});
