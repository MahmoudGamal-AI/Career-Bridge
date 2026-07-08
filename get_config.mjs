import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const serviceAccount = JSON.parse(fs.readFileSync('./faalkher-firebase-adminsdk-fbsvc-74eef5cbd0.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function getConfig() {
  try {
    const webApps = await admin.projectManagement().listWebApps();
    if (webApps.length === 0) {
      console.log('No web apps found in this project. Please create a Web App in the Firebase Console and run this script again.');
      return;
    }
    const app = webApps[0];
    const config = await app.getConfig();
    
    // Auto-generate firebase.ts
    const firebaseTsContent = `import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = ${JSON.stringify(config, null, 2)};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
`;
    fs.mkdirSync('./src/lib', { recursive: true });
    fs.writeFileSync('./src/lib/firebase.ts', firebaseTsContent);
    console.log('Successfully created src/lib/firebase.ts');
  } catch (error) {
    console.error('Error fetching config:', error);
  }
}

getConfig();
