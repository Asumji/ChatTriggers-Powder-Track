/// <reference types="../CTAutocomplete" />

// TODO: check for 2x powder, update accordingly, calculate the required amount by current powder

import PogObject from "PogData";

const data = new PogObject("PowderTrack", {
  powder: 0,
  targetPowder: [4000000, 1000000, 7],
  dailyArray: []
});
data.save();

let display = new Display();

const bossBar = Java.type("net.minecraft.entity.boss.BossStatus"); // bossbar
function getEvent() {
  const bossBarText = bossBar.field_82827_c; // get bossbar text
  if (bossBarText.includes("§a§l00:00§r")) {
    return false
  } else {
    return bossBarText.includes("2X POWDER");
  }
}

function getDay() {
  for (let i = 0;i<data.dailyArray.length;i++) {
    if (data.dailyArray[i] != 0) {
      return i;
    }
  }
}

register("WorldLoad", () => {
  if (data.dailyArray.length == 0) {
    let curPowder = data.powder
    while (curPowder >= data.targetPowder[1]) {
      curPowder -= data.targetPowder[1]
    }
    let daily = Math.round(data.targetPowder[1] / data.targetPowder[2])
  
    for (let i=0;i<data.targetPowder[2];i++) {
      data.dailyArray.push(daily)
    }

    for (let i=0;i<data.dailyArray.length;i++) {
      if (curPowder >= data.dailyArray[i]) {
        curPowder -= data.dailyArray[i]
        data.dailyArray[i] = 0
      } else {
        data.dailyArray[i] -= curPowder
        curPowder -= curPowder
        print(curPowder)
      }
    }
    data.save()
  }
})

register("Chat", function(event) {
  let msg = ChatLib.getChatMessage(event)
  msg = msg.slice(msg.indexOf("+") + 1, msg.indexOf("Powder") - 1)

  if (msg.indexOf("Mi") == -1) {
    if (getEvent()) {
      data.powder += Number(msg.slice(0,msg.indexOf(" "))) * 2
      data.dailyArray[getDay()] -= Number(msg.slice(0,msg.indexOf(" "))) * 2
    } else {
      data.powder += Number(msg.slice(0,msg.indexOf(" ")))
      data.dailyArray[getDay()] -= Number(msg.slice(0,msg.indexOf(" ")))
    }
    data.save()

    let powderString = ""
    for (let i=0;i<data.dailyArray.length;i++) {
      powderString += "§bDay " + String(i+1) + ": " + "§a" + data.dailyArray[i] + "§r\n"
    }

    display.setLine(0, powderString);
    display.setLine(1, "§bTotal: §a" + data.powder + "§c/§a" + data.targetPowder[0] + "§r")
    display.setRenderLoc(0,250)
  }
}).setChatCriteria("&aYou received &r&b").setContains();

register("command", (...args) => {
  if (args[0] == "set") {
    if (args[1]) {
      if (!isNaN(args[1])) {
        data.powder = Number(args[1])
        data.save()
        ChatLib.chat("§aPowder set to §b" + args[1] + "§a.")
      } else {
        ChatLib.chat("§c<amount> is not a number!")
      }
    } else {
      ChatLib.chat("§cUsage: /powder set <amount>")
    }
  } else if (args[0] == "target") {
    if (args[1] && args[2] && args[3]) {
      if (!isNaN(args[1]) && !isNaN(args[2]) && !isNaN(args[3])) {
        data.targetPowder = [Number(args[1]), Number(args[2]), Number(args[3])]
        data.save()
        ChatLib.chat("§aYour target was set to a goal of §b" + args[1] + " §apowder, while gaining §b" + args[2] + " §apowder in §b" + args[3] + " §adays.")
      } else {
        ChatLib.chat("§c<goal>, <amount> or <time> is not a number!")
      }
    } else {
      ChatLib.chat("§cUsage: /powder target <goal> <amount> <time>")
    }
  } else  if (args[0] == "reset") {
    data.dailyArray = []
    data.save()
    ChatLib.chat("§aYour daily powder has been reset!")
  } else {
    ChatLib.chat("§cUsage: /powder set/target/day")
  }
}).setName("powder")