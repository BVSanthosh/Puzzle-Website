import { useEffect, useRef } from 'react';
import { get_oauth_client } from '/database';
import { useRouter } from 'next/router';

const CLIENT_SECRET = '5um608eo6ejt9wuiqqf7miikuqxexgtzeu5kbvv2jz8cnmtmnhpkxowzqcje1r2f';

export default function Redirect(props) {
    //const [token, setToken] = useState();

    if (props.no_client) return <div>No Client</div>
    if (props.invalid_client) return <div>Invalid Client</div>

    const router = useRouter();
    const lock = useRef(false);

    useEffect(() => {
        if (lock.current) return;
        lock.current = true;
        fetch('/api/oauth/getclient', {method: 'POST', mode: 'same-origin', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({client_id: props.client_id})}).then(res => {
            if (res.ok) return res.json();
            else throw 'Get client failed';
        }).then(res => {
            fetch(`/api/oauth/tokentrade`, {method: 'POST', mode: 'same-origin', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({client_id: 'aces-eight', client_secret: CLIENT_SECRET, access_code: props.code, url: `${res.host}${res.host === "https://cs3099user07.host.cs.st-andrews.ac.uk" ? "/api" : ""}/oauth/token`})})
                .then(res => {return res.json()})
                .then(res => {
                    fetch('/api/supergroup-login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({access_token: res.access_token, client_id: props.client_id})
                    }).then(res => res.json())
                    .then(res => localStorage.setItem('user', JSON.stringify(res)))
                    .then(router.replace('/home'));
                    })
        }).catch(err => {
            alert(err);
        })
    }, []);

    /*useEffect(() => {
        if (lock.current) return;
        lock.current = true;
        const login = fetch('/api/supergroup-login', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({client_id: props.client_id})}).then(res => res.json());

        login.then(res => localStorage.setItem('user', JSON.stringify(res)))
            .then(() => console.log(`temp login for user from ${props.client_id} issued`))
            .then(router.replace('/home'))
    })*/
}

export async function getServerSideProps(context) {
    console.log(context.query);
    const client_id = context.query.client;
    if (!client_id) return {props: {no_client: true}};
    const client = await get_oauth_client(client_id);
    if (!client) return {props: {invalid_client: true}};
    if (!context.query.code) return {props: {no_code: true}};
    return {props: {client_id: client_id, code: context.query.code}};
}