const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const MAX_DAILY_ADS = 30;

exports.main = async (event: any, context: any) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  const serverDate = db.serverDate();

  try {
    const { uid, adType, rewardType } = event;
    if (!uid || !adType || !rewardType) {
      return { success: false, error: 'Missing parameters' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const adLogs = db.collection('ad_logs');
    const todayCount = await adLogs
      .where({
        _openid: wxContext.OPENID,
        date: todayStr,
      })
      .count();

    if (todayCount.total >= MAX_DAILY_ADS) {
      return {
        success: false,
        error: 'Daily ad limit reached',
        dailyCount: todayCount.total,
      };
    }

    await adLogs.add({
      data: {
        _openid: wxContext.OPENID,
        uid,
        adType,
        rewardType,
        date: todayStr,
        createdAt: serverDate,
      },
    });

    let rewardAmount = 0;
    switch (rewardType) {
      case 'coins': rewardAmount = 50; break;
      case 'stamina': rewardAmount = 30; break;
      case 'finance_tip': rewardAmount = 1; break;
      default: rewardAmount = 10;
    }

    return {
      success: true,
      rewardAmount,
      dailyCount: todayCount.total + 1,
      rewardType,
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
};
