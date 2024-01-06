const express = require('express');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const DiscordStrategy = require('passport-discord').Strategy;
const app = express();
const path = require('path')

// Configure Express.js
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');  
app.use(session({
  secret: 'your_secret_key', 
  resave: false,
  saveUninitialized: true,
}));

// Configure Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Discord Strategy for Passport.js
passport.use(new DiscordStrategy({
    clientID: '', // Replace with your Discord client ID
    clientSecret: '', // Replace with your Discord client secret
    callbackURL: 'http://localhost:3000/auth/discord/callback',
    scope: ['identify', 'email', 'guilds'], // Define the scope
},
function(accessToken, refreshToken, profile, done) {
    // Include guilds in the user object
    const user = {
        id: profile.id,
        username: profile.username,
        avatar: profile.avatar,
        email: profile.email,
        guilds: profile.guilds // Add this line to include guilds
    };
    done(null, user);
}));

// Serialize and Deserialize User
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Define routes
app.get('/', (req, res) => {
    res.send('Home Page');
});

app.get('/login', (req, res) => {
    res.redirect('/auth/discord');
});

// Discord Authentication Routes
app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback',
    passport.authenticate('discord', {
        failureRedirect: '/login'
    }),
    function(req, res) {
        // Successful authentication
        res.redirect('/dashboard');
    }
);

app.get('/dashboard', (req, res) => {
    if (req.isAuthenticated()) {
        // Get user information from session
        const email = req.session.passport.user.email;
        const avatar = req.session.passport.user.avatar;
        const guilds = req.session.passport.user.guilds; // Get guilds from session

        // Pass data including guilds to the view template
        res.render('dashboard', { email, avatar, guilds });
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
