import { getDatabase, ref, set, push, query, limitToLast, onValue } from 'firebase/database';

export class UserModel {

    constructor() {
        if (!UserModel._instance) {
            UserModel._instance = this;
        }
        this.user = null;
        this.monster = null;
        return UserModel._instance;
    }

    static getInstance() {
        return this._instance;
    }

    setUser(user) {
        this.user = user;
    }

    getUser() {
        return this.user;
    }

    createUserWithData({monsterName}) {
        const db = getDatabase();
        this.monster = [{
            name: monsterName,
            hp: 123,
            atk: 1,
            isBattleEnabled: true
        }];
        set(ref(db, 'users/' + this.user.uid), {
            email: this.user.email,
            monsters: [this.monster]
          })
          .then(() => {
            
          })
          .catch((error) => {
              console.log(error);
            // The write failed...
          });
    }

    startBattleWithMonster() {

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
            });
        })
        .catch((error) => {
            console.log(error);
          // The write failed...
        });
    }
}