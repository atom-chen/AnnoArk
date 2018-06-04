export class DataMgr {

    static myData: UserData;

    static othersData: UserData[] = [];

    static changed = false;

    static readData(){
        try {
            let myData = JSON.parse(cc.sys.localStorage.getItem('user0'));
            DataMgr.myData = myData;
            DataMgr.changed = true;
           console.log('finish read data');
        } catch (error) {
            console.error(error);
        }
    }
    static writeData(){
        try {
            cc.sys.localStorage.setItem('user0', JSON.stringify(DataMgr.myData));
            console.log('finish write data');
        } catch (error) {
            console.error(error);
        }
    }
    static clearData() {
        cc.sys.localStorage.removeItem('user0');
    }
}

export class UserData {
    nickname: string;
    arkSize: number; //0: 简陋方舟, 1, 2
    arkLocationX: number;
    arkLocationY: number;
    population: number;
    speed: number;
    lastLocationTime: number;
    destinationX: number;
    destinationY: number;
}