import CvsMain from "./CvsMain";
import HomeUI from "./HomeUI";
import { DataMgr, UserData, CargoData, MineInfo } from "./DataMgr";
import WorldUI from "./WorldUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainCtrl extends cc.Component {
    static Instance: MainCtrl;
    onLoad() {
        MainCtrl.Instance = this;
        DataMgr.readData();
        this.fetchRemoteData();
        CvsMain.Instance.uiContainer.getChildByName('WorldUI').active = true;
    }

    start() {
        CvsMain.EnterUI(HomeUI);
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
        DataMgr.IronMineConfig = [];
        WorldUI.Instance.mineContainer.children.forEach(c => {
            const polygon = c.getComponent(cc.PolygonCollider);
            if (polygon) {
                const info = new MineInfo();
                info.polygonCollider = polygon;
                const points = [];
                polygon.points.forEach(p => {
                    points.push(polygon.node.position.add(polygon.offset).add(p));
                });
                info.points = points;
                DataMgr.IronMineConfig.push(info);
            }
        });
    }


    gotoHome() {
        CvsMain.EnterUI(HomeUI);
    }

    generateNewArk(size: number) {
        let user = new UserData();
        user.arkSize = size;
        let rad = Math.random() * Math.PI;
        user.lastLocationX = Math.cos(rad) * 4000;
        user.lastLocationY = Math.sin(rad) * 4000;
        user.speed = 0;
        user.population = 5;
        user.nickname = "新玩家";
        this.calcSail(user);
        return user;
    }

    fetchRemoteData() {
        let othersData: UserData[] = [];

        let user = new UserData();
        user.arkSize = 41;
        user.arkLocation = cc.Vec2.ZERO;
        user.lastLocationX = 0;
        user.lastLocationY = 0;
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
            DataMgr.aboveIronMine = false;
            let totalWorkers = 0;

            //检测所属矿区
            DataMgr.IronMineConfig.forEach(m => {
                if (cc.Intersection.pointInPolygon(DataMgr.myData.arkLocation, m.points)) {
                    DataMgr.aboveIronMine = true;
                }
            });

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
                        //生产
                        if (buildingData.workers <= 0) return;
                        if (buildingData.id == 'ironcoll28' && !DataMgr.aboveIronMine) return;
                        let buildingInfo = DataMgr.BuildingConfig.find(info => info.id == buildingData.id);
                        let raws = [];
                        for (let i = 0; i < 4; i++) {
                            let rawid = buildingInfo['Raw' + i];
                            if (rawid && rawid.length > 0) {
                                raws.push([rawid, buildingInfo['Raw' + i + 'Rate'] / buildingInfo['MaxHuman'] / 60 * dt * buildingData.workers]);
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
                                    cargoData.amount += buildingInfo['Out' + i + 'Rate'] / buildingInfo['MaxHuman'] / 60 * dt * buildingData.workers;
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
                        //死1个
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
            //航行
            this.calcSail(DataMgr.myData);
            DataMgr.othersData.forEach(data => this.calcSail(data));
        }
    }
    calcSail(data: UserData) {
        if (data.speed && data.speed > 0 && data.destinationX && data.destinationY) {
            let lastTimestamp = data.lastLocationTime;
            let nowTimestamp = Number(new Date());
            let lastLocation = new cc.Vec2(data.lastLocationX, data.lastLocationY);
            let destination = new cc.Vec2(data.destinationX, data.destinationY);
            let needTime = destination.sub(lastLocation).mag() / (data.speed / 60) * 1000;
            let curLocation = MainCtrl.lerpVec2(lastLocation, destination,
                (nowTimestamp - lastTimestamp) / needTime, true);
            data.arkLocation = curLocation;
        } else {
            data.arkLocation = new cc.Vec2(data.lastLocationX, data.lastLocationY);
        }
    }


    static lerp(a: number, b: number, t: number, clamp?: boolean): number {
        if (clamp) t = Math.max(0, Math.min(1, t));
        return a * (1 - t) + b * t;
    }
    static lerpVec2(a: cc.Vec2, b: cc.Vec2, t: number, clamp?: boolean): cc.Vec2 {
        if (clamp) t = Math.max(0, Math.min(1, t));
        return a.mul(1 - t).add(b.mul(t));
    }

    isHouse(id: string) {
        return id == 'dorm08821' || id == 'house8523';
    }
}
