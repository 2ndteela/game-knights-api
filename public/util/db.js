const sqlite3 = require('sqlite3').verbose()

module.exports = class Database {

    constructor() {
        this.db = null
    }

    async connect() {
        const ret = new Promise( (resolve, reject ) => {
            let db = new sqlite3.Database('./database/gameKnights.db', (err) => {
                if (err) {
                  console.error(err.message);
                  reject(err)
                }
                console.log('Connected to the gameKnights database.');
                this.db = db
                resolve(true)
            });
        })
        return ret
    }

    close() {
        this.db.close(err => {
            if(err) 
                console.error(err)

            else 
                console.log('connection closed')
        })
    } 
}