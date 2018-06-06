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
            console.log('Building loaded', txt);
            DataMgr.BuildingConfig = txt;
        }.bind(this));
        cc.loader.loadRes('Cargo', function (err, txt) {
            console.log('Cargo loaded');
            DataMgr.CargoConfig = txt;
        }.bind(this));
        cc.loader.loadRes('Tech', function (err, txt) {
            console.log('Tech loaded', txt);
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
        user.population = 5;
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
        if (DataMgr.myData) {
            DataMgr.populationLimit = 0;
            DataMgr.researchRatePerMin = 0;
            let totalWorkers = 0;
            if (DataMgr.myBuildingData) {
                DataMgr.myBuildingData.forEach(buildingData => {
                    buildingData.isWorking = false;
                    totalWorkers += buildingData.workers;
                    if (this.isHouse(buildingData.id)) {
                        let buildingInfo = DataMgr.BuildingConfig.find(info => info.id == buildingData.id);
                        DataMgr.populationLimit += parseInt(buildingInfo['Arg0']);
                    }
                    else if (buildingData.id == 'research239') {
                        //研究院
                        if (DataMgr.currentWorkingTech) {
                            let techInfo = DataMgr.TechConfig.find(info => info.id == DataMgr.currentWorkingTech);
                            let techData = DataMgr.myTechData.find(data => data.id == DataMgr.currentWorkingTech);
                            let delta = Math.min(techInfo.Work - techData.filledWork, buildingData.workers * 1 / 60 * dt);
                            techData.filledWork += delta;
                            if (techData.filledWork >= techInfo.Work) {
                                techData.finished = true;
                                DataMgr.currentWorkingTech = null;
                            }
                            DataMgr.researchRatePerMin += buildingData.workers * 1;
                        }
                    } else {
                        if (buildingData.workers <= 0) return;
                        let buildingInfo = DataMgr.BuildingConfig.find(info => info.id == buildingData.id);
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
                    }
                });
            }
            DataMgr.idleWorkers = DataMgr.myData.population - totalWorkers;
            if (DataMgr.myData && DataMgr.myCargoData) {
                //检查食物
                let needToConsumeFood = DataMgr.myData.population * 1 / 60 * dt;
                let oriNeedToConsumeFood = needToConsumeFood;
                DataMgr.CargoConfig.forEach(info => {
                    if (info['IsFood'] != 'TRUE') return;
                    let data = DataMgr.myCargoData.find(data => data.id == info.id);
                    if (data && data.amount > 0) {
                        let consumption = Math.min(needToConsumeFood, data.amount);
                        needToConsumeFood -= consumption;
                        data.amount -= consumption;
                    }
                });
                if (needToConsumeFood <= 0 && DataMgr.myData.population < DataMgr.populationLimit) {
                    let newPopulationPerMin = (10 + Math.sqrt(DataMgr.myData.population)) / 10 * 300;//TODO*3
                    let perDt = newPopulationPerMin / 60 * dt;
                    if (Math.random() < perDt) {
                        //新人口
                        DataMgr.myData.population += 1;
                        DataMgr.idleWorkers += 1;
                    }
                    DataMgr.populationGrowPerMin = newPopulationPerMin;
                } else if (needToConsumeFood > 0) {
                    let lackFoodProp = needToConsumeFood / oriNeedToConsumeFood;
                    let dieCountPerMin = Math.max(0, DataMgr.myData.population - 10) * lackFoodProp;
                    let perDt = dieCountPerMin / 60 * dt;
                    if (Math.random() < perDt) {
                        //死亡1个
                        if (DataMgr.idleWorkers > 0) {
                            DataMgr.myData.population -= 1;
                            DataMgr.idleWorkers -= 1;
                        } else {
                            let canDieList = DataMgr.myBuildingData.filter((d) => d.workers > 0 && d.id != 'fisher8032');
                            if (canDieList.length > 0) {
                                let ranIndex = Math.floor(Math.random() * canDieList.length);
                                canDieList[ranIndex].workers -= 1;
                                DataMgr.myData.population -= 1;
                            }
                        }
                    }
                    DataMgr.populationGrowPerMin = -dieCountPerMin;
                } else {
                    DataMgr.populationGrowPerMin = 0;
                }
            }
        }
    }

    isHouse(id: string) {
        return id == 'dorm08821' || id == 'house8523';
    }
}
