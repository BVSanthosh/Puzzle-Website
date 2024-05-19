export default async function handler(req, res) {
    console.log(`Start TokenTrade`)
    const body = req.body;
    console.log(body);
    const data = await fetch(body.url, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({'client_id': body.client_id, client_secret: body.client_secret, access_code: body.access_code})}).then(r => {
        if (r.ok) return r.json();
        else res.status(r.status).json();
    });
    console.log(data);
    if (!data) return;
    return res.status(200).json(data);
}