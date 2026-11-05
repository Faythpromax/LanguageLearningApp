module.exports = {
  preset: '@react-native/jest-preset',
  // backend có test riêng (node --test)
  testPathIgnorePatterns: ['/node_modules/', '/backend/'],
  // các thư viện RN/Navigation phát hành dạng ESM nên phải cho Babel biên dịch
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-async-storage|@react-navigation|react-redux|@reduxjs|immer|reselect|redux)/)',
  ],
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$':
      '@react-native-async-storage/async-storage/jest',
  },
};
