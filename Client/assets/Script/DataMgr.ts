export class DataMgr {

    static myData: UserData;
    static myBuildingData: BuildingInfo[];

    static othersData: UserData[] = [];

    static BuildingConfig;
    static CargoConfig;
    static TechConfig;

    static changed = false;

    static readData() {
        try {
            let myData = JSON.parse(cc.sys.localStorage.getItem('user0'));
            DataMgr.myData = myData;
            DataMgr.myBuildingData = JSON.parse(cc.sys.localStorage.getItem('user0Building'));
            DataMgr.changed = true;
            console.log('finish read data');
        } catch (error) {
            console.error(error);
        }
    }
    static writeData() {
        try {
            cc.sys.localStorage.setItem('user0', JSON.stringify(DataMgr.myData));
            cc.sys.localStorage.setItem('user0Building', JSON.stringify(DataMgr.myBuildingData));
            console.log('finish write data');
        } catch (error) {
            console.error(error);
        }
    }
    static clearData() {
        cc.sys.localStorage.removeItem('user0');
        cc.sys.localStorage.removeItem('user0Building');
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
export class BuildingInfo {
    Name: string;
    length: number;
    width: number;
}