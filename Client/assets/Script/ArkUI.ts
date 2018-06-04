import CsvMain from "./CvsMain";
import BaseUI from "./BaseUI";
import WorldUI from "./WorldUI";
import { DataMgr } from "./DataMgr";
import BuildPanel from "./BuildPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ArkUI extends BaseUI {
    static Instance: ArkUI;
    onLoad() {
        ArkUI.Instance = this;
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

    }

    @property(cc.Node)
    arkMap: cc.Node = null;

    @property(cc.Node)
    panPad: cc.Node = null;
    @property(cc.Slider)
    sldZoom: cc.Slider = null;
    pressingZoomSlider = false;
    zoomScale: number = 1;

    onEnable() {
        this.refreshZoom();
    }

    refreshZoom() {
        this.arkMap.scale = this.zoomScale;
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
            let deltaZoom = this.zoomScale / oldZoomScale;
            this.arkMap.position = this.arkMap.position.mul(deltaZoom);
            this.refreshZoom();
        }
    }

    refreshData() { }

    onGotoWorldClick() {
        CsvMain.EnterUI(WorldUI);
    }
    onBuildingClick() {
        BuildPanel.Show();
    }
    onTechClick() {

    }

    onCenterBtnClick() {
        let data = DataMgr.myData;
        let rawPos = new cc.Vec2(data.arkLocationX, data.arkLocationY);
        rawPos.mulSelf(this.zoomScale);
        this.arkMap.position = rawPos.neg();
    }

    onPanPadTouchMove(event: cc.Event.EventTouch) {
        console.log('drag map');
        let delta = event.getDelta();
        this.arkMap.position = this.arkMap.position.add(new cc.Vec2(delta.x, delta.y));
    }
    onMouseWheel(event: cc.Event.EventMouse) {
        let delta = event.getScrollY();
        let oldZoomScale = this.zoomScale;
        this.zoomScale *= Math.pow(1.5, (delta / 120)); //delta每次±120
        this.clampZoom();
        let deltaZoom = this.zoomScale / oldZoomScale;
        this.arkMap.position = this.arkMap.position.mul(deltaZoom);
        this.refreshZoom();
    }
    onZoomSliderChange(slider: cc.Slider) {
        // console.log('sld', slider.progress);
    }
    clampZoom() {
        if (this.zoomScale > 3) this.zoomScale = 3;
        if (this.zoomScale < 0.3) this.zoomScale = 0.3;
    }
}
