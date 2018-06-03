import BaseUI from "./BaseUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CsvMain extends cc.Component {

    static Instance: CsvMain;

    onLoad() {
        CsvMain.Instance = this;
    }

    @property(cc.Node)
    uiContainer: cc.Node = null;

    static EnterUI(uiType: any) {
        this.Instance.uiContainer.children.forEach((uiNode) => {
            if (uiNode.getComponent(uiType)) {
                uiNode.active = true;
            } else {
                uiNode.active = false;
            }
        })
    }
}
