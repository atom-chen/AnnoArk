import CsvMain from "./CvsMain";
import BaseUI from "./BaseUI";
import MainCtrl from "./MainCtrl";
import ArkUI from "./ArkUI";
import ArkInWorld from "./ArkInWorld";
import { DataMgr } from "./DataMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WorldUI extends BaseUI {
    static Instance: WorldUI;
    onLoad() {
        WorldUI.Instance = this;
        let self = this;
        this.sldZoom.node.getChildByName('Handle').on(cc.Node.EventType.TOUCH_START, function (event) {
            self.pressingZoomSlider = true;
        });
        this.sldZoom.node.getChildByName('Handle').on(cc.Node.EventType.TOUCH_END, function (event) {
            self.pressingZoomSlider = false;
        });
        this.sldZoom.node.getChildByName('Handle').on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            self.pressingZoomSlider = false;
        });
        this.panPad.on(cc.Node.EventType.TOUCH_MOVE, this.onPanPadTouchMove, this);
        this.panPad.on(cc.Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);

        // cc.systemEvent.on(cc.SystemEvent.EventType.)
    }

    @property(cc.Label)
    lblEnergy: cc.Label = null;

    @property(cc.Button)
    btnPause: cc.Button = null;

    @property(cc.Node)
    ingameRange: cc.Node = null;

    @property(cc.Node)
    arkContainer: cc.Node = null;
    @property(cc.Node)
    arkTemplate: cc.Node = null;

    @property(cc.Node)
    worldMap: cc.Node = null;
    @property(cc.Node)
    earth: cc.Node = null;

    @property(cc.Node)
    panPad: cc.Node = null;
    @property(cc.Slider)
    sldZoom: cc.Slider = null;
    pressingZoomSlider = false;
    zoomScale: number = 0.1;

    start() {
    }

    onEnable() {
        this.refreshData();
        this.refreshZoom();
    }

    refreshData() {

        //myData
        let neededCount = DataMgr.othersData.length + 1;
        for (let i = this.arkContainer.childrenCount; i < neededCount; i++) {
            let arkNode = cc.instantiate(this.arkTemplate);
            arkNode.parent = this.arkContainer;
        }
        let needToDestroys: cc.Node[] = [];
        for (let i = neededCount; i < this.arkContainer.childrenCount; i++) {
            needToDestroys.push(this.arkContainer.children[i]);
        }
        needToDestroys.forEach(c => c.destroy());

        let arkIW = this.arkContainer.children[0].getComponent(ArkInWorld);
        arkIW.setAndRefresh(DataMgr.myData, this.zoomScale);
        for (let i = 0; i < DataMgr.othersData.length; i++) {
            const data = DataMgr.othersData[i];
            this.arkContainer.children[i + 1].getComponent(ArkInWorld).
                setAndRefresh(DataMgr.othersData[i], this.zoomScale);
        }
    }

    refreshZoom() {
        let size = 12000 * this.zoomScale;
        this.earth.setContentSize(size, size);
        this.arkContainer.children.forEach(c => {
            c.getComponent(ArkInWorld).refreshZoom(this.zoomScale);
        })
    }

    update(dt: number) {
        if (DataMgr.changed) {
            this.refreshData();
            DataMgr.changed = false;
        }
        let prog = this.sldZoom.progress;
        if (!this.pressingZoomSlider) {
            if (prog > 0.5) {
                prog -= 5 * dt;
                if (prog < 0.5) prog = 0.5;
                this.sldZoom.progress = prog;
            } else if (prog < 0.5) {
                prog += 5 * dt;
                if (prog > 0.5) prog = 0.5;
                this.sldZoom.progress = prog;
            }
        }
        if (prog != 0.5) {
            let oldZoomScale = this.zoomScale;
            this.zoomScale *= Math.pow(1.5, (prog - 0.5) * 2 * 5 * dt);
            this.clampZoom();
            let deltaZoom = this.zoomScale/ oldZoomScale;
            this.worldMap.position = this.worldMap.position.mul(deltaZoom);
            this.refreshZoom();
        }
    }

    onGotoArkClick() {
        CsvMain.EnterUI(ArkUI);
    }

    onCenterBtnClick() {
        let data = DataMgr.myData;
        let rawPos = new cc.Vec2(data.arkLocationX, data.arkLocationY);
        rawPos.mulSelf(this.zoomScale);
        this.worldMap.position = rawPos.neg();
    }

    onPanPadTouchMove(event: cc.Event.EventTouch) {
        console.log('drag map');
        let delta = event.getDelta();
        this.worldMap.position = this.worldMap.position.add(new cc.Vec2(delta.x, delta.y));
    }
    onMouseWheel(event: cc.Event.EventMouse) {
        let delta = event.getScrollY();
        let oldZoomScale = this.zoomScale;
        this.zoomScale *= Math.pow(1.5, (delta / 120)); //delta每次±120
        this.clampZoom();
        let deltaZoom = this.zoomScale/ oldZoomScale;
        this.worldMap.position = this.worldMap.position.mul(deltaZoom);
        this.refreshZoom();
    }
    onZoomSliderChange(slider: cc.Slider) {
        // console.log('sld', slider.progress);
    }
    clampZoom() {
        if (this.zoomScale > 10) this.zoomScale = 10;
        if (this.zoomScale < 0.01) this.zoomScale = 0.01;
    }
}
