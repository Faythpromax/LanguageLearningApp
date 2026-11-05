import { StyleSheet } from 'react-native';
import { color } from './constants/theme';

// Style dùng chung cho mọi màn; style riêng để trong file màn đó
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  container: { flex: 1, padding: 20, backgroundColor: color.bg },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    color: color.text,
  },
  muted: { fontSize: 14, color: color.textMuted },
  input: {
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
    color: color.text,
  },
  button: {
    backgroundColor: color.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonAccent: { backgroundColor: color.accent },
  buttonText: { color: color.white, fontSize: 16, fontWeight: '600' },
  link: {
    color: color.accent,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex1: { flex: 1 },
  tabIcon: { fontSize: 20 },
  card: {
    backgroundColor: color.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: color.border,
  },
});
