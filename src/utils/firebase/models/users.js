import { getDatabase, ref, set, push, query, limitToLast, onValue, get } from 'firebase/database';

export class UserModel {

    constructor() {
        if (!UserModel._instance) {
            UserModel._instance = this;
        }
        this.user = null;
        this.monsters = null;
        this.pet = null;
        return UserModel._instance;
    }

    static getInstance() {
        return this._instance;
    }

    async setUser(user) {
        this.user = user;
        const db = getDatabase();
        const userData = await (await get(ref(db, 'users/' + this.user.uid))).val();
        console.log(`user ${user.email} existing data: ${userData}`);
        if  (userData && userData.monsters && userData.monsters.length > 0) {
                this.monsters = userData.monsters
        } else {
            this.monsters = [];
        }
        return this;
    }

    getUser() {
        return this.user;
    }

    async createUserWithData({monsterName}) {
        const db = getDatabase();
        this.pet = {
            name: monsterName,
            hp: 123,
            atk: 1,
            isBattleEnabled: true
        };
        if (this.monsters) {
            this.monsters.push(this.pet);
        } else {
            this.monsters = [this.pet];
        }
        await set(ref(db, 'users/' + this.user.uid), {
            email: this.user.email,
            monsters: this.monsters
          });
        return this;
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