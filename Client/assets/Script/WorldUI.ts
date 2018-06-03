import CsvMain from "./CvsMain";
import BaseUI from "./BaseUI";
import MainCtrl from "./MainCtrl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WorldUI extends BaseUI {
    static Instance: WorldUI;
    onLoad() {
        WorldUI.Instance = this;
    }

    @property(cc.Label)
    lblEnergy: cc.Label = null;

    @property(cc.Button)
    btnPause: cc.Button = null;

    @property(cc.Node)
    ingameRange: cc.Node = null;

    start() {
    }

    onEnable() {
    }

    update(dt: number) {
        
    }
}
