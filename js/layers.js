addLayer("b", {
    name: "b", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new ExpantaNum(0),
    }},
    color: "#0000FF",
    requires: new ExpantaNum(10), // Can be a function that takes requirement increases into account
    resource: "basic", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        exp = new ExpantaNum(0.25)
        if (hasUpgrade("b",42)) exp = exp.add(0.05)
        if (hasUpgrade("p",12)) exp = exp.add(0.03)
        if (hasUpgrade("b",74)) exp = exp.add(0.03)

        if(inChallenge("p",21)||inChallenge("p",31)) exp = new ExpantaNum(0.01)
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new ExpantaNum(1)
        if (inChallenge("p",11)||inChallenge("p",31)) mult = mult.div(1e50)

        if (hasUpgrade("b",12)) mult = mult.times(2)
        if (hasUpgrade("b",14)&&!(inChallenge("b",22)||inChallenge("b",31)||inChallenge("b",41))) mult = mult.times(upgradeEffect("b",14))
        if (hasUpgrade("b",22)) mult = mult.times(upgradeEffect("b",22))
        if (hasUpgrade("b",41)&&getBuyableAmount("b",11).gte(1))  mult = mult.times(buyableEffect("b",11).pow(0.3))
        if (getBuyableAmount("b",12).gte(1) && !inChallenge("p",11)) mult = mult.times(buyableEffect("b",12))
        if (hasUpgrade("p",11)) mult = mult.times(2)
        if (hasUpgrade("p",14)) mult = mult.times(15)
        if (hasUpgrade("b",61) && player.p.unlocked) mult = mult.times((tmp.p.effect).pow(0.345))
        if (player.ub.unlocked) mult = mult.times(tmp.ub.effect)
        if (hasUpgrade("ub",12)) mult = mult.times(upgradeEffect("ub",12))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        pow = new ExpantaNum(1)
        if (hasUpgrade("b",32)&&!inChallenge("b",41)) pow = pow.times(1.5)
        if (hasUpgrade("b",55)) pow = pow.times(1.1)
        if (hasUpgrade("b",65)) pow = pow.times(upgradeEffect("b",65))
        if (inChallenge("p",22)||inChallenge("p",31)) pow = pow.times(0.5)
        return pow
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset for basic", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    passiveGeneration() {
        rate = new ExpantaNum(0)
        if (hasMilestone("p",3)) rate = 1
        return rate
    },
    doReset(resettingLayer) {
        let keep = []
        if (resettingLayer == "p" && hasMilestone("p",0)) keep.push("upgrades")
        if (resettingLayer == "p" && hasMilestone("p",1)) keep.push("buyables")
        if (resettingLayer == "p" && hasMilestone("p",2)) keep.push("challenges")

        if (layers[resettingLayer].row > this.row) layerDataReset("b", keep)
    },
    upgrades:{
        row:10,
        column:5,
        11:{
            title:"#0",
            description:"Gain x2 points.",
            cost:()=>new ExpantaNum(1),
            unlocked() {
                return true
            }
        },
        12:{
            title:"#1",
            description:"Gain x2 basics.",
            cost:()=>new ExpantaNum(4),
            unlocked() {
                return hasUpgrade("b",11)
            }
        },
        13:{
            title:"#2",
            description:"Boost point gain based on basics.",
            effect:()=>hasUpgrade("ub",31) ? new ExpantaNum("1e3000").times(player.b.points.add(1).ln().pow(10)).add(1).floor() : player.b.points.add(1).pow(0.35).pow(hasUpgrade("p",33)? 1.44 : hasUpgrade("b",23) ? 1.2 : 1).floor().min(new ExpantaNum("1e3000")),
            cost:()=>new ExpantaNum(6),
            effectDisplay:()=>{return `x${upgradeEffect("b",13)}`},
            unlocked() {
                return hasUpgrade("b",12)
            }
        },
        14:{
            title:"#3",
            description:"Boost basic gain based on points.",
            effect:()=>player.points.add(1).pow(0.4).pow(0.6).pow(hasUpgrade("p",34)? 1.44 : hasUpgrade("b",24) ? 1.2 : 1).floor().min(new ExpantaNum("1e3000")),
            cost:()=>new ExpantaNum(25),
            effectDisplay:()=>{return `x${upgradeEffect("b",14)}`},
            unlocked() {
                return hasUpgrade("b",13)
            }
        },
        15:{
            title:"#4",
            description:"Unlock a basic challenge.",
            cost:()=>new ExpantaNum(50),
            unlocked() {
                return hasUpgrade("b",13)
            }
        },
        21:{
            title:"#5",
            description:"Point boosts itself.",
            cost:()=>new ExpantaNum(150),
            effect:()=>hasUpgrade("b",44) ? player.points.add(1).ln().pow(hasUpgrade("ub",24) ? 2.25 : hasUpgrade("b",33) ? 1.2 : 1).floor().add(1).min(new ExpantaNum("1e3000")):player.points.add(1).log10().pow(hasUpgrade("b",33) ? 1.2 : 1).floor().add(1).min(new ExpantaNum("1e3000")),
            effectDisplay:()=>{return `x${upgradeEffect("b",21)}`},
            unlocked() {
                return hasChallenge("b",11)
            }
        },
        22:{
            title:"#6",
            description:"Basic boosts itself.",
            cost:()=>new ExpantaNum(500),
            effect:()=>hasUpgrade("b",45) ? player.b.points.add(1).ln().pow(hasUpgrade("ub",24) ? 2.25 : hasUpgrade("b",33) ? 1.2 : 1).floor().add(1).min(new ExpantaNum("1e3000")):player.b.points.add(1).log10().add(1).pow(0.75).pow(hasUpgrade("b",34) ? 1.2 : 1).floor().min(new ExpantaNum("1e3000")),
            effectDisplay:()=>{return `x${upgradeEffect("b",22)}`},
            unlocked() {
                return hasUpgrade("b",21)
            }
        },
        23:{
            title:"#7",
            description:"Basic upgrade #2 is raised to ^1.2",
            cost:()=>new ExpantaNum(700),
            unlocked() {
                return hasUpgrade("b",22)
            }
        },
        24:{
            title:"#8",
            description:"Basic upgrade #3 is raised to ^1.2",
            cost:()=>new ExpantaNum(1000),
            unlocked() {
                return hasUpgrade("b",23)
            }
        },
        25:{
            title:"#9",
            description:"Unlock a basic challenge.",
            cost:()=>new ExpantaNum(2000),
            unlocked() {
                return hasUpgrade("b",24)
            }
        },
        31:{
            title:"#10",
            description:"Point gain is raised to ^1.5",
            cost:()=>new ExpantaNum(8000),
            unlocked() {
                return hasChallenge("b",12)
            }
        },
        32:{
            title:"#11",
            description:"Basic gain is raised to ^1.5",
            cost:()=>new ExpantaNum(20000),
            unlocked() {
                return hasUpgrade("b",31)
            }
        },
        33:{
            title:"#12",
            description:"Basic upgrade #5 is raised to ^1.2",
            cost:()=>new ExpantaNum(1e10),
            unlocked() {
                return hasUpgrade("b",32)
            }
        },
        34:{
            title:"#13",
            description:"Basic upgrade #6 is raised to ^1.2",
            cost:()=>new ExpantaNum(1e12),
            unlocked() {
                return hasUpgrade("b",33)
            }
        },
        35:{
            title:"#14",
            description:"Unlock a basic challenge.",
            cost:()=>new ExpantaNum("2e12"),
            unlocked() {
                return hasUpgrade("b",34)
            }
        },
        41:{
            title:"#15",
            description:"\"point boost I\" also affects basic gain with a reduced effect.",
            cost:()=>new ExpantaNum("1e16"),
            unlocked() {
                return hasChallenge("b",21)
            }
        },
        42:{
            title:"#16",
            description:"Add 0.05 to basic gain base.",
            cost:()=>new ExpantaNum("1e37"),
            unlocked() {
                return hasUpgrade("b",41)
            }
        },
        43:{
            title:"#17",
            description:"Unlock a basic challenge.",
            cost:()=>new ExpantaNum("1e140"),
            unlocked() {
                return hasUpgrade("b",42)
            }
        },
        44:{
            title:"#18",
            description:"Point upgrade #5's formula is better.",
            cost:()=>new ExpantaNum("1e143"),
            unlocked() {
                return hasChallenge("b",31)
            }
        },
        45:{
            title:"#19",
            description:"Point upgrade #6's formula is better. Unlock prestige!",
            cost:()=>new ExpantaNum("1e144"),
            unlocked() {
                return hasUpgrade("b",44)
            }
        },
        51:{
            title:"#20",
            description:"Gain x4 points.",
            cost:()=>new ExpantaNum("1e150"),
            unlocked() {
                return hasMilestone("p",1)
            }
        },
        52:{
            title:"#21",
            description:"Gain x4 basics.",
            cost:()=>new ExpantaNum("1e155"),
            unlocked() {
                return hasUpgrade("b",51)
            }
        },
        53:{
            title:"#22",
            description:"\"basic boost I\" also affects point gain with a reduced effect.",
            cost:()=>new ExpantaNum("1e260"),
            unlocked() {
                return hasChallenge("p",11)
            }
        },
        54:{
            title:"#23",
            description:"Add 0.05 to prestige boost exp.",
            cost:()=>new ExpantaNum("1e275"),
            unlocked() {
                return hasUpgrade("b",53)
            }
        },
        55:{
            title:"#24",
            description:"Basic gain is raised to ^1.1,Unlock a prestige upgrade.",
            cost:()=>new ExpantaNum("1e285"),
            unlocked() {
                return hasUpgrade("b",54)
            }
        },
        61:{
            title:"#25",
            description:"Prestige also affects basic gain with a reduced effect.",
            cost:()=>new ExpantaNum("1e6130"),
            unlocked() {
                return hasUpgrade("p",44)
            }
        },
        62:{
            title:"#26",
            description:"Point gain is raised to ^1.15",
            cost:()=>new ExpantaNum("1e6333"),
            unlocked() {
                return hasUpgrade("b",61)
            }
        },
        63:{
            title:"#27",
            description:"Increase the purchase limit of \"basic boost I\" by 10.",
            cost:()=>new ExpantaNum("1e7300"),
            unlocked() {
                return hasUpgrade("b",62)
            }
        },
        64:{
            title:"#28",
            description:"A point gain power based on your basic.(You can only choose one between this and Basic upgrade #29!)And Unlock a basic challenge.",
            cost:()=>new ExpantaNum("1e7340"),
            effect(){return hasUpgrade("b",71) ? player.points.add(1).ln().add(1).log10().add(1).ln().div(75.5).add(1).min(1.169) : player.points.add(1).log10().add(1).log10().add(1).ln().div(100).add(1).min(1.169)},
            effectDisplay() {return `^${format(upgradeEffect("b",64))}`},
            unlocked() {
                return hasUpgrade("b",63) && (!hasUpgrade("b",65) || hasChallenge("p",22) || hasUpgrade("b",64))
            }
        },
        65:{
            title:"#29",
            description:"A basic gain power based on your points.(You can only choose one between this and Basic upgrade #28!)And Unlock a prestige challenge.",
            cost:()=>new ExpantaNum("1e7340"),
            effect(){return hasUpgrade("b",72) ? player.points.add(1).ln().add(1).log10().add(1).log10().div(62.5).add(1).min(1.142) : player.points.add(1).log10().add(1).log10().add(1).log10().div(100).add(1).min(1.142)},
            effectDisplay() {return `^${format(upgradeEffect("b",65))}`},
            unlocked() {
                return hasUpgrade("b",63) && (!hasUpgrade("b",64) || hasChallenge("p",21) || hasUpgrade("b",65))
            }
        },
        71:{
            title:"#30",
            description:"Basic upgrade #28's formula is better.",
            cost:()=>new ExpantaNum("1e11350"),
            unlocked() {
                return hasUpgrade("ub",35)
            }
        },
        72:{
            title:"#31",
            description:"Basic upgrade #29's formula is better.",
            cost:()=>new ExpantaNum("1e11375"),
            unlocked() {
                return hasUpgrade("b",71)
            }
        },
        73:{
            title:"#32",
            description:"Point gain is raised to ^1.2",
            cost:()=>new ExpantaNum("1e11450"),
            unlocked() {
                return hasUpgrade("b",72)
            }
        },
        74:{
            title:"#33",
            description:"Add 0.03 to basic gain base.",
            cost:()=>new ExpantaNum("1e12535"),
            unlocked() {
                return hasUpgrade("b",73)
            }
        },
        75:{
            title:"#34",
            description:"Unlock a prestige upgrade.",
            cost:()=>new ExpantaNum("1e13530"),
            unlocked() {
                return hasUpgrade("b",73)
            }
        },
    },
    challenges:{
        row:10,
        column:2,
        11:{
            name:"Pointless I",
            challengeDescription:"Point gain is divided by 100",
            goalDescription:`${new ExpantaNum(5)} points.`,
            canComplete:()=>player.points.gte(5),
            rewardDescription:"Double point gain, unlock a basic upgrade.",
            unlocked() {
                return hasUpgrade("b",15)
            }
        },
        12:{
            name:"Pointless II",
            challengeDescription:"Point gain is divided by 666",
            goalDescription:`${new ExpantaNum(35)} points.`,
            canComplete:()=>player.points.gte(35),
            rewardDescription:"Triple point gain, unlock a basic upgrade.",
            unlocked() {
                return hasUpgrade("b",25)
            }
        },
        21:{
            name:"Pointless III",
            challengeDescription:"Point gain is raised to ^0.3",
            goalDescription:`${new ExpantaNum(30000)} points.`,
            canComplete:()=>player.points.gte(30000),
            rewardDescription:"Unlock a basic buyable and a basic upgrade.",
            unlocked() {
                return hasUpgrade("b",35)
            }
        },
        22:{
            name:"Upgradeless I",
            challengeDescription:"Basic upgrade #2, #3 are useless.",
            goalDescription:`${new ExpantaNum(1e50)} points.`,
            canComplete:()=>player.points.gte(1e50),
            rewardDescription:"Unlock a basic buyable and a basic challenge.",
            unlocked() {
                return hasUpgrade("b",43)
            }
        },
        31:{
            name:"Basic challenge pack",
            challengeDescription:"Run \"Pointless I\",\"Pointless II\",\"Pointless III\" and \"Upgradeless I\".",
            goalDescription:`${new ExpantaNum(1e15)} points.`,
            canComplete:()=>player.points.gte(1e15),
            rewardDescription:"Unlock a basic upgrade.",
            unlocked() {
                return hasChallenge("b",22)
            }
        },
        32:{
            name:"Pointless IV",
            challengeDescription:"Point gain is raised to ^0.111",
            goalDescription:`${new ExpantaNum(1e32)} points.`,
            canComplete:()=>player.points.gte(1e32),
            rewardDescription:"Unlock a prestige upgrade.",
            unlocked() {
                return hasUpgrade("p",15)
            }
        },
        41:{
            name:"Upgradeless II",
            challengeDescription:"Basic upgrade #2, #3, #10, #11 are useless.",
            goalDescription:`${new ExpantaNum("1e394")} points.`,
            canComplete:()=>player.points.gte(new ExpantaNum("1e394")),
            rewardDescription:"Unlock a prestige upgrade.",
            unlocked() {
                return hasChallenge("p",12)
            }
        },
        42:{
            name:"Pointless VI",
            challengeDescription:"All point multipliers are disabled except multipliers from challenges.",
            goalDescription:`${new ExpantaNum("1000")} points.`,
            canComplete:()=>player.points.gte(new ExpantaNum("1000")),
            rewardDescription:"Unlock a prestige challenge.",
            unlocked() {
                return hasUpgrade("b",64)
            }
        },
    },
    buyables:{
        11:{
            title:"Point boost I",
            cost(x) { return new ExpantaNum(1e12).times(x.add(1).pow(2+x)) },
            display() { return `Multiply point gain by ${new ExpantaNum(this.effect()).floor()}<br>
            cost:${new ExpantaNum(this.cost()).floor()} basics` },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasChallenge("b",21)
            },
            effect(x) { return new ExpantaNum(10).pow(x).pow(1+x/10).pow(1+x/20)},
            purchaseLimit() {
                limit = 10
                if (hasUpgrade("p",31)) limit = limit + 5
                if (hasUpgrade("p",51)) limit = limit + 5
                if (hasUpgrade("p",62)) limit = limit + 20
                return limit
            }
        },
        12:{
            title:"Basic boost I",
            cost(x) { return new ExpantaNum(1e130).pow(1+x/8) },
            display() { return `Multiply basic gain by ${new ExpantaNum(this.effect()).floor()}<br>
            cost:${new ExpantaNum(this.cost()).floor()} basics` },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasChallenge("b",22)
            },
            effect(x) { return new ExpantaNum(3).pow(x).pow(1+x/50).pow(1+x/100)},
            purchaseLimit() {
                limit = 10
                if (hasUpgrade("p",32)) limit = limit + 5
                if (hasUpgrade("b",63)) limit = limit + 10
                if (hasUpgrade("p",51)) limit = limit + 5
                if (hasUpgrade("p",62)) limit = limit + 20
                return limit
            }
        }
    }
}),
addLayer("p", {
    name: "p", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new ExpantaNum(0),
    }},
    color: "#03FF03",
    branches:["b"],
    requires: new ExpantaNum("1e150"), // Can be a function that takes requirement increases into account
    resource: "prestige point", // Name of prestige currency
    baseResource: "basic", // Name of resource prestige is based on
    baseAmount() {return player.b.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        exp = new ExpantaNum(0.05)
        if (hasUpgrade("p",24)) exp = exp.add(0.01)
        if (getBuyableAmount("p",11).gte(1)) exp = exp.add(buyableEffect("p",11))
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new ExpantaNum(1)
        if (hasUpgrade("p",21)) mult = mult.times(3)
        if (hasUpgrade("p",22)) mult = mult.times(upgradeEffect("p",22))
        if (hasUpgrade("p",23)) mult = mult.times(upgradeEffect("p",23))
        if (hasUpgrade("ub",33)) mult = mult.times(upgradeEffect("ub",33))
        if (hasUpgrade("p",61)) mult = mult.times(upgradeEffect("p",61))
        if (player.ub.unlocked && hasUpgrade("ub",23)) mult = mult.times(tmp.ub.effect)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        pow = new ExpantaNum(1)
        if (hasUpgrade("p",43)) pow = pow.times(1.15)
        if (hasUpgrade("ub",32)) pow = pow.times(1.35)
        return pow
    },
    effectBase() {
        let base = new ExpantaNum(0.8);
        if (hasUpgrade("b",54)) base = base.add(0.05)
        if (hasUpgrade("ub",22)) base = base.add(0.03)
        if (hasUpgrade("p",63)) base = base.add(0.05)
        return base.pow(tmp.p.power);
    },
    power() {
        let power = new ExpantaNum(1);
        if (hasUpgrade("ub",35)) power = power.times(1.1);
        return power;
    },
    effect() {
        return ExpantaNum.pow(player.p.points,tmp.p.effectBase).add(1).max(0);
    },
    effectDescription() {
        return "which are boosting Point generation by "+tmp.p.effect.floor()+"x"
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("b",45) || player.p.unlocked},
    milestones:{
        0:{
            requirementDescription: "100 Prestige points",
            effectDescription: "Basic upgrades doesn't reset on prestige.",
            done() {return player.p.points.gte(100)}
        },
        1:{
            requirementDescription: "4000 Prestige points",
            effectDescription: "Basic buyables doesn't reset on prestige. Unlock a basic upgrade.",
            done() {return player.p.points.gte(4000)}
        },
        2:{
            requirementDescription: "90000 Prestige points",
            effectDescription: "Basic challenges doesn't reset on prestige.",
            done() {return player.p.points.gte(90000)}
        },
        3:{
            requirementDescription: "200000 Prestige points",
            effectDescription: "Auto generate basics.",
            done() {return player.p.points.gte(200000)}
        }
    },
    upgrades:{
        row:10,
        column:5,
        11:{
            title:"Prestige #0",
            description:"Double gain of all previous resources(points and basics).",
            cost:new ExpantaNum(1),
            unlocked() {
                return player.p.unlocked
            }
        },
        12:{
            title:"Prestige #1",
            description:" Add 0.03 to basic gain base.",
            cost:new ExpantaNum(100),
            unlocked() {
                return player.p.unlocked
            }
        },
        13:{
            title:"Prestige #2",
            description:"Gain x20 points.",
            cost:new ExpantaNum(1000),
            unlocked() {
                return player.p.unlocked
            }
        },
        14:{
            title:"Prestige #3",
            description:"Gain x15 basics.",
            cost:new ExpantaNum(10000),
            unlocked() {
                return player.p.unlocked
            }
        },
        15:{
            title:"Prestige #4",
            description:"Point gain is raised to ^1.1. Unlock a basic challenge.",
            cost:new ExpantaNum(1e6),
            unlocked() {
                return player.p.unlocked
            }
        },
        21:{
            title:"Prestige #5",
            description:"Gain x3 prestige points.",
            cost:new ExpantaNum(1e6),
            unlocked() {
                return hasChallenge("b",32)
            }
        },
        22:{
            title:"Prestige #6",
            description:"Gain more prestige points based on your points.",
            effect() {return hasUpgrade("p",41) ? player.points.add(1).log10().pow(0.3).add(1).min(new ExpantaNum("1e3000")) : player.points.add(1).log10().add(1).ln().add(1).min(new ExpantaNum("1e3000"))},
            cost:new ExpantaNum(5e6),
            effectDisplay:()=>{return `x${upgradeEffect("p",22)}`},
            unlocked() {
                return hasUpgrade("b",21)
            }
        },
        23:{
            title:"Prestige #7",
            description:"Gain more prestige points based on your basics.",
            effect() {return hasUpgrade("p",42) ? player.b.points.add(1).ln().add(1).min(new ExpantaNum("1e3000")) : player.b.points.add(1).ln().add(1).ln().add(1).min(new ExpantaNum("1e3000"))},
            effectDisplay:()=>{return `x${upgradeEffect("p",23)}`},
            cost:new ExpantaNum(1e8),
            unlocked() {
                return hasUpgrade("b",21)
            }
        },
        24:{
            title:"Prestige #8",
            description:"Add 0.01 to prestige gain base.",
            cost:new ExpantaNum(1e9),
            unlocked() {
                return hasUpgrade("b",21)
            }
        },
        25:{
            title:"Prestige #9",
            description:"Unlock a prestige challenge.",
            cost:new ExpantaNum(1e10),
            unlocked() {
                return hasUpgrade("b",21)
            }
        },
        31:{
            title:"Prestige #10",
            description:"Increase the purchase limit of \"point boost I\" by 5.",
            cost:new ExpantaNum(1e18),
            unlocked() {
                return hasUpgrade("b",55)
            }
        },
        32:{
            title:"Prestige #11",
            description:"Increase the purchase limit of \"basic boost I\" by 5.",
            cost:new ExpantaNum(1e38),
            unlocked() {
                return hasUpgrade("p",31)
            }
        },
        33:{
            title:"Prestige #12",
            description:"Basic upgrade #2 is raised to ^1.2(Which needs BU #7)",
            cost:new ExpantaNum(1e41),
            unlocked() {
                return hasUpgrade("p",32) && hasUpgrade("b",23)
            }
        },
        34:{
            title:"Prestige #13",
            description:"Basic upgrade #3 is raised to ^1.2(Which needs BU #8)",
            cost:new ExpantaNum(1e90),
            unlocked() {
                return hasUpgrade("p",33) && hasUpgrade("b",24)
            }
        },
        35:{
            title:"Prestige #14",
            description:"Unlock a prestige challenge.",
            cost:new ExpantaNum("1e358"),
            unlocked() {
                return hasUpgrade("p",34)
            }
        },
        41:{
            title:"Prestige #15",
            description:"Prestige upgrade #6's formula is better.",
            cost:new ExpantaNum("1e358"),
            unlocked() {
                return hasChallenge("b",41)
            }
        },
        42:{
            title:"Prestige #16",
            description:"Prestige upgrade #7's formula is better.",
            cost:new ExpantaNum("1e359"),
            unlocked() {
                return hasUpgrade("p",41)
            }
        },
        43:{
            title:"Prestige #17",
            description:"Prestige point gain is raised to ^1.15",
            cost:new ExpantaNum("1e362"),
            unlocked() {
                return hasUpgrade("p",42)
            }
        },
        44:{
            title:"Prestige #18",
            description:"Unlock a basic upgrade.",
            cost:new ExpantaNum("1e420"),
            unlocked() {
                return hasUpgrade("p",43)
            }
        },
        45:{
            title:"Prestige #19",
            description:"Unlock Unbasic.",
            cost:new ExpantaNum("1e514"),
            unlocked() {
                return hasChallenge("p",21) && hasChallenge("p",22)
            }
        },
        51:{
            title:"Prestige #20",
            description:"Increase the purchase limit for basic buyables by 5.",
            cost:new ExpantaNum("1e618"),
            unlocked() {
                return hasUpgrade("ub",25)
            }
        },
        52:{
            title:"Prestige #21",
            description:"Point gain is raised to ^1.15",
            cost:new ExpantaNum("1e636"),
            unlocked() {
                return hasUpgrade("p",51)
            }
        },
        53:{
            title:"Prestige #22",
            description:"Boost unbasic gain based on your prestige points.",
            cost:new ExpantaNum("1e743"),
            effect() {return player.p.points.add(1).log10().pow(4.5).min(new ExpantaNum("1e3000"))},
            effectDisplay:()=>{return `x${upgradeEffect("p",53)}`},
            unlocked() {
                return hasUpgrade("p",52)
            }
        },
        54:{
            title:"Prestige #23",
            description:"Boost point gain based on your unbasics.",
            cost:new ExpantaNum("1e745"),
            effect() {return player.ub.points.add(1).ln().pow(120).add(1).min(new ExpantaNum("1e3000"))},
            effectDisplay:()=>{return `x${upgradeEffect("p",54)}`},
            unlocked() {
                return hasUpgrade("p",53)
            }
        },
        55:{
            title:"Prestige #24",
            description:"Unlock a prestige challenge.",
            cost:new ExpantaNum("1e824"),
            unlocked() {
                return hasUpgrade("p",54)
            }
        },
        61:{
            title:"Prestige #25",
            description:"Gain more prestige based on you points and basic.",
            cost:new ExpantaNum("1e2430"),
            effect() {return player.b.points.add(1).log10().pow(player.points.add(1).log(10).add(1).log10().add(1)).add(1).min(new ExpantaNum("1e3000"))},
            effectDisplay:()=>{return `x${upgradeEffect("p",61)}`},
            unlocked() {
                return hasUpgrade("b",75)
            }
        },
        62:{
            title:"Prestige #26",
            description:"Increase the purchase limit of basic buyables by 20.",
            cost:new ExpantaNum("1e2475"),
            unlocked() {
                return hasUpgrade("p",61)
            }
        },
        63:{
            title:"Prestige #27",
            description:"Add 0.05 to prestige boost base.",
            cost:new ExpantaNum("1e3063"),
            unlocked() {
                return hasUpgrade("p",62)
            }
        },
        64:{
            title:"Prestige #28",
            description:"Add 0.07 to unbasic gain base.",
            cost:new ExpantaNum("1e3115"),
            unlocked() {
                return hasUpgrade("p",63)
            }
        },
        65:{
            title:"Prestige #29",
            description:"Unlock reincarnation!",
            cost:new ExpantaNum("1e3450"),
            unlocked() {
                return hasUpgrade("p",64)
            }
        },
    },
    challenges:{
        row:10,
        column:2,
        11:{
            name:"Basicless I",
            challengeDescription:"Basic gain is divided by 1e50, \"Basic boost I\" is disabled.",
            goalDescription:`${new ExpantaNum(1e25)} basics.`,
            canComplete:()=>player.b.points.gte(1e25),
            rewardDescription:"Unlock a basic upgrade.",
            unlocked() {
                return hasUpgrade("p",25)
            }
        },
        12:{
            name:"Pointless V",
            challengeDescription:"\"Point boost I\" is disabled. Point gain is raised to ^0.0375",
            goalDescription:`${new ExpantaNum("1e415")} basics.`,
            canComplete:()=>player.b.points.gte(new ExpantaNum("1e415")),
            rewardDescription:"Unlock a basic challenge.",
            unlocked() {
                return hasUpgrade("p",35)
            }
        },
        21:{
            name:"Basicless II",
            challengeDescription:"Basic gain base is always 0.01",
            goalDescription:`${new ExpantaNum("1e1570")} basics.`,
            canComplete:()=>player.b.points.gte("1e1570"),
            rewardDescription:"You can buy another basic upgrade now.",
            unlocked() {
                return hasChallenge("b",42)
            }
        },
        22:{
            name:"Basicless III",
            challengeDescription:"Basic gain is raised to ^0.5",
            goalDescription:`${new ExpantaNum("1e1070")} basics.`,
            canComplete:()=>player.b.points.gte("1e1070"),
            rewardDescription:"You can buy another basic upgrade now.",
            unlocked() {
                return hasUpgrade("b",65)
            }
        },
        31:{
            name:"Prestige challenge pack",
            challengeDescription:"Run \"Basicless I\",\"Basicless II\",\"Pointless V\" and \"Basicless III\".",
            goalDescription:`${new ExpantaNum("1e450")} basics.`,
            canComplete:()=>player.b.points.gte("1e450"),
            rewardDescription:"Unlock a unbasic upgrade.",
            unlocked() {
                return hasUpgrade("p",55)
            }
        },
    },
    buyables:{
        11:{
            title:"Prestige boost I",
            cost(x) { return new ExpantaNum("1e510").pow(x.add(1)) },
            display() { return `Add ${format(this.effect())} to prestige gain base<br>
            cost:${this.cost()} prestige points.` },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade("ub",15)
            },
            effect(x) { return new ExpantaNum(0.01).times(x)},
            purchaseLimit() {
                limit = 5
                return limit
            }
        },
    }
}),
addLayer("ub", {
    name: "ub", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "U", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new ExpantaNum(0),
    }},
    color: "#6509DD",
    branches:["b"],
    requires: new ExpantaNum("1e7510"), // Can be a function that takes requirement increases into account
    resource: "unbasic", // Name of prestige currency
    baseResource: "basic", // Name of resource prestige is based on
    baseAmount() {return player.b.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        exp = new ExpantaNum(0.05)
        if (hasUpgrade("p",64)) exp = exp.add(0.07)
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new ExpantaNum(1)
        if (hasUpgrade("ub",11)) mult = mult.times(2)
        if (hasUpgrade("p",53)) mult = mult.times(upgradeEffect("p",53))
        if (hasUpgrade("ub",34)) mult = mult.times(upgradeEffect("ub",34))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        pow = new ExpantaNum(1)
        return pow
    },
    effectBase() {
        let base = new ExpantaNum(0.1);
        if (hasUpgrade("ub",21)) base = base.add(0.1);
        if (hasUpgrade("ub",35)) base = base.add(0.1);
        return base.pow(tmp.p.power);
    },
    power() {
        let power = new ExpantaNum(1);
        return power;
    },
    doReset(resettingLayer) {
        let keep = []
        if (resettingLayer=="p" && hasUpgrade("ub",14)) keep.push("upgrades")

        if (layers[resettingLayer].row > this.row) layerDataReset("ub", keep)
    },
    effect() {
        return ExpantaNum.pow(player.ub.points,tmp.ub.effectBase).add(1).pow(0.75).max(0).min("1e2500");
    },
    effectDescription() {
        return "which are boosting Basic gain by "+tmp.ub.effect.floor()+"x"
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "u", description: "U: Reset for Unbasic", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("p",45) || player.ub.unlocked},
    passiveGeneration() {
        rate = new ExpantaNum(0)
        if (hasUpgrade("ub",13)) rate = 0.25
        return rate
    },
    upgrades:{
        row:10,
        column:5,
        11:{
            title:"#-1",
            description:"Gain x2 unbasics.",
            cost() {return new ExpantaNum(50)},
            unlocked() {
                return player.ub.unlocked
            },
        },
        12:{
            title:"#-2",
            description:"Boost basic gain based on your unbasic.",
            cost() {return new ExpantaNum(125)},
            effect() {return player.ub.points.pow(0.3).add(1).ln().add(1).min(new ExpantaNum("1e4500"))},
            effectDisplay() {return `x${format(upgradeEffect("ub",12))}`},
            unlocked() {
                return hasUpgrade("ub",11)
            },
        },
        13:{
            title:"#-3",
            description:"Auto generate unbasic.",
            cost() {return new ExpantaNum(200)},
            unlocked() {
                return hasUpgrade("ub",12)
            },
        },
        14:{
            title:"#-4",
            description:"Prestige doesn't reset unbasic upgrades.",
            cost() {return new ExpantaNum(350)},
            unlocked() {
                return hasUpgrade("ub",13)
            },
        },
        15:{
            title:"#-5",
            description:"Unlock a prestige buyable.", 
            cost() {return new ExpantaNum(350)},
            unlocked() {
                return hasUpgrade("ub",13)
            },
        },
        21:{
            title:"#-6",
            description:"Unbasic boost effect is better.", 
            cost() {return new ExpantaNum(1e9)},
            unlocked() {
                return hasUpgrade("ub",15)
            },
        },
        22:{
            title:"#-7",
            description:"Add 0.03 to prestige boost base.", 
            cost() {return new ExpantaNum(1e10)},
            unlocked() {
                return hasUpgrade("ub",21)
            },
        },
        23:{
            title:"#-8",
            description:"Unbasic also boosts prestige points gain.", 
            cost() {return new ExpantaNum(6e10)},
            unlocked() {
                return hasUpgrade("ub",22)
            },
        },
        24:{
            title:"#-9",
            description:"Basic upgrade #6 and #7 are raised to ^1.875", 
            cost() {return new ExpantaNum(1e11)},
            unlocked() {
                return hasUpgrade("ub",23)
            },
        },
        25:{
            title:"#-10",
            description:"Unlock a prestige upgrade.", 
            cost() {return new ExpantaNum(5e11)},
            unlocked() {
                return hasUpgrade("ub",24)
            },
        },
        31:{
            title:"#-11",
            description:"Remove the cap of basic upgrade #2, but its formula is weaker.", 
            cost() {return new ExpantaNum("1e140")},
            unlocked() {
                return hasChallenge("p",31)
            },
        },
        32:{
            title:"#-12",
            description:"Prestige point gain is raised to ^1.35", 
            cost() {return new ExpantaNum("1e145")},
            unlocked() {
                return hasUpgrade("ub",31)
            },
        },
        33:{
            title:"#-13",
            description:"Prestige point boosts itself.", 
            cost() {return new ExpantaNum("1e180")},
            effect() {return player.p.points.add(1).pow(0.05).add(1).min(new ExpantaNum("1e6500"))},
            effectDisplay() {return `x${format(upgradeEffect("ub",33))}`},
            unlocked() {
                return hasUpgrade("ub",32)
            },
        },
        34:{
            title:"#-14",
            description:"Gain more unbasic based on your points.", 
            cost() {return new ExpantaNum("1e187")},
            effect() {return player.points.add(1).ln().pow(40).add(1).min(new ExpantaNum("1e6500"))},
            effectDisplay() {return `x${format(upgradeEffect("ub",34))}`},
            unlocked() {
                return hasUpgrade("ub",33)
            },
        },
        35:{
            title:"#-15",
            description:"Add 0.1 to unbasic boost base and ^1.1 prestige boost exponent. Unlock a basic upgrade.", 
            cost() {return new ExpantaNum("1e378")},
            unlocked() {
                return hasUpgrade("ub",34)
            },
        },
    }
})
