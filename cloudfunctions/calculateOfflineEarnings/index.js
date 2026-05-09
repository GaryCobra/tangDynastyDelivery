const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event: any, context: any) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  const now = Date.now();

  try {
    const { uid, lastLoginTime, stationLevel, employeeCount, totalEfficiency } = event;

    if (!uid || !lastLoginTime) {
      return { coins: 0, hours: 0, message: '缺少参数' };
    }

    const hoursOffline = Math.min(12, Math.max(0, (now - lastLoginTime) / 3600000));

    if (hoursOffline < 1) {
      return { coins: 0, hours: 0, message: '不在线时间不足1小时' };
    }

    const sLevel = Math.max(0, stationLevel || 0);
    const eCount = Math.max(0, employeeCount || 0);
    const efficiency = Math.max(0, totalEfficiency || 0);

    const coins = Math.floor(sLevel * Math.max(1, eCount) * efficiency * hoursOffline * 0.5);

    await db.collection('offline_rewards').add({
      data: {
        _openid: wxContext.OPENID,
        uid,
        hoursOffline,
        coins,
        calculatedAt: db.serverDate(),
      },
    });

    const message = hoursOffline >= 12
      ? `离线${hoursOffline.toFixed(1)}小时（已达上限12小时），获得${coins}铜钱`
      : `离线${hoursOffline.toFixed(1)}小时，获得${coins}铜钱`;

    return { coins, hours: hoursOffline, message };
  } catch (e) {
    return { coins: 0, hours: 0, message: `计算失败: ${e.message}` };
  }
};
