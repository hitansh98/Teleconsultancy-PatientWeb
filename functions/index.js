// const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
var request = require('request');
var rp = require('request-promise');

admin.initializeApp();
var db = admin.database();

exports.handler = ((req, res) => {
    res.set({ 'Access-Control-Allow-Origin': '*' }).sendStatus(200)
})

exports.sendPrescriptionNotif = functions.database
  .ref('/prescriptions/{prescriptionId}/')
  .onCreate((snapshot1, context) => {
    // const oldPlayer = change.before.val();
    // const userId = context.params.userPhone;
    const presId = context.params.prescriptionId;
    const newPrescription = snapshot1.val();
    const userId = newPrescription.patientId;
    // Exit if change is caused by old player moving up in leaderboard
    // if (newPlayer.score <= oldPlayer.score) { return; }
    const databaseRoot = snapshot1.ref.root;
    const snapshot = databaseRoot
      .child(`patients/${userId}/notifications`)
      .once('value')
      .then(async(snapshot) => {
        let number = 0;
        if(snapshot.val()){
            number = Object.keys(snapshot.val()).length;
        }
        var object = {
            id : number + 1,
            notification : `You have a new Prescription for appointment held at ${newPrescription.date} ${newPrescription.time}. Go to My Prescriptions to check it out.`,
            doctorId : newPrescription.doctorId,
            isSeen : false
        };
        var updates = {};
        updates[
            'patients/' + userId + '/notifications/' + (parseInt(number)+1)
        ] = object;
        await db.ref().update(updates);
        return;
      });

  });

exports.paymentOrders = functions.database
  .ref('/payments/{paymentId}')
  .onCreate((snapshot1, context) => {
    // // const oldPlayer = change.before.val();
    // const userId = context.params.userPhone;
    // const griId = context.params.grievanceId;
    // const serviceId = context.params.serviceId;
    const newPayment = snapshot1.val();
    console.log(newPayment);
    console.log(typeof(newPayment.amount));
    // var request = require('request');

    var paymentCaptureOptions = {
        method: 'POST',
        url: `https://rzp_live_GyQtumhJW1szIn:M6ibceiWL371hfHcoWwDMooT@api.razorpay.com/v1/payments/${newPayment.paymentIdRP}/capture`,
        form: {
          amount: parseInt(newPayment.amount) * 100,
          currency: "INR"
        }
    };


    var paymentTransferOptions = {
        method: 'POST',
        url : `https://api.razorpay.com/v1/payments/${newPayment.paymentIdRP}/transfers`,
        auth : {
           user : 'rzp_live_GyQtumhJW1szIn',
           pass : 'M6ibceiWL371hfHcoWwDMooT'
        },
        form : {
          transfers : [
            {
              account: 'acc_F2qzOkLUVJ6g1M',
              amount: parseInt(newPayment.amount) * 100 * 0.90,
              currency: 'INR',
              notes: {
                name: newPayment.dependentInfo.name,
                patientId: newPayment.patientId
              },
              on_hold: 0
            }
          ]
        }
    };

    // (error, response, body) => {
    // console.log('Status:', response.statusCode);
    // console.log('Headers:', JSON.stringify(response.headers));
    // console.log('Response:', body);
    // return(body);
    // }

    rp(paymentCaptureOptions)
    .then((res)=>{
        console.log(res);
        console.log("damn");
        var updates= {};
        updates[
            'payments/'+newPayment.id+'/status'
        ] = "captured";
        updates[
            'payments/'+newPayment.id+'/status2'
        ] = JSON.parse(res);
        db.ref().update(updates);
        return(rp(paymentTransferOptions));
    })
    .then((res) => {
        console.log(res);
        console.log("inside the transfer stuff");
        var updates= {};
        updates[
            'payments/'+newPayment.id+'/transferStatus'
        ] = JSON.parse(res);
        return db.ref().update(updates);
    })
    .catch((err) => {
        console.log("inside error");
        console.log(err);
    })

    // rp(paymentCaptureOptions)
    // .then((res)=>{
    //     console.log(res);
    //     console.log("damn");
    //     console.log(typeof(res));
    //     var updates= {};
    //     updates[
    //         'payments/'+newPayment.id+'/status'
    //     ] = "captured";
    //     updates[
    //         'payments/'+newPayment.id+'/status2'
    //     ] = JSON.parse(res);
    //     return db.ref().update(updates);
    // }).catch((err) => {
    //         console.log("inside error");
    //         console.log(err);
    //     })

    // rp(paymentTransferOptions)
    // .then((res) => {
    //       console.log(res);
    //       console.log("inside the transfer stuff");
    //       var updates= {};
    //       updates[
    //           'payments/'+newPayment.id+'/transferStatus'
    //       ] = res;
    //       return db.ref().update(updates);
    //   })
    //   .catch((err) => {
    //       console.log("inside error");
    //       console.log(err);
    //   })
    
  });