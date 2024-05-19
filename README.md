# Group 8 - Solvesudo

## Installation
Run `npm i` to install required dependencies for this project.
Use `npm run dev` to run this program.

## Requirements
This software requires a connection to a MongoDB database. It supports MongoDB v6.0.2 in testing, other versions may or may not be supported.

Sample puzzles are available in the "puzzle-sample" directory which can be uploaded to a new database if needed.

In order to define configuration, a file called `dbconfig.json` must be defined in the root of this directory. It is a file of the format:

```json
{
    "user": <username>,
    "host": <hostname>,
    "port": <database port>,
    "password": <password>,
    "database": <name of the database>
}
```

## Support
If you are in need of assistance, contact Group 8.