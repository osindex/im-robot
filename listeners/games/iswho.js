var { wodi } = require('../../utils/words');
var { randomNum, deepClone } = require('../../utils');

var Word = function () {

}

Word.randomWord = function () {
    return wodi[randomNum(wodi.length - 1)];
}
// 定义当前轮次游戏角色数目
Word.defRoleNum = function (playLength) {
    let Civilian, Undercover = 0
    Civilian = parseInt(playLength / 2) + 1 // 一半 + 1
    Undercover = randomNum(1, playLength - Civilian) // 随机卧底数目
    if (Undercover > 3) { // 如果卧底大于3个
        const rand = randomNum(0, Undercover - 2)
        Civilian += rand // 最少保留1个卧底 其它归到平民
        Undercover -= rand
    }
    const Blank = playLength - Civilian - Undercover // 白板人数
    return [Civilian, Undercover, Blank];
}
// 定义当前轮次每玩家对应角色
Word.defTurn = function (playsList) {
    const playLength = playsList.length
    if (playLength < 4) {
        return
    }
    const roles = this.defRoleNum(playLength)
    const roleList = deepClone(roles)
    const randomWord = randomNum(1) ? this.randomWord() : this.randomWord().reverse()
    // 难得再转化 直接汉字
    let role = '平民';
    let word = '';
    let newPlaysList = []
    for (var i = 0; i < playLength; i++) {
        var index = randomNum(playsList.length - 1); //随机下标
        if (roles[2]) {
            role = '白板';
            word = '';
            roles[2]--;
        } else if (roles[1]) {
            role = '卧底';
            word = randomWord[1];
            roles[1]--;
        } else {
            role = '平民';
            word = randomWord[0];
        }
        playsList[index].role = role
        playsList[index].word = word
        // 顺便按顺序排号
        newPlaysList.push(playsList[index])
        playsList.splice(index, 1); //    将随机出的元素在arr中删除            
        // console.log(roles)
    }
    // 排序
    newPlaysList.sort((a, b) => {
        return a.self_id - b.self_id
    })
    const first = randomNum(1, newPlaysList.length)
    return { roleList, playsList: newPlaysList, first }
}
/**
 * 下一位发言人
 * @param  {[type]} gameInfo [description]
 * @param  {[type]} current  下一位发言人的self_id
 * @return {[type]}          [description]
 */
Word.nextSay = function (gameInfo, current) {
    // 下标与self_id的关系： index + 1 = self_id
    console.log(current, '下一位发言的序号pos')
    // 设置下一位发言人
    if (!gameInfo.playsList.hasOwnProperty(current - 1)) {
        // 回到第一位
        current = 1
    }
    console.log(current, 'hasOwnProperty')
    let foundNext = false
    gameInfo.playsList.map((element, index) => {
        // 存活状态
        if (current === element.self_id) {
            // console.log(element, current, '号存活状态')
            if (element.live) {
                element.msg = '现在轮到你[' + element.self_id + '号]发言'
                element.canSay = true
                foundNext = true
            } else {
                element.msg = ''
                element.canSay = false
            }
        } else {
            element.msg = ''
            element.canSay = false
        }
        return element
    })
    console.log(foundNext, '....')
    if (foundNext) {
        // console.log(gameInfo, 'gameInfo')
        return { gameInfo, current }
    } else {
        return this.nextSay(gameInfo, current + 1)
    }
}
Word.gameOver = function (gameInfo) {
    const { roleList, playsList, first } = gameInfo
    let live = { '平民': 0, '卧底': 0, '白板': 0 }
    let liveAll = 0
    playsList.map(e => {
        if (e.live) {
            live[e.role] += 1
            liveAll++
        }
        // 只剩3人
        // 卧底全败
    })
    if (live['卧底'] === 0) {
        if (live['白板'] === 0) {
            return '游戏结束：平民胜利'
            // 平民胜利
        } else {
            return '游戏结束：白板胜利'
            // 白板胜利
        }
    } else if (liveAll <= 3) {
        return '游戏结束：卧底胜利'
        // 卧底胜利
    } else {
        return
    }
}

// console.log(Word.random());

module.exports = Word;