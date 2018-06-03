import CsvMain from "./CvsMain";
import BaseUI from "./BaseUI";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Mode1UI extends BaseUI {
    static Instance: Mode1UI;
    onLoad() {
        Mode1UI.Instance = this;
    }
    
    onMode0BtnClick() {

    }
    
    onMode1BtnClick() {

    }
    
}
