import express from "express";
import champion from "./routes/Champion";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors())

app.get("/ping", (_, res: express.Response) => {
    res.send("pong");
})
// champion router
app.use('/champion', champion);


const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
    console.log("Server running at port " + port);
})