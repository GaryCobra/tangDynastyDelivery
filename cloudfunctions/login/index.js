const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event: any, context: any) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  const users = db.collection('users');

  try {
    const doc = await users.where({ _openid: wxContext.OPENID }).get();
    const isNew = doc.data.length === 0;

    if (isNew) {
      await users.add({
        data: {
          _openid: wxContext.OPENID,
          createdAt: db.serverDate(),
          lastLoginAt: db.serverDate(),
        },
      });
    } else {
      await users.doc(doc.data[0]._id).update({
        data: { lastLoginAt: db.serverDate() },
      });
    }

    return { openid: wxContext.OPENID, isNewUser: isNew };
  } catch (e) {
    return { error: e.message };
  }
};
