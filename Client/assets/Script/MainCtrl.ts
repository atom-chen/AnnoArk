import CsvMain from "./CvsMain";
import HomeUI from "./HomeUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainCtrl extends cc.Component {
    static Instance: MainCtrl;
    onLoad() {
        MainCtrl.Instance = this;
    }

    energy = 0;

    start() {
        CsvMain.EnterUI(HomeUI);
    }

    gotoHome() {
        CsvMain.EnterUI(HomeUI);
    }
}
