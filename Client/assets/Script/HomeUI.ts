import CsvMain from "./CvsMain";
import BaseUI from "./BaseUI";
import MainCtrl from "./MainCtrl";
import { DataMgr } from "./DataMgr";
import WorldUI from "./WorldUI";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HomeUI extends BaseUI {
    static Instance: HomeUI;
    onLoad() {
        HomeUI.Instance = this;
    }
    
    onClaim(event, index: string) {
        switch(index) {
            case '0':{
                DataMgr.arkSize = 10;
                CsvMain.EnterUI(WorldUI);
                break;
            }
        }
    }
    
    
}
