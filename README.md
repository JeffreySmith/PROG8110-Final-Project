You can view this application running live on [firebase](https://learnfirebase-c91d2.web.app)

This is an application for tracking your football (soccer) merch. You can enter in things you'd like to buy, then mark things you've bought. You can also mark something as purchased, as well as delete an item.

Items are separated by users so that users can only see their own items, rather than all items in the database.


This is a fork of the following:
# [loginDemo](https://github.com/rhildred/loginDemo)

To run this:
```

npx http-server

```

The index.html contains 2 login-screen classes to match the 2 buttons.

```

<div class="login-screen signupYes">
    <div class="view">
        <div class="page">
            <div class="page-content login-screen-content">


```

button:

```

<a href="#" class="button login-screen-open" data-login-screen=".signupYes">Sign Up</a>

```

and

```

<div class="login-screen loginYes">
    <div class="view">
        <div class="page">
            <div class="page-content login-screen-content">


```

to go with the button:

```

<a href="#" class="button button-active login-screen-open" data-login-screen=".loginYes">Sign In</a>


```

Using Dom7 we capture the click event on the sign in button:

```

$$("#signUpButton").on("click", () => {
    var formData = app.form.convertToData('#signUpForm');
    //alert("clicked Sign Up: " + JSON.stringify(formData));
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
        console.log(errorCode + " error " + errorMessage);
        // ...
    });

});


```

There is also a database.rules.json file that you can plug in to your firebase console. In your firebase console you will also need to set up the email and password provider.
