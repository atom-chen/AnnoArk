import CsvMain from "./CvsMain";
import BaseUI from "./BaseUI";
import WorldUI from "./WorldUI";
import { DataMgr, BuildingInfo } from "./DataMgr";
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

        this.cells = [];
        for (let i = -50; i <= 50; i++) {
            this.cells[i] = [];
            for (let j = -50; j < 50; j++) {
                this.cells[i][j] = new Cell();
            }
        }

        this.blueprint.on(cc.Node.EventType.TOUCH_MOVE, this.dragBlueprint.bind(this));
    }

    @property(cc.Node)
    arkMap: cc.Node = null;

    cells: Cell[][];

    @property(cc.Node)
    panPad: cc.Node = null;
    @property(cc.Slider)
    sldZoom: cc.Slider = null;
    pressingZoomSlider = false;
    zoomScale: number = 1;

    onEnable() {
        this.refreshZoom();

        let myData = DataMgr.myData;
        for (let i = -Math.floor(myData.arkSize / 2); i < myData.arkSize / 2; i++) {
            for (let j = -Math.floor(myData.arkSize / 2); j < myData.arkSize / 2; j++) {
                // let cell = new Cell();
                // this.cells[i][j] = cell;
                let cell = this.cells[i][j];
                cell.isLand = true;
                cell.building = null;
            }
        }

        DataMgr.myBuildingData.forEach(b => {
            //b.id
            //b.i,j
        });
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

        if (this.currentHoldingBlueprint) {
            this.blueprint.active = true;
            this.blueprint.position = new cc.Vec2(this.currentBlueprintIJ.i * 100-50, this.currentBlueprintIJ.j * 100-50);
            this.blueprint.setContentSize(this.currentHoldingBlueprint.length * 100, this.currentHoldingBlueprint.width * 100);
            for (let i = 0; i < this.currentHoldingBlueprint.length; i++) {
                for (let j = 0; j < this.currentHoldingBlueprint.width; j++) {
                    let cell = this.cells[this.currentBlueprintIJ.i][this.currentBlueprintIJ.j];
                    this.blueprintIndicator.fillColor = cell.building ? cc.Color.RED : cc.Color.GREEN;
                    this.blueprintIndicator.fillRect(i*100, j*100, 100, 100);
                }
            }
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
        // if (this.currentHoldingBlueprint){
        //     this.dragBlueprint(event);
        // }else{
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

    //Build
    @property(cc.Node)
    blueprint: cc.Node = null;
    @property(cc.Graphics)
    blueprintIndicator: cc.Graphics = null;
    currentHoldingBlueprint: BuildingInfo = null;
    currentBlueprintIJ: IJ;
    enterBuildMode(buildingInfo: BuildingInfo) {
        this.currentHoldingBlueprint = buildingInfo;
        this.currentBlueprintIJ = IJ.ZERO;
    }
    dragBlueprint(event: cc.Event.EventTouch) {
        let now = event.getLocation();
        console.log('loc', now);
        let touchPosInArkMap = this.arkMap.convertToNodeSpaceAR(now);
        // this.blueprint.position = touchPosInArkMap;
        this.currentBlueprintIJ.i = Math.round(touchPosInArkMap.x / 100);
        this.currentBlueprintIJ.j = Math.round(touchPosInArkMap.y / 100);
    }
}

class IJ {
    i: number;
    j: number;

    static get ZERO(): IJ {
        return { i: 0, j: 0 };
    }
}
class Cell {
    isLand = false;
    building: object = null;
}