import CsvMain from "./CvsMain";
import HomeUI from "./HomeUI";
import Mode0UI from "./Mode0UI";
import Mode1UI from "./Mode1UI";

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
    gotoMode0() {
        CsvMain.EnterUI(Mode0UI);
    }

    gotoMode1() {
        CsvMain.EnterUI(Mode1UI);
    }
}
