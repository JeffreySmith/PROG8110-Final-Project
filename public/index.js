import 'https://cdnjs.cloudflare.com/ajax/libs/framework7/5.7.10/js/framework7.bundle.js';
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-app.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-database.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.1/firebase-auth.min.js";
import  {config} from "./firebase.js";
import {app} from "./F7App.js";
import "./football.js";

firebase.initializeApp(config);
const $$ = Dom7;



firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        app.tab.show("#tab2", true);
        
    } else {
        app.tab.show("#tab1", true);
        
        console.log("logged out");
    }
});

$$("#loginForm").on("submit", (evt) => {
    evt.preventDefault();
    var formData = app.form.convertToData('#loginForm');
    firebase.auth().signInWithEmailAndPassword(formData.username, formData.password).then(
        () => {
            // could save extra info in a profile here I think.
            app.loginScreen.close(".loginYes", true);
            location.reload(true);
        }
    ).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        $$("#signInError").html(errorCode + " error " + errorMessage)
        console.log("loginform"+errorCode + " error " + errorMessage);
        // ...
    });

});
/* This is needed for us to use google auth*/
export function signIn(){
    let provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    //We're using the popup version, rather than the redirect version
    firebase.auth().signInWithPopup(provider)
    .then((result)=>{
        var credential = result.credential;
        var token = credential.accessToken;
        var user = result.user;
        
    }).then(()=>{
        //We have to close both of these. I forgot to add both, so when you signed up with google (rather than login), the screen would stay open 
        //even if you had successfully signed up using your google account
        app.loginScreen.close(".loginYes",true);
        app.loginScreen.close(".signupYes", true);
        $$("#signUpError").html = "";
        
        
    }).catch((error)=>{
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        $$("#signUpError").html(errorCode + " error " + errorMessage)
        console.log(`Error code: ${errorCode}`);
        console.log(`Error Message: ${errorMessage}`);
        console.log(`Email: ${email}`);
        console.log(`Credential Type: ${credential}`);
    })
}

//This is part of the provided code
$$("#signUpForm").on("submit", (evt) => {
    evt.preventDefault();
    var formData = app.form.convertToData('#signUpForm');
    firebase.auth().createUserWithEmailAndPassword(formData.username, formData.password).then(
        () => {
            // could save extra info in a profile here I think.
            app.loginScreen.close(".signupYes", true);
        }
    ).catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        $$("#signUpError").html(errorCode + " error " + errorMessage)
        console.log("signup form"+errorCode + " error " + errorMessage);
        // ...
    });

});
//This is also part of the original code
$$("#logout").on("click", () => {
    //Reset the totalCost so we don't show the value after the user logs out
    document.getElementById("totalCost").innerHTML = "";
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log("Sucessfully signed out");
        //Make sure to clear the list of items on logout
        $$("#footballList").html("");

    }).catch((e) => {
        console.log(`Error logging out: ${e}`)
        
    });
});
