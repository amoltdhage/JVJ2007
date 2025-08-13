import { StyleSheet } from "react-native";

export const GetTogetherFormStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#eef4ff',
    alignItems: 'center',
    paddingBottom: 80,
  },
  inner: {
    width: '90%',
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#002b5c',
    fontWeight: '700',
    marginBottom: 16,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#002b5c',
    borderRadius: 6,
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingLeft: 8,
  },
  icon: {
    color: '#00b4db',
  },
  radioBtn: {
    borderWidth: 2,
    borderColor: '#002b5c',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  radioActive: {
    backgroundColor: '#002b5c',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  radioText: {
    color: '#002b5c',
    fontWeight: '600',
  },
  radioTextActive: {
    color: '#fff', //#00172D',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#002b5c',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  errorText: {
    color: '#ff6961',
    marginTop: 4,
  },
  childRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  successInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  memoryCard: {
    backgroundColor: '#004080',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    alignItems: 'center',
  },
  bigTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#00b4db',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginTop: 6,
  },
  detailBox: {
    marginTop: 12,
    alignItems: 'center',
  },
  detail: {
    color: '#99ccff',
    fontSize: 14,
  },
  regBox: {
    backgroundColor: '#002b5c',
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  regIdLabel: {
    fontWeight: '700',
    color: '#00b4db',
  },
  regId: {
    color: '#fff',
    fontSize: 20,
    marginTop: 4,
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 4,
  },
  pdfButton: {
    backgroundColor: '#00b4db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  pdfButtonText: {
    color: '#00172D',
    fontWeight: '700',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
});