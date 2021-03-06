import { getDatabase, ref, set, push, query, limitToLast, onValue, get } from 'firebase/database';
import { FireBaseSingleton } from '..';

export class UserModel {

    constructor() {
        if (!UserModel._instance) {
            UserModel._instance = this;
        }
        this.user = null;
        this.monsters = [];
        this.petIndex = null;
        this.pet = null;
        this.items = [];
        this.userCallback = null;
        this.loadedDemoUser = false;
        return UserModel._instance;
    }

    static getInstance() {
        return this._instance;
    }

    async logout() {
        await FireBaseSingleton.getInstance().signOutUser();
        this.user = null;
        this.monsters = [];
        this.pet = null;
        this.items = [];
        this.userData = null;
    }

    addUserListener (callback) {
        this.userCallback = callback;
    }

    async updateUser(updatedPet = null) {
        console.log("updatedPet");
        console.log(updatedPet);
        if (updatedPet && this.petIndex !== null ) {
            this.user.pet = {
                name: updatedPet.name,
                type: updatedPet.type,
                stage: updatedPet.stage,
                baseData: updatedPet.baseData,
                customData: updatedPet.customData
            }
            this.monsters[this.petIndex] = this.user.pet;
            
        }
        console.log(this.monsters);
        if  (this.loadedDemoUser) return; //for demo we dont update the server
        const db = getDatabase();
        await set(ref(db, 'users/' + this.user.uid), {
            user: this.user.email,
            money: this.user.money || 0,
            monsters: this.monsters,
            items: this.items
        });
    }

    async updateCurrentMonsterName(name) {
        this.monsters[this.petIndex].name = name;
        await this.updateUser();
    }

    addMonster(monster) {
        this.monsters.push(monster);
    }

    setDemoUser() {
        console.log('Loading blank user for demo purposes');
        this.money = 5;
        this.monsters = [];
        this.items = [{
                name: 'Cake',
                effects: {
                    happiness: 25
                },
                quantity: 3
            }];
        this.user = {
            money: this.money,
            monsters: this.monsters,
            items: this.items
        };
        this.loadedDemoUser = true;
        if (this.userCallback) {
            this.userCallback(this);
        }
        return this;
    }

    async setUser(user) {
        this.user = user;
        const db = getDatabase();
        const userData = await (await get(ref(db, 'users/' + this.user.uid))).val();
        console.log(`user ${user.email} existing data:`);
        console.log(userData);
        this.money = userData.money || 0;
        this.monsters = userData.monsters ? userData.monsters : [];
        this.items = userData.items ? userData.items : [];
        //TODO:: use db data
        // this.monsters = [{
        //     type: 'tadpole',
        //     stage: 'baby',
        //     baseData: {
        //         "stage": "baby",
        //         "name": "CuteGuy",
        //         "displayName": "Cute Guy",
        //         "className": "Tadpole",
        //         "type": "tadpole",
        //         "evolveDots": 3
        //     },
        //     stats: {
        //         energy: { min: 0, current: 90, max: 100 },
        //         name: "random name",
        //         timers: {
        //             lived: 60000*5 //5 minutes?
        //         }
        //     }
        // }];
        // this.items = [
        // {
        //     name: 'Candy Cane',
        //     effects: {
        //         energy: 25
        //     },
        //     quantity: 5
        // },
        // {
        //     name: 'Cake',
        //     effects: {
        //         happiness: 25
        //     },
        //     quantity: 3
        // }];
        // await this.updateUser();
        if  (userData && userData.monsters && userData.monsters.length > 0) {
            this.monsters = userData.monsters
        } else {
            this.monsters = [];
        }
        if (this.userCallback) {
            this.userCallback(this);
        }
        return this;
    }

    selectPet(petIndex) {
        this.petIndex = petIndex;
        this.pet = this.monsters[petIndex];
    }

    getUser() {
        return this.user;
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