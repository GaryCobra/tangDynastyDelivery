const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event: any, context: any) => {
  const db = cloud.database();
  const saves = db.collection('saves');

  try {
    const result = await saves
      .orderBy('gameData.coins', 'desc')
      .limit(100)
      .field({
        'gameData.nickname': true,
        'gameData.coins': true,
        'gameData.reputationLevel': true,
        'gameData.currentVehicle': true,
        'gameData.totalDeliveries': true,
      })
      .get();

    const list = result.data.map((item: any, index: number) => ({
      rank: index + 1,
      nickname: item.gameData?.nickname || '未知',
      coins: item.gameData?.coins || 0,
      reputationLevel: item.gameData?.reputationLevel || 0,
      vehicle: item.gameData?.currentVehicle || 'legs',
      deliveries: item.gameData?.totalDeliveries || 0,
    }));

    return { list };
  } catch (e) {
    return { error: e.message, list: [] };
  }
};
