import CsvMain from "./CvsMain";
import HomeUI from "./HomeUI";
import { DataMgr, UserData } from "./DataMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainCtrl extends cc.Component {
    static Instance: MainCtrl;
    onLoad() {
        MainCtrl.Instance = this;
        DataMgr.readData();
        this.fetchRemoteData();
    }

    energy = 0;

    start() {
        CsvMain.EnterUI(HomeUI);
        console.log('goto home')
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
    
    fetchRemoteData(){
        let othersData: UserData[] = [];
        
        let user = new UserData();
        user.arkSize = 40;
        user.arkLocationX = 0;
        user.arkLocationY = 0;
        user.speed = 0;
        user.population = 2251;
        user.nickname = "星云号交易所方舟";
        othersData.push(user);

        DataMgr.othersData = othersData;
        DataMgr.changed = true;
    }
}
