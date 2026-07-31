require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

// Initialize Firebase Admin
// IMPORTANT: You must download your Service Account Key from Firebase Console
// (Project Settings > Service Accounts > Generate new private key)
// and save it as "serviceAccountKey.json" in this server directory!
let db = null;
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin Initialized Successfully.");
  db = admin.firestore();
} catch (error) {
  console.warn("⚠️ WARNING: serviceAccountKey.json not found or invalid.");
  console.warn("Firebase Admin SDK is running without credentials. Custom tokens will fail.");
}

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' })); // Allow Vite frontend

// Configuration for WebAuthn
const rpName = 'PasswordShield';
const rpID = 'localhost'; // Should match your frontend domain in production
const origin = `http://${rpID}:5173`;

// In-memory store for current challenges and credentials (Fallback)
const currentChallenges = {}; 
const mockCredentials = {}; 

/**
 * 1. Generate Registration Options (Sign Up)
 */
app.post('/api/generate-registration-options', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  // In a real app, look up the user by email in Firebase Auth.
  // We'll use the email as the internal user ID for WebAuthn mapping.
  const userID = email; 

  // Get existing credentials for this user from Firestore to prevent re-registering the same authenticator
  let userAuthenticators = [];
  if (db) {
    const snapshot = await db.collection('webauthn_credentials').doc(userID).get();
    if (snapshot.exists) {
      userAuthenticators = snapshot.data().authenticators || [];
    }
  } else if (mockCredentials[userID]) {
    userAuthenticators = mockCredentials[userID];
  }

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: new Uint8Array(Buffer.from(userID)), // SimpleWebAuthn v10+ requires Uint8Array
    userName: email,
    attestationType: 'none',
    excludeCredentials: userAuthenticators.map(auth => ({
      id: auth.credentialID,
      type: 'public-key',
      transports: auth.transports,
    })),
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'preferred',
    },
  });

  // Save challenge to verify later
  currentChallenges[userID] = options.challenge;

  res.json(options);
});

/**
 * 2. Verify Registration Response
 */
app.post('/api/verify-registration', async (req, res) => {
  const { email, data } = req.body;
  const expectedChallenge = currentChallenges[email];

  if (!expectedChallenge) {
    return res.status(400).json({ error: 'Challenge not found or expired' });
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: data,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }

  const { verified, registrationInfo } = verification;

  if (verified && registrationInfo) {
    const { credential } = registrationInfo;

    const newAuthenticator = {
      credentialID: Buffer.from(credential.id).toString('base64url'),
      credentialPublicKey: Buffer.from(credential.publicKey).toString('base64url'),
      counter: credential.counter,
      transports: data.response.transports || [],
    };

    let customToken = 'MOCK_TOKEN';

    if (db) {
      // Save the new credential to Firestore
      const userRef = db.collection('webauthn_credentials').doc(email);
      const doc = await userRef.get();
      
      if (doc.exists) {
        const existing = doc.data().authenticators || [];
        await userRef.update({ authenticators: [...existing, newAuthenticator] });
      } else {
        await userRef.set({ authenticators: [newAuthenticator] });
      }

      // Create Firebase User if they don't exist
      try {
        await admin.auth().getUserByEmail(email);
      } catch (e) {
        if (e.code === 'auth/user-not-found') {
          await admin.auth().createUser({ email });
        }
      }

      // Generate Custom Token
      const userRecord = await admin.auth().getUserByEmail(email);
      customToken = await admin.auth().createCustomToken(userRecord.uid);
    } else {
       // In-memory fallback
       mockCredentials[email] = mockCredentials[email] ? [...mockCredentials[email], newAuthenticator] : [newAuthenticator];
    }

    delete currentChallenges[email];
    return res.json({ verified: true, customToken });
  }

  res.status(400).json({ verified: false });
});

/**
 * 3. Generate Authentication Options (Log In)
 */
app.post('/api/generate-authentication-options', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  let userAuthenticators = [];
  if (db) {
    const snapshot = await db.collection('webauthn_credentials').doc(email).get();
    if (snapshot.exists) {
      userAuthenticators = snapshot.data().authenticators || [];
    }
  } else if (mockCredentials[email]) {
    userAuthenticators = mockCredentials[email];
  }

  if (userAuthenticators.length === 0) {
    return res.status(404).json({ error: 'No passkeys found for this user.' });
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: userAuthenticators.map(auth => ({
      id: Buffer.from(auth.credentialID, 'base64url'),
      type: 'public-key',
      transports: auth.transports,
    })),
    userVerification: 'preferred',
  });

  currentChallenges[email] = options.challenge;
  res.json(options);
});

/**
 * 4. Verify Authentication Response
 */
app.post('/api/verify-authentication', async (req, res) => {
  const { email, data } = req.body;
  const expectedChallenge = currentChallenges[email];

  if (!expectedChallenge) {
    return res.status(400).json({ error: 'Challenge not found' });
  }

  let userAuthenticators = [];
  if (db) {
    const snapshot = await db.collection('webauthn_credentials').doc(email).get();
    if (snapshot.exists) {
      userAuthenticators = snapshot.data().authenticators || [];
    }
  } else if (mockCredentials[email]) {
    userAuthenticators = mockCredentials[email];
  }

  const authenticator = userAuthenticators.find(
    (auth) => auth.credentialID === data.id
  );

  if (!authenticator) {
    return res.status(400).json({ error: 'Authenticator is not registered with this site' });
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: data,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: Buffer.from(authenticator.credentialID, 'base64url'),
        credentialPublicKey: Buffer.from(authenticator.credentialPublicKey, 'base64url'),
        counter: authenticator.counter,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }

  const { verified, authenticationInfo } = verification;

  if (verified) {
    let customToken = 'MOCK_TOKEN';

    if (db) {
      // Update counter in DB
      const updatedAuthenticators = userAuthenticators.map(auth => {
        if (auth.credentialID === authenticator.credentialID) {
          return { ...auth, counter: authenticationInfo.newCounter };
        }
        return auth;
      });
      await db.collection('webauthn_credentials').doc(email).update({ authenticators: updatedAuthenticators });

      // Mint Custom Token
      const userRecord = await admin.auth().getUserByEmail(email);
      customToken = await admin.auth().createCustomToken(userRecord.uid);
    } else {
      // In memory update counter
      mockCredentials[email] = userAuthenticators.map(auth => {
        if (auth.credentialID === authenticator.credentialID) {
          return { ...auth, counter: authenticationInfo.newCounter };
        }
        return auth;
      });
    }

    delete currentChallenges[email];
    return res.json({ verified: true, customToken });
  }

  res.status(400).json({ verified: false });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Passkey Backend Server running on http://localhost:${PORT}`);
});
