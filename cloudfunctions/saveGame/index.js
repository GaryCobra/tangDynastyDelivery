const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event: any, context: any) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  const saves = db.collection('saves');

  try {
    const { uid, gameData } = event;
    if (!uid || !gameData) {
      return { success: false, error: 'Missing uid or gameData' };
    }

    const dataStr = JSON.stringify(gameData);
    if (dataStr.length > 102400) {
      return { success: false, error: 'Data too large' };
    }

    const existing = await saves.where({ _openid: wxContext.OPENID }).get();

    if (existing.data.length > 0) {
      await saves.doc(existing.data[0]._id).update({
        data: {
          uid,
          gameData,
          updatedAt: db.serverDate(),
        },
      });
    } else {
      await saves.add({
        data: {
          _openid: wxContext.OPENID,
          uid,
          gameData,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate(),
        },
      });
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};
