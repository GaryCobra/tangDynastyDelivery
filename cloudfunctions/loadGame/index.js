const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event: any, context: any) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  const saves = db.collection('saves');

  try {
    const doc = await saves.where({ _openid: wxContext.OPENID }).get();

    if (doc.data.length > 0) {
      return {
        found: true,
        uid: doc.data[0].uid,
        gameData: doc.data[0].gameData,
        updatedAt: doc.data[0].updatedAt,
      };
    }

    return { found: false, gameData: null };
  } catch (e) {
    return { error: e.message, found: false };
  }
};
