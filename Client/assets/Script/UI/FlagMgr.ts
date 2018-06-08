const { ccclass, property } = cc._decorator;

@ccclass
export class FlagMgr {

    static setFlag(spr: cc.Sprite, country: string) {
        try {
            if (FlagMgr.flagNames.find(f => f == country)) {
                cc.loader.loadRes("flags/" + country, cc.SpriteFrame, function (err, spriteFrame) {
                    console.log('err sprF', err, spriteFrame);
                    if (!err) spr.spriteFrame = spriteFrame;
                });
            } else {
                spr.spriteFrame = null;
            }
        } catch (error) {
            console.error(error);
            spr.spriteFrame = null;
        }
    }

    static flagNames = [
        "at", "au", "be", "bg", "br", "ch", "cl", "cn", "co", "cr", "cs", "de", "dk", "eng", "es", "fr", "gh", "hr", "ir", "is", "it", "jp", "kp", "kr", "ma", "mx", "ng", "nir", "nl", "pa", "pe", "pl", "pt", "py", "ru", "sa", "sco", "se", "sk", "sn", "tn", "us", "uy", "wal"
    ]
}