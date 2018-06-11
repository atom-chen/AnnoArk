

/*外部输入参数*/
// var bb1; /*攻击方坦克数量初始*/
// var cc1; /*攻击方直升机数量初始*/
// var dd1; /*攻击方炮舰数量初始*/


// var bb2; /*防守方坦克数量初始*/
// var cc2; /*防守方直升机数量初始*/
// var dd2; /*防守方炮舰数量初始*/
function battle(bb1, cc1, dd1, bb2, cc2, dd2) {/*策划设定*/
    var c1 = 20; /*攻击方坦克攻击*/
    var d1 = 100; /*攻击方坦克HP*/
    var e1 = 50; /*攻击方直升机攻击*/
    var f1 = 40; /*攻击方直升机HP*/
    var g1 = 100; /*攻击方炮舰攻击*/
    var h1 = 20; /*攻击方炮舰HP*/


    var c2 = 20; /*防守方坦克攻击*/
    var d2 = 100; /*防守方坦克HP*/
    var e2 = 50; /*防守方直升机攻击*/
    var f2 = 40; /*防守方直升机HP*/
    var g2 = 100; /*防守方炮舰攻击*/
    var h2 = 20; /*防守方炮舰HP*/

    var k3 = 1;  /*防守方属性加成*/
    var k1 = 0; /*防守方属性加成*/
    var k2; /*打肉系数-随机*/

    /*计算变量*/

    var y; /*战力差/剩余*/
    var a; /*剩余比例*/

    var z1; /*攻击方总战力*/
    var z2; /*防守方总战力*/


    /*输出变量*/
    var x; /*胜负，0为攻击方胜，1为防守方胜*/
    var bb; /*获胜方坦克数量*/
    var cc; /*获胜方直升机数量*/
    var dd; /*获胜方炮舰数量*/

    /*胜负判断*/
    z1 = (c1 * bb1 ** (k3) + e1 * cc1 ** (k3) + g1 * dd1 ** (k3)) *
        (d1 * bb1 + f1 * cc1 + h1 * dd1);

    z2 = (c2 * bb2 + e2 * cc2 ** (k3) + g2 * dd2 ** (k3)) * (1 + k1) *
        (d2 * bb2 + f2 * cc2 + h2 * dd2);

    y = z1 - z2;

    if (y >= 0) { x = 0 }
    else { x = 1 }

    /*获胜方剩余兵力*/
    if (x == 0) {
        a = y / z1;
        k2 = 1 - Math.random() * 0.3;

        bb = Math.floor(bb1 * a * k2);
        cc = Math.min(cc1, Math.floor(cc1 * a + bb1 * a * (1 - k2) * d1 / 2 / f1));
        dd = Math.min(dd1, Math.floor(dd1 * a + bb1 * a * (1 - k2) * d1 / 2 / h1));


    }

    else {
        a = -y / z2;
        k2 = 1 - Math.random() * 0.3;

        bb = Math.floor(bb2 * a * k2);
        cc = Math.min(cc2, Math.floor(cc2 * a + bb2 * a * (1 - k2) * d2 / 2 / f2));
        dd = Math.min(dd2, Math.floor(dd2 * a + bb2 * a * (1 - k2) * d2 / 2 / h2));

    }
    console.log(bb1, cc1, dd1, '|', bb2, cc2, dd2, '获胜方', x, '剩余', bb, cc, dd);
}

function battle2(dt, dc, ds, at, ac, as) {
    let d = (dt + dc + 5 * ds) * 1.05;
    let a = at + ac + 5 * as;
    if (d >= a) {
        //守方胜

    }
}

battle(100, 100, 100, 100, 100, 100);
battle(100, 0, 0, 50, 0, 0);
battle(0, 100, 0, 0, 50, 0);
battle(0, 0, 100, 0, 0, 50);
battle(5, 0, 12, 4, 0, 13);
battle(5, 0, 12, 4, 110, 9);
battle(5, 6, 0, 4, 7, 0);
battle(0, 50, 10, 0, 30, 30);
battle(0, 50, 10, 10, 30, 30);
battle(5, 3, 9, 2, 16, 0);
battle(20, 0, 0, 25, 5, 1);