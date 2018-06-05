import BuildPanel from "./BuildPanel";
import ArkUI from "./ArkUI";
import { BuildingInfo, DataMgr } from "./DataMgr";
import DialogPanel from "./DialogPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BuildingButton extends cc.Component {

    @property(cc.Label)
    lblName: cc.Label = null;
    @property(cc.Label)
    lblSize: cc.Label = null;

    @property(cc.Label)
    lblConsumption: cc.Label = null;

    info: BuildingInfo;

    setAndRefresh(info: BuildingInfo) {
        this.info = info;
        this.lblName.string = info.Name;
        this.lblSize.string = info.length + '*' + info.width;

        let strInfoLines = [];
        for (let i = 0; i < 4; i++) {
            const rawid = info['BuildMat' + i];
            if (rawid && rawid.length > 0) {
                const count = info['BuildMat' + i + 'Count'];
                const cargoInfo = DataMgr.CargoConfig.find(c => c.id == rawid);
                strInfoLines.push(`${cargoInfo.Name}*${count}`);
            }
        }
        if (strInfoLines.length > 0) {
            let str = strInfoLines[0];
            for (let i = 1; i < strInfoLines.length; i++) {
                const line = strInfoLines[i];
                str += '\n' + line;
            }
            this.lblConsumption.string = str;
        } else {
            this.lblConsumption.string = '';
        }

    }

    onClick() {
        //检查建筑材料
        let buildMats = [];
        for (let i = 0; i < 4; i++) {
            let mat = this.info['BuildMat' + i];
            if (mat && mat.length > 0) {
                let count = this.info['BuildMat' + i + 'Count'];
                buildMats.push([mat, count]);
            }
        }
        let enough = true;
        buildMats.forEach(mat => {
            let cargoData = DataMgr.myCargoData.find(data => data.id == mat[0]);
            if (cargoData.amount < mat[1]) {
                enough = false;
            }
        })

        if (enough) {
            BuildPanel.Hide();
            ArkUI.Instance.enterBuildMode(this.info);
        } else {
            DialogPanel.PopupWith1Button('建筑材料不足', '', '确定', null);
        }
    }
}
