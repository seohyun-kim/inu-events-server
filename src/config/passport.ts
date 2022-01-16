import passport from "passport";
import passportGoogle from "passport-google-oauth20";
import User from "../entity/User";

const GoogleStrategy = passportGoogle.Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URIS,
      // proxy:true,
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = await User.findOne({where: { oauthId: profile.id }});

      // If user doesn't exist creates a new user. (similar to sign up)
      if (!user) {
        const newUser = await User.create({
          oauthId: profile.id,
          nickname: profile.displayName,
          email: profile.emails?.[0].value,
        });
        if (newUser) {
          done(null, newUser);
        }
      } else {
        done(null, user);
      }
    }
  )
);

passport.serializeUser((user:User, done) => {
  done(null, user.oauthId);
});

passport.deserializeUser(async (id, done) => {
    try{
        const user = await User.findOne({
            where: {id},
        });
        if(!user){
            done(new Error('no user'));
        }
        done(null, user);
    }catch (err){
        console.log(err);
        done(err);
    }
  // const user = await User.find({ where: {oauthId:id}}); // <- sql syntax error

});

export default passport;