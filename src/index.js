import { express } from "express";

const app = express();
const PORT = 8000;

app.use(express.json());

app.get('/', (req, res) => {
    console.log('Hello from server!');
});

app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
});
