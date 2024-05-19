import { authenticate_login, register_login, register_local_user } from '../../database';

export default async (req, res) => {

    const {username, email, password} = req.body;
    const user_data = {username: username, email: email};
    let registered;
    let user_uuid;

    if(await authenticate_login(username, password)){
        console.log("User is registered");
        return res.status(401).json({});
    }
    registered = await register_login(username, password);

    if(registered){
        user_uuid = await register_local_user(user_data);
    }
    else{
        console.log("Unable to access user data");
        return res.status(401).json({});
    }
    
    return res.status(200).json({user_uuid});
}
