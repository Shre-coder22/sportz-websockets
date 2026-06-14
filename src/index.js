import express from "express";
import { matchRouter } from "./routes/matches,js";

const app = express();
const PORT = 8000;

app.use(express.json());

app.get('/', (req, res) => {
    console.log('Hello from server!');
});

app.use('/matches', matchRouter);

app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
});
