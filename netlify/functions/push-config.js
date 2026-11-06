exports.handler = async () => {

  const publicKey = process.env.VAPID_PUBLIC_KEY;

  return {

    statusCode: publicKey ? 200 : 503,

    headers: {

      "Content-Type": "application/json",

      "Cache-Control": "no-store"

    },

    body: JSON.stringify(

      publicKey

        ? { publicKey }

        : { error: "Push notifications not configured" }

    )

  };

};
