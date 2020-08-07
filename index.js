const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const app = express();
const account = require("../socialape-b0f80-a17916780cb9.json");
admin.initializeApp({
  credential: admin.credential.cert(account),
  databaseURL: "https://socialape-b0f80.firebaseio.com",
});
const db = admin.firestore();

// Initilize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDMTfsb47JkAEiNs0nImKoHm0PGKPSddDU",
  authDomain: "socialape-b0f80.firebaseapp.com",
  databaseURL: "https://socialape-b0f80.firebaseio.com",
  projectId: "socialape-b0f80",
  storageBucket: "socialape-b0f80.appspot.com",
  messagingSenderId: "137154142914",
  appId: "1:137154142914:web:dbdbaf74b766ea42ad915b",
  measurementId: "G-69GCQXFLJK",
};
const firebase = require("firebase");

firebase.initializeApp(firebaseConfig);

app.get("/screams", (req, res) => {
  db.collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount,
        });
      });
      return res.json(screams);
    })
    .catch((err) => console.error(err));
});

app.post("/scream", (req, res) => {
  const newScream = {
    body: req.body.body,
    userHanle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };
  db.collection("screams")
    .add(newScream)
    .then((doc) => {
      res.send({ message: `document ${doc.id} created sucessfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: `error` });
      console.log(err);
    });
});

// Signup Route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists)
        return res.status(400).json({ handle: "this handle is already taken" });
      return firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password);
    })
    .then((data) => data.user.getIdToken())
    .then((token) => res.status(201).json({ token }))
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });

  // firebase
  //   .auth()
  //   .createUserWithEmailAndPassword(newUser.email, newUser.password)
  //   .then((data) => {
  //     return res
  //       .status(201)
  //       .json({ message: `user ${data.user.uid} signed up successfully` })
  //       .catch((err) => {
  //         console.error(err);
  //         return res.status(500).json({ error: err.code });
  //       });
  //   });
});

exports.api = functions.https.onRequest(app);
