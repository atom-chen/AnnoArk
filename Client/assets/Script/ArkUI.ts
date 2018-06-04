import CsvMain from "./CvsMain";
import BaseUI from "./BaseUI";
import WorldUI from "./WorldUI";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ArkUI extends BaseUI {
    static Instance: ArkUI;
    onLoad() {
        ArkUI.Instance = this;
    }
    
    
    onGotoWorldClick() {
        CsvMain.EnterUI(WorldUI);
    }
}
