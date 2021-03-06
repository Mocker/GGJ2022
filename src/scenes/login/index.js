import Phaser from 'phaser';
import { FireBaseSingleton, UserModel, clearButtonEvents } from '../../utils';

class LoginScene extends Phaser.Scene
{
    constructor ()
    {
        super("LoginScene");
        this.fireBaseAppHelper = FireBaseSingleton.getInstance();
    }

    preload ()
    {
        this.load.html('loginform', 'public/login_form.html');
    }

    create ()
    {   
        clearButtonEvents(this.game);
        const validateEmail = (inputText) =>
        {
            var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if(inputText.value.match(mailformat))
            {
                return true;
            }
            else
            {
             return false;
            }
        }

        var textLabel = document.createElement('textLabel');

        textLabel.style.color = "white";
        textLabel.style.fontFamily = "beryl-digivice"
        textLabel.style.fontSize = "3vw";

        const switchMessage = (message, fontSize) => {
            textLabel.style.fontSize = fontSize;
            textLabel.innerText = message;
        }    
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.add.dom(screenCenterX - 190, screenCenterY - 180, textLabel);

        var element = this.add.dom(screenCenterX, screenCenterY).createFromCache('loginform');
    
        element.setPerspective(800);

        const loginButton = document.getElementById( 'signInButton' );

        loginButton.onclick = (event) => {
            var inputUsername = document.getElementById('username');
            var inputPassword = document.getElementById('password');
    
            //  Have they entered anything?
            if (inputUsername.value !== '' && inputPassword.value !== '')
            {

                const successCallback = (userCredential) => {
                    // Signed in
                    const user = userCredential.user;
                    const { emailVerified } = user;
                    if(!emailVerified) {
                        switchMessage('Please verify the email sent', "1.3vw");
                    }
                    else {
                        const userModel = UserModel.getInstance();
                        userModel.setUser(user);
                    }
                };

                const errorCallback = (error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;

                    console.log(errorCode);
                    console.log(errorMessage);
                    
                    if(errorCode === "auth/wrong-password"){
                        switchMessage('Wrong password', "1.3vw");
                    }
                };
                this.waitingForSignIn = true;
                UserModel.getInstance().userCallback = this.onAuthChange.bind(this);
                this.fireBaseAppHelper.signIn(inputUsername.value, inputPassword.value, errorCallback, successCallback);
            }
        }

        const registerButton = document.getElementById( 'registerButton' );

        registerButton.onclick = (event) => {
            
            const inputUsername =  document.getElementById('username');
            const inputPassword =  document.getElementById('password');
    
            //  Have they entered anything?
            if (inputUsername.value !== '' && inputPassword.value !== '' && validateEmail(inputUsername))
            {
                const successCallback = (userCredential) => {
                    // Signed in
                    const user = userCredential.user;

                    const { emailVerified } = user;
                    
                    if(!emailVerified) {
                        switchMessage('Email verification sent, please verify and sign in', "1.3vw");
                    }

                    this.fireBaseAppHelper.sendEmailVerification(user);
                }

                const errorCallback = (error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    
                    if(errorCode === "auth/email-already-in-use"){
                        switchMessage('Email already in use', "1.3vw");
                    }
                    else if(errorCode === "auth/weak-password"){
                        switchMessage('Password should be at least 6 characters', "1.3vw");
                    }
                }

                this.fireBaseAppHelper.signUp(inputUsername.value, inputPassword.value, errorCallback, successCallback);
            }
            else {
                switchMessage('Enter valid email and password', "1.3vw");
            }

        }

        const startDemoLinkButton = document.getElementById( 'start-demo' );
        startDemoLinkButton.onclick = (event) => {
            const userModel = UserModel.getInstance();
            userModel.setDemoUser();
            this.waitingForSignIn = true;
            this.onAuthChange(userModel);
        };

        const forgotPasswordLinkButton = document.getElementById( 'forgot-password' );
        
        forgotPasswordLinkButton.onclick = (event) => {
            var inputUsername =  document.getElementById('username');

            if (inputUsername.value === '' || !validateEmail(inputUsername)) {
                return;
            }

            const successCallback = () => {
                switchMessage("Link to reset your pasword has been sent", "1.3vw");
            };

            const errorCallback = (error) => {
                const errorCode = error.code;
                const errorMessage = error.message;

                if(errorCode === "auth/user-not-found") {
                    switchMessage("User not found", "1.3vw");
                }
                else {
                    switchMessage("Error sending reset link", "1.3vw");
                }
                
            };

            

            this.fireBaseAppHelper.forgotPassword(inputUsername.value, errorCallback, successCallback);
        }

    }
    
    onAuthChange (userModel) {
        if (!this.waitingForSignIn) return;
        this.waitingForSignIn = false;
        this.scene.start('SelectMonsterScene');
        this.scene.stop("LoginScene");
    }

    update () {

    }


    end () {

    }

}


export { LoginScene };
