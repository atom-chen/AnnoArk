
const {ccclass, property} = cc._decorator;

@ccclass
export default class BuildPanel extends cc.Component {
    static Instance: BuildPanel;
    onLoad() {
        BuildPanel.Instance = this;
    }

    @property(cc.Node)
    buttonContainer: cc.Node = null;
    @property(cc.Node)
    buttonTemplate: cc.Node = null;

    onEnable () {
        
    }


    static Show() {
        this.Instance.node.active = true;
    }
    static Hide() {
        this.Instance.node.active = false;
    }
}