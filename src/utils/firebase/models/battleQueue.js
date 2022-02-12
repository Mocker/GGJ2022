import { getDatabase, ref, set, push, query, limitToLast, onValue, get } from 'firebase/database';

export class BattleQueueModel {

    constructor() {
        if (!BattleQueueModel._instance) {
            UserModel._instance = this;
        }
        return BattleQueueModel._instance;
    }

    static getInstance() {
        return this._instance;
    }

    getBattleQueueMonster() {

        const randomProperty = (obj) => {
            var keys = Object.keys(obj);
            return obj[keys[ keys.length * Math.random() << 0]];
        };

        const db = getDatabase();
        push(ref(db, 'battlequeue'), this.monster)
        .then(() => {
            const recentMonstersRef = query(ref(db, 'battlequeue'), limitToLast(10));
            onValue(recentMonstersRef, (snapshot) => {
                console.log(snapshot);
                const data = snapshot.val();
                const randomMonster = randomProperty(data);
                console.log(randomMonster);
                return randomMonster;
            });
        })
        .catch((error) => {
            console.log(error);
          // The write failed...
        });
    }
}