import BaseUI from "./BaseUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CsvMain extends cc.Component {

    static Instance: CsvMain;

    onLoad() {
        CsvMain.Instance = this;
        this.uiContainer.children.forEach(c => c.active = false);
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

    // update() {
    //     let visibleSize = cc.view.getVisibleSize();
    //     console.log('view, size', cc.view.getVisibleSize(),
    //         this.node.position,
    //         this.node.getContentSize());
    //     if (visibleSize.width >= visibleSize.height) {
    //         this.node.rotation = 0;
    //         this.node.scale = 1;
    //         this.node.setContentSize(1080 / visibleSize.height * visibleSize.width, 1080);
    //         this.node.position = new cc.Vec2(visibleSize.width/2,visibleSize.height /2);
    //     } else {
    //         this.node.rotation = 90;
    //         this.node.setContentSize(1080 / visibleSize.width * visibleSize.height, 1080);
    //         this.node.position = new cc.Vec2(visibleSize.width/2,visibleSize.height/2);
    //     console.log('this.node.position',this.node.position);
    //     this.node.scale = visibleSize.width / 1080;
    //     }
    // }
}
