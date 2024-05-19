import { vote_puzzle } from '/database';

export default async function handler(req, res) {
    const pid = req.query.pid;
    const uid = req.query.uid;
    const value = req.query.value;
    const success = await vote_puzzle(uid, pid, parseInt(value, 10));
    console.log(`UID: ${uid}\nPID: ${pid}\nValue: ${value}`);
    res.status(200).json();
}
