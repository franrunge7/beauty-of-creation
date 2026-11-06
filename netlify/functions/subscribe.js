const { getStore } = require("@netlify/blobs");

const crypto = require("node:crypto");

exports.handler = async (event) => {

  try {

    if (!["POST", "DELETE"].includes(event.httpMethod)) {

      return { statusCode: 405, body: "Method not allowed" };

    }

    const { subscription, time, timeZone } =

      JSON.parse(event.body || "{}");

    if (

      !subscription?.endpoint ||

      !subscription?.keys?.p256dh ||

      !subscription?.keys?.auth ||

      !subscription.endpoint.startsWith("https://")

    ) {

      return { statusCode: 400, body: "Invalid subscription" };

    }

    const id = crypto

      .createHash("sha256")

      .update(subscription.endpoint)

      .digest("hex");

    const store = getStore({

      name: "reminder-subscribers",

      consistency: "strong"

    });

    if (event.httpMethod === "DELETE") {

      await store.delete(id);

      return { statusCode: 200, body: '{"ok":true}' };

    }

    if (

      !/^([01]\d|2[0-3]):[0-5]\d$/.test(time) ||

      !Intl.supportedValuesOf("timeZone").includes(timeZone)

    ) {

      return { statusCode: 400, body: "Invalid reminder settings" };

    }

    await store.setJSON(id, {

      subscription,

      time,

      timeZone,

      createdAt: Date.now()

    });

    return {

      statusCode: 200,

      body: '{"ok":true}'

    };

  } catch (error) {

    console.error(error);

    return {

      statusCode: 500,

      body: "Unable to save reminder"

    };

  }

};
