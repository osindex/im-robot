const http = require('../config/fly')
const cheerio = require('cheerio') // 网站内容抓取
const ONE = 'http://v1.hitokoto.cn/' // 一言
const POISON = 'https://8zt.cc/' //毒鸡汤网站
const TXHOST = 'https://api.tianapi.com/txapi/' // 天行host 官网：tianapi.com
const config = require('../config')
/**
 * 获取每日一句
 */
async function getOne() {
    try {
        let data = await http.get(ONE, { c: 'i' })
        const todayOne = data.hitokoto
        return todayOne
    } catch (err) {
        console.log('错误', err)
        return err
    }
}

/**
 * 获取每日毒鸡汤
 */
async function getSoup() {
    try {
        let res = await http.get(POISON)
        let $ = cheerio.load(res)
        const content = $('#sentence').text()
        return content
    } catch (err) {
        console.error('err')
        return err
    }
}

/**
 * 获取全国肺炎数据
 */
function getChinaFeiyan() {
    return new Promise((resolve, reject) => {
        http.get('https://c.m.163.com/ug/api/wuhan/app/data/list-total', { t: new Date().getTime() }).then(
            response => {
                resolve(response)
            }
        ).catch(err => {
            reject(err)
        })
    })
}
/**
 * 获取省份肺炎数据
 */
async function getProvinceFeiyan(name) {
    return new Promise((resolve, reject) => {
        http.get('https://gwpre.sina.cn/interface/fymap2020_data.json', { t: new Date().getTime() }).then(
                response => {
                    try {
                        const res = response
                        res.data.list.forEach(item => {
                            if (name === item.name) {
                                resolve(item)
                                return
                            }
                        })
                    } catch (error) {
                        reject(error)
                    }
                }
            )
            .catch(err => {
                reject(err)
            })
    })
}
/**
 * 获取神回复
 */
async function getGodReply() {
    const url = TXHOST + 'godreply/index'
    try {
        let content = await http.get(url, {
            key: config.appToken.tianxin
        })
        if (content.code === 200) {
            return content.newslist[0]
        } else {
            console.log('获取接口失败', content.msg)
        }
    } catch (err) {
        console.log('获取接口失败', err)
    }
}
/**
 * 每日英语一句话
 */
async function getEnglishOne() {
    const url = TXHOST + 'ensentence/index'
    try {
        let content = await http.get(url, {
            key: config.appToken.tianxin
        })
        if (content.code === 200) {
            return `en：${content.newslist[0].en}\nzh：${content.newslist[0].zh}` //en英文  zh中文
        } else {
            console.log('获取接口失败', content.msg)
        }
    } catch (err) {
        console.log('获取接口失败', err)
    }
}
module.exports = {
    getOne,
    getSoup,
    getChinaFeiyan,
    getProvinceFeiyan,
    getGodReply,
    getEnglishOne
}