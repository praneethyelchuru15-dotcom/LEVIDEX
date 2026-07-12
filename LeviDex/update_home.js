const fs = require('fs');
const file = 'c:/Users/prane/.gemini/antigravity/playground/sidereal-oort/ElectroGuide/src/app/home.tsx';
let content = fs.readFileSync(file, 'utf8');

if(!content.includes('expo-updates')) {
  content = content.replace(
    'import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View, SafeAreaView, StatusBar, Image } from \'react-native\';',
    'import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View, SafeAreaView, StatusBar, Image, Alert } from \'react-native\';\nimport * as Updates from \'expo-updates\';'
  );
}

content = content.replace(/  const handleLogout = \(\) => \{\n    signOut\(auth\);\n  \};\n/g, '');
content = content.replace('import { signOut } from \'firebase/auth\';\n', '');

const updateCode = `
  async function checkForUpdates() {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert(
          'Update Available',
          'A new version of the app is available. Would you like to update now?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Update',
              onPress: async () => {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              }
            }
          ]
        );
      }
    } catch (e) {
      console.log('Update check failed or running in dev:', e);
    }
  }

  useEffect(() => {
    checkForUpdates();
  }, []);
`;

if(!content.includes('checkForUpdates()')) {
  content = content.replace(/  const router = useRouter\(\);\n/, '  const router = useRouter();\n' + updateCode);
}

content = content.replace(
  /<TouchableOpacity onPress=\{handleLogout\}[\S\s\r\n]*O\/TouchableOpacity>/,
  '<TouchableOpacity onPress={() => router.push(\'/settings\' as any)} style={styles.profileBtn}>\n            <MaterialCommunityIcons name="cog" size={24} color="#333" />\n          </TouchableOpacity>'
);

fs.writeFileSync(file, content);
console.log('Done');