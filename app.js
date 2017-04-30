var builder = require('botbuilder');
var restify = require('restify');

var moments = {};

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3979, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: 'd2b14853-9126-4b2b-bf9c-dc81a41d9387',
    appPassword: 'WXSughapaNbQT0gR1mcTESb'
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

var intents = new builder.IntentDialog();
bot.dialog('/', intents);

var firstStart = false;

intents.onDefault([
    function (session, args, next) {
        if (!session.userData.name) {
            firstStart = true;
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        if(firstStart) {
            firstStart = false;
            session.beginDialog('/intro');
        }
        else {
            session.beginDialog('/theIntro');
        }

        session.beginDialog('/newMoment');
    }
]);

bot.dialog('/intro', [
    function (session) {
        var responseText = 'Hi ' + session.userData.name + ', ';
        responseText += 'I am Joyful Carron I want to remind you what amazing things happen in your life!';

        session.send(responseText);
        session.endDialog();
    }
]);

bot.dialog('/theIntro', [
    function (session) {
        session.send('Hi ' + session.userData.name);
    }
]);

bot.dialog('/newMoment', [
    function (session) {
        builder.Prompts.text(session, 'Tell me what has brightened your day!');
    },
    function (session, results) {
        var day = new Date(Date.now()).getDate();
        if(moments[day] == undefined) {
            moments[day] = [];
        }
        moments[day].push(results.response);
        // moments.push(day);
        // moments[day].push({
        //     'date': Date.now(),
        //     'message': results.response
        // });

        session.send('Thanks, I added it! In the evening you choose your best moment of the day! Enjoy your day!');
        session.endDialog();
    }
]);

//=========================================================
// INTENTS Dialogs
//=========================================================

intents.matches(/^change name/i, [
    function (session) {
        session.beginDialog('/profile');
    },
    function (session, results) {
        session.send('Ok... Changed your name to %s', session.userData.name);
    }
]);

// intents.matches(/^/i, [
//     function(session) {

//     }
// ]);

intents.matches(/^what are my .* today/i, [
    function (session) {
        session.send('Wow, look what I’ve found!');

        var todayMoments = moments[new Date(Date.now()).getDate()];
        for(var i = 0; i < todayMoments.length; i++) {
            session.send(todayMoments[i]);
        }

        session.send('I wonder if you will rate this as your highlight of your week! Have a good night!');
    },
    function (session, results) {
        session.send('Ok... Changed your name to %s', session.userData.name);
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);
