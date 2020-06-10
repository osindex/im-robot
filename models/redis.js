const redis = require('redis');
const config = require('../config');

let client = redis.createClient(config.redis.port, config.redis.host);
if (config.redis.auth) {
    client.auth(config.redis.auth); // 如果没有设置密码 是不需要这一步的
}
client.on("error", function (err) {
    console.log('redis-err:', err);
});
async function delKey(...key) {
    return await new Promise((resolve) => {
        client.del(key, (err, data) => {
            return resolve(data);
        });
    });
}
// 	EXPIRE key seconds 默认 2小时
async function expireKey(key, seconds = 60 * 60 * 2) {
    return await new Promise((resolve) => {
        client.expire(key, seconds, (err, data) => {
            return resolve(data);
        });
    });
}
// 将值 value 关联到 key ，并将 key 的过期时间设为 seconds (以秒为单位)。
async function setKey(key, svalue, seconds = 60 * 5) {
    return await new Promise((resolve) => {
        if (seconds) {
            client.setex(key, seconds, svalue, (err, data) => {
                return resolve(data);
            });
        } else {
            client.set(key, svalue, (err, data) => {
                return resolve(data);
            });
        }
    });
}
async function getKey(key) {
    return await new Promise((resolve) => {
        client.get(key, (err, data) => {
            return resolve(data);
        });
    });
}
async function setScene(uid, svalue = null, scene = 'scene') {
    return await new Promise((resolve) => {
        client.hset(scene, uid, svalue || scene, (err, data) => {
            return resolve(data);
        });
    });
}
async function hasScene(uid, scene = 'scene') {
    return await new Promise((resolve) => {
        client.hexists(scene, uid, (err, data) => {
            return resolve(data);
        });
    });
}
async function getScene(uid, scene = 'scene') {
    return await new Promise((resolve) => {
        client.hget(scene, uid, (err, data) => {
            return resolve(data);
        });
    });
}
async function delScene(uid, scene = 'scene') {
    return await new Promise((resolve) => {
        client.hdel(scene, uid, (err, data) => {
            return resolve(data);
        });
    });
}
async function allScene(scene = 'scene') {
    return await new Promise((resolve) => {
        client.hkeys(scene, (err, data) => {
            return resolve(data);
        });
    });
}

async function saddScene(scene = 'scene', ...arg) {
    return await new Promise((resolve) => {
        client.sadd(scene, arg, (err, data) => {
            return resolve(data);
        });
    });
}
// 判断 svalue 元素是否是集合 scene 的成员
async function sismemberScene(scene = 'scene', svalue) {
    return await new Promise((resolve) => {
        client.sismember(scene, svalue, (err, data) => {
            return resolve(data);
        });
    });
}
// 返回集合所有成员
async function smembersScene(scene = 'scene') {
    return await new Promise((resolve) => {
        client.smembers(scene, (err, data) => {
            return resolve(data);
        });
    });
}
// 成员数目
async function scardScene(scene = 'scene') {
    return await new Promise((resolve) => {
        client.scard(scene, (err, data) => {
            return resolve(data);
        });
    });
}
// 移除集合中一个或多个成员
async function sremScene(scene = 'scene', ...arg) {
    return await new Promise((resolve) => {
        client.srem(scene, arg, (err, data) => {
            return resolve(data);
        });
    });
}
// 返回集合中一个或多个随机数
async function srandmemberScene(scene = 'scene', arg = 1) {
    return await new Promise((resolve) => {
        client.srandmember(scene, arg, (err, data) => {
            return resolve(data);
        });
    });
}
module.exports = {
    setScene,
    hasScene,
    getScene,
    delScene,
    allScene,
    saddScene,
    setKey,
    getKey,
    delKey,
    expireKey,
    sismemberScene,
    smembersScene,
    scardScene,
    sremScene,
    srandmemberScene
}