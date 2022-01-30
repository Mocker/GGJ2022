import { getDatabase, ref, set, push, query, limitToLast, onValue, get } from 'firebase/database';
import { FireBaseSingleton } from '..';

export class UserModel {

    constructor() {
        if (!UserModel._instance) {
            UserModel._instance = this;
        }
        this.user = null;
        this.monsters = null;
        this.pet = null;
        this.items = [];
        this.userCallback = null;
        return UserModel._instance;
    }

    static getInstance() {
        return this._instance;
    }

    async logout() {
        await FireBaseSingleton.getInstance().signOut();
        this.user = null;
        this.monsters = null;
        this.pet = null;
        this.items = [];
        this.userData = null;
    }

    addUserListener (callback) {
        this.userCallback = callback;
    }

    async setUser(user) {
        this.user = user;
        const db = getDatabase();
        const userData = await (await get(ref(db, 'users/' + this.user.uid))).val();
        console.log(`user ${user.email} existing data: ${userData}`);
        //TODO:: use db data
        this.monsters = [{
            type: 'tadpole',
            stage: 'baby',
            baseData: {
                "stage": "baby",
                "name": "CuteGuy",
                "displayName": "Cute Guy",
                "className": "Tadpole",
                "type": "tadpole",
                "evolveDots": 3
            },
            stats: {
                energy: { min: 0, current: 90, max: 100 },
                name: "random name",
                timers: {
                    lived: 60000*5 //5 minutes?
                }
            }
        }];
        this.items = [
        {
            name: 'Candy Cane',
            effects: {
                energy: (e) => e+25
            },
            quantity: 5
        },
        {
            name: 'Cake',
            effects: {
                happiness: (e) => e+25
            },
            quantity: 3
        }];
        /*if  (userData && userData.monsters && userData.monsters.length > 0) {
                this.monsters = userData.monsters
        } else {
            this.monsters = [];
        }*/
        if (this.userCallback) {
            this.userCallback(this);
        }
        return this;
    }

    selectPet (petIndex) {
        this.pet = this.monsters[petIndex];
    }

    getUser() {
        return this.user;
    }

    async createUserWithData({monsterName, monsterData={}}) {
        const db = getDatabase();
        this.pet = {
            name: monsterName,
            ...monsterData
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