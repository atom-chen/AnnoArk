import CsvMain from "./CvsMain";
import HomeUI from "./HomeUI";
import { DataMgr, UserData, CargoData } from "./DataMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainCtrl extends cc.Component {
    static Instance: MainCtrl;
    onLoad() {
        MainCtrl.Instance = this;
        DataMgr.readData();
        this.fetchRemoteData();
    }




    start() {
        CsvMain.EnterUI(HomeUI);
        console.log('goto home')

        //加载数据
        cc.loader.loadRes('Building', function (err, txt) {
            console.log('Building loaded');
            DataMgr.BuildingConfig = txt;
        }.bind(this));
        cc.loader.loadRes('Cargo', function (err, txt) {
            console.log('Cargo loaded');
            DataMgr.CargoConfig = txt;
        }.bind(this));
        cc.loader.loadRes('Tech', function (err, txt) {
            console.log('Tech loaded');
            DataMgr.TechConfig = txt;
        }.bind(this));
    }


    gotoHome() {
        CsvMain.EnterUI(HomeUI);
    }

    generateNewArk(size: number) {
        let user = new UserData();
        user.arkSize = size;
        let rad = Math.random() * Math.PI;
        user.arkLocationX = Math.cos(rad) * 4000;
        user.arkLocationY = Math.sin(rad) * 4000;
        user.speed = 0;
        user.population = 2;
        user.nickname = "新玩家";
        return user;
    }

    fetchRemoteData() {
        let othersData: UserData[] = [];

        let user = new UserData();
        user.arkSize = 41;
        user.arkLocationX = 0;
        user.arkLocationY = 0;
        user.speed = 0;
        user.population = 2251;
        user.nickname = "星云号交易所方舟";
        othersData.push(user);

        DataMgr.othersData = othersData;
        DataMgr.changed = true;
    }


    update(dt: number) {
        if (DataMgr.myBuildingData) {
            DataMgr.myBuildingData.forEach(buildingData => {
                buildingData.isWorking = false;
                if (buildingData.workers <= 0) return;
                let buildingInfo = DataMgr.BuildingConfig.find((value) => {
                    return value.id == buildingData.id;
                });
                let raws = [];
                for (let i = 0; i < 4; i++) {
                    let rawid = buildingInfo['Raw' + i];
                    if (rawid && rawid.length > 0) {
                        raws.push([rawid, buildingInfo['Raw' + i + 'Rate'] / 60 * dt * buildingData.workers]);
                    }
                }
                let enough = true;
                raws.forEach(raw => {
                    if (!enough) return;
                    let cargoData = DataMgr.myCargoData.find(c => c.id == raw[0]);
                    if (cargoData && cargoData.amount > raw[1]) {
                        raw.push(cargoData);
                    } else {
                        enough = false;
                    }
                });
                if (enough) {
                    //生产
                    raws.forEach(raw => {
                        raw[2].amount -= raw[1];
                    });
                    for (let i = 0; i < 4; i++) {
                        let outid = buildingInfo['Out' + i];
                        if (outid && outid.length > 0) {
                            let cargoData = DataMgr.myCargoData.find(c => c.id == outid);
                            if (!cargoData) {
                                cargoData = new CargoData();
                                cargoData.id = outid;
                                cargoData.amount = 0;
                                DataMgr.myCargoData.push(cargoData);
                            }
                            cargoData.amount += buildingInfo['Out' + i + 'Rate'] / 60 * dt * buildingData.workers;
                        }
                    }
                    buildingData.isWorking = true;
                }
            });
        }
    }
}
