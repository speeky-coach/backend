import axios from 'axios';
import { firebaseAuth } from './FirebaseApp';

type IDTokenResponse = {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
};

/**
 * https://firebase.google.com/docs/reference/rest/auth/#section-verify-custom-token
 */
async function generadeToken(uid: string, claims?: object | undefined): Promise<string> {
  const customToken = await firebaseAuth.createCustomToken(uid, claims);

  const response = await axios({
    url: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env
      .FIREBASE_TEST_API_KEY!}`,
    method: 'POST',
    data: {
      token: customToken,
      returnSecureToken: true,
    },
  });

  return (response.data as IDTokenResponse).idToken;
}

export default generadeToken;
