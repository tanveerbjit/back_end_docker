
const passport =require("passport")
const GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
        done(null, user);
});

passport.use(new GoogleStrategy({
        clientID: "260650004827-3lh68k01mfo7fd16k3qtevf02o0588rc.apps.googleusercontent.com",
        clientSecret: "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",
        callbackURL: "http://127.0.0.1:7000/api/v1/auth/google/callback",
        passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {
            return done(null, profile);
    }
));