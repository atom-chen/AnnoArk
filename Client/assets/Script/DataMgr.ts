export class DataMgr {

    static myData: UserData;
    static myCargoData: CargoData[];
    static myBuildingData: BuildingData[];
    static myTechData: TechData[];
    static idleWorkers: number = 0;
    static currentWorkingTech: string;
    static populationLimit: number = 0;

    static othersData: UserData[] = [];

    static BuildingConfig: BuildingInfo[];
    static CargoConfig: CargoInfo[];
    static TechConfig: TechInfo[];

    static changed = false;
    static populationGrowPerMin = 0;
    static researchRatePerMin = 0;

    static readData() {
        try {
            let myData = JSON.parse(cc.sys.localStorage.getItem('user0'));
            DataMgr.myData = myData;
            DataMgr.myBuildingData = JSON.parse(cc.sys.localStorage.getItem('user0Building'));
            DataMgr.myCargoData = JSON.parse(cc.sys.localStorage.getItem('user0Cargo'));
            DataMgr.myTechData = JSON.parse(cc.sys.localStorage.getItem('user0Tech'));
            DataMgr.currentWorkingTech = JSON.parse(cc.sys.localStorage.getItem('user0CurrentWorkingTech'));
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
            cc.sys.localStorage.setItem('user0Cargo', JSON.stringify(DataMgr.myCargoData));
            cc.sys.localStorage.setItem('user0Tech', JSON.stringify(DataMgr.myTechData));
            cc.sys.localStorage.setItem('user0CurrentWorkingTech', JSON.stringify(DataMgr.currentWorkingTech));
            console.log('finish write data');
        } catch (error) {
            console.error(error);
        }
    }
    static clearData() {
        cc.sys.localStorage.removeItem('user0');
        cc.sys.localStorage.removeItem('user0Building');
    }

    static HumanConfig = {

    }
}

export class UserData {
    nickname: string;
    arkSize: number; //0: 简陋方舟, 1, 2
    arkLocation: cc.Vec2;
    population: number = 0;
    speed: number;
    lastLocationX: number;
    lastLocationY: number;
    lastLocationTime: number;
    destinationX: number;
    destinationY: number;
}
export class BuildingInfo {
    id: string;
    Name: string;
    length: number;
    width: number;
}
export class BuildingData {
    id: string;
    ij: IJ;
    workers: number = 0;

    isWorking = false;
}
export class CargoInfo {
    id: string;
    Name: string;
}
export class CargoData {
    id: string;
    amount: number;
}
export class TechInfo {
    id: string;
    Name: string;
    Work: number;
}
export class TechData {
    id: string;
    filledWork: number;
    finished: boolean;
}
export class IJ {
    i: number = 0;
    j: number = 0;

    clone() {
        let ij = new IJ();
        ij.i = this.i;
        ij.j = this.j;
        return ij;
    }
    static get ZERO(): IJ {
        return new IJ();
    }
}