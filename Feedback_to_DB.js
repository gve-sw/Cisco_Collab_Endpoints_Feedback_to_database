/*
Copyright (c) 2020 Cisco and/or its affiliates.

This software is licensed to you under the terms of the Cisco Sample
Code License, Version 1.1 (the "License"). You may obtain a copy of the
License at

               https://developer.cisco.com/docs/licenses

All use of the material herein must be in accordance with the terms of
the License. All rights not expressly granted by the License are
reserved. Unless required by applicable law or agreed to separately in
writing, software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied.
*/

const xapi = require('xapi');

// Connection details to SQL-DB server
const SQLDBServerHost='10.0.0.10'; // Address of server running Flask app to store to DB
const SQLDBServerPort='5000';
const theURLBase='http://'+SQLDBServerHost+":"+SQLDBServerPort;

xapi.config.set('HttpClient AllowHTTP',"True");
xapi.config.set('HttpClient AllowInsecureHTTPS',"True");

xapi.command("HttpClient Allow Hostname Clear");
xapi.command("HttpClient Allow Hostname Add", {Expression: SQLDBServerHost});

var system_info="";
var call_info="";
var rating_score=0;
var rating_desc="";
var feedback_time="";
var feedback_notes="";

// Get current time (two digits each) and timezone
// Example: 19-07-2020 18:06:37 (GMT+4)
function getTime() {
  var today = new Date();
  var date =("0" + today.getDate()).slice(-2)+"-"+ ("0" + (today.getMonth() + 1)).slice(-2) + "-" + today.getFullYear();
  var time = ("0" + today.getHours()).slice(-2) + ":" + ("0" + today.getMinutes()).slice(-2) + ":" + ("0" + today.getSeconds()).slice(-2);
  var timezone = (today.getTimezoneOffset() / -60);
  var dateTime = date + ' ' + time + ' (GMT' + (timezone<=0?"":"+") + timezone + ")";
  return dateTime;
}

// Sending HTTP Post to insert the feedback to SQL DB
function sendHttpPost() {

  // Getting SystemInfo before anything
  xapi.status.get('UserInterface ContactInfo Name').then(value => {
    system_info = value;
  });

  xapi.status.get('SystemUnit ProductPlatform').then(value => {
    system_info += " (" + value + ")";
    console.log("system_info: " + system_info);
    feedback_time=getTime();


    var theNewJSON = {
      system_info:system_info
      , call_info:call_info
      , rating_score:rating_score
      , rating_desc:rating_desc
      , feedback_time:feedback_time
      , feedback_notes:feedback_notes
    };

    theNewJSON = JSON.stringify(theNewJSON);
    try {
        xapi.command('HttpClient Post',
            { AllowInsecureHTTPS: "True",
              Header:["Content-Type: application/json; charset=UTF-8"],
              ResultBody: 'PlainText',
              Url: theURLBase+"/addfeedback"
            },
            theNewJSON
            ).then((resultado)=>{

                console.log("HTTP POST content: ", theNewJSON);
                console.log("HTTP POST done at: ", getTime());
                console.log("Result of HTTP Post: ",resultado)

              });
      } catch (err) {
        console.error(`Error received from HTTP POST: ${JSON.stringify(err)}`);
      }
  });

}

// Event: OutgoingCallIndication
xapi.event.on('OutgoingCallIndication', (outgoingCall) => {

  console.log("-------------------------------");

  // Collect outgoingCall info
  xapi.status.get('Call', {'CallId': outgoingCall.CallId}).then((call) => {
    console.log("Outgoing call detected: CallId: " + outgoingCall.CallId);
    console.log("RemoteNumber: " + call[0].RemoteNumber); // Getting RemoteNumber Correctly
    console.log("Call started at: " + getTime());
  } );

});

// Event: CallDisconnect
xapi.event.on('CallDisconnect', (disconnectedCall) => {

  console.log("-------------------------------");

  // Collect disconnectedCall info
  xapi.status.get('Call', {'CallId': disconnectedCall.CallId}).then((call) => {
    console.log("Call ended at: " + getTime());
    console.log("Direction: " + call[0].Direction);
    console.log("CallType: " + call[0].CallType);
    console.log("DisplayName: " + call[0].DisplayName);
    console.log("CallbackNumber: " + call[0].CallbackNumber); //UID
    console.log("RemoteNumber: " + call[0].RemoteNumber); //UID
    console.log("Duration: " + call[0].Duration);

    // assigning call info here to a global variable trusting that it will take less time
    // than it takes to display input forms and fill them out by end user
    call_info = call[0].DisplayName + " # " + call[0].CallbackNumber + " (" + call[0].Direction + "-" + call[0].CallType + ")";

  } );

  if(disconnectedCall.Duration > 0){

    // Display prompt asking for feedback as stars (1 - 5)
    xapi.command("UserInterface Message Rating Display", {
          Title: "How was the meeting experience"
        , Text: 'Please rate this call'
        , FeedbackId: 'feedback_rating'
        , Duration: 60 // To remove the prompt if no response for this amount (seconds)
      }).catch((error) => { console.error(error); });
  }
});

// Receiving feedback from user
xapi.event.on('UserInterface Message Rating Response', (feedback_rating_response) => {
  console.log("-------------------------------");
  console.log("Feedback-1 received: id# " + feedback_rating_response.FeedbackId);
  console.log("Feedback-1 received: Rating " + feedback_rating_response.Rating);

  rating_score=feedback_rating_response.Rating;

  // Display prompt asking for feedback as choices
  xapi.command("UserInterface Message Prompt Display", {
                Title: "What impacted your feedback?"
              , Text: 'Please choose the reason'
              , FeedbackId: 'feedback_prompt'
              , 'Option.1':'Call Quality'
              , 'Option.2':'Simplicity'
              , 'Option.3': 'Saved me some time'
              , 'Option.4': 'It wasnt so good'
              , 'Option.5': 'Other'
  }).catch((error) => { console.error(error); });
});

// After all the choices, provide TextInput to get user's name
xapi.event.on('UserInterface Message Prompt Response', (feedback_prompt_response) => {

    console.log("Feedback-2 received: id# " + feedback_prompt_response.FeedbackId);
    console.log("Feedback-2 received: OptionId " + feedback_prompt_response.OptionId);

    rating_desc=feedback_prompt_response.OptionId.toString();

    // Prompting for user information TextInput
    xapi.command("UserInterface Message TextInput Display", {
            Duration: 0
          , FeedbackId: "feedback_textinput"
          , InputType: "SingleLine"
          , KeyboardState: "Open"
          , Placeholder: "Write your details here (Name, Email)"
          , SubmitText: "Next"
          , Text: "Please enter your full Name, and email"
          , Title: "Let us know how to reach you!"
    }).catch((error) => { console.error(error); });

});

// After all the answers, end feedback
xapi.event.on('UserInterface Message TextInput Response', (feedback_textinput_response) => {

    console.log("Feedback-3 received: id# " + feedback_textinput_response.FeedbackId);
    console.log("Feedback-3 received: Text: " + feedback_textinput_response.Text);

    feedback_notes=feedback_textinput_response.Text;

    xapi.command("UserInterface Message Alert Display", {
        Text: 'Thank you for your feedback! Have a wonderful day!'
      , Duration: 10
    }).catch((error) => { console.error(error); });

    // Send collected data to DB
    sendHttpPost();

});
