import express from "express";
import {createConnection} from "typeorm";
import "dotenv/config"
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/pathRoutes";
import "./config/passport";
import cookieSession from "cookie-session";
import passport from "passport";


const app = express();

app.set("view engine", "ejs");

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: ["test"],
  })
);

app.use(passport.initialize());
app.use(passport.session());



app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

async function run() {
    const connection = await createConnection();
    await connection.synchronize(true);

    console.log('db연결');
}
run().then().catch((e) => console.log(e));

app.listen(8000, () => {
  console.log("App listening on port: " + 8000);
});

