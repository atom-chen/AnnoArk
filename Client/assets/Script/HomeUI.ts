import CsvMain from "./CvsMain";
import BaseUI from "./BaseUI";
import MainCtrl from "./MainCtrl";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HomeUI extends BaseUI {
    static Instance: HomeUI;
    onLoad() {
        HomeUI.Instance = this;
    }
    
    onMode0BtnClick() {
        MainCtrl.Instance.gotoMode0();
    }
    
    onMode1BtnClick() {
        MainCtrl.Instance.gotoMode1();
    }
    
}
