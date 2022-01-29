import { getAuth, createUserWithEmailAndPassword, 
    sendEmailVerification, 
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    onAuthStateChanged    
} from 'firebase/auth';
import { UserModel } from '../../utils';

export class FireBaseSingleton {

    constructor(game) {
        if (!FireBaseSingleton._instance) {
            const auth = getAuth();
            onAuthStateChanged(auth, (user) => {
                if (user && user.emailVerified) {
                    const userModel = UserModel.getInstance();
                    userModel.setUser(user)
                    .then((userModel) => {
                        console.log("user monsters", userModel.monsters);
                        game.scene.remove("LoginScene");
                        if(userModel.monsters.length < 1) {
                            game.scene.start("MonsterNameScene");
                        } else {
                            //TODO:: pick monster scene
                            game.scene.start("GameScene");
                        }
                    });
                    
                }
            })

            FireBaseSingleton._instance = this;
        }
        return FireBaseSingleton._instance;
    }

    static getInstance() {
        return this._instance;
    }

    signIn(email, password, errorCallback, successCallback) {
        const auth = getAuth();

        setPersistence(auth, browserLocalPersistence)
        .then(() => {
            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                successCallback(userCredential);
            })
            .catch((error) => {
                errorCallback(error)
            });
        })
        .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(error);
        });


    }

    signUp(email, password, errorCallback, successCallback) {
        const auth = getAuth();
                
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            successCallback(userCredential);
        })
        .catch((error) => {
            errorCallback(error);
        });
    }

    sendEmailVerification(user) { 
        sendEmailVerification(user).then((sent) => {
            
        }).catch((error) => {
            
        });;
    }

    forgotPassword (email, errorCallback, successCallback) { 
        const auth = getAuth();
        sendPasswordResetEmail(auth, email).then(() => {
            successCallback();
        })
        .catch((error) => {
            console.log(error);
            const errorCode = error.code;
            const errorMessage = error.message;
            errorCallback(error);
        });
    }
}


