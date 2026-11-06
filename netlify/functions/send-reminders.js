

const { getStore } = require("@netlify/blobs");

const webpush = require("web-push");

const wonders = [

  "The first light of dawn.",

  "The intricate veins of a leaf.",

  "A whale singing beneath the ocean.",

  "The patience of an ancient tree.",

  "The geometry of a snowflake.",

  "Sunlight warming your face.",

  "Bees moving from flower to flower.",

  "The colours of a sunset.",

  "The rhythm of ocean tides.",

  "A bird taking flight.",

  "The hidden life in a handful of soil.",

  "Rain falling on leaves.",

  "The human capacity for kindness.",

  "The complexity of a single cell.",

  "The Milky Way on a clear night.",

  "A fern unfurling after rain.",

  "A river winding through a valley.",

  "A butterfly opening its wings.",

  "Cloud shadows crossing a field.",

  "A seed beginning to grow.",

  "A moonlit coastline.",

  "The first stars appearing at dusk.",

  "A drop of dew catching sunlight."

];

function localTime(date, timeZone) {

  const parts = new Intl.DateTimeFormat("en-GB", {

    timeZone,

    year: "numeric",

    month: "2-digit",

    day: "2-digit",

    hour: "2-digit",

    minute: "2-digit",

    hourCycle: "h23"

  }).formatToParts(date);

  const p = Object.fromEntries(

    parts.map(part => [part.type, part.value])

  );

  return {

    day: `${p.year}-${p.month}-${p.day}`,

    minutes: Number(p.hour) * 60 + Number(p.minute)

  };

}

exports.handler = async () => {

  if (

    !process.env.VAPID_PUBLIC_KEY ||

    !process.env.VAPID_PRIVATE_KEY

  ) {

    return { statusCode: 503, body: "Push keys missing" };

  }

  webpush.setVapidDetails(

    "mailto:notifications@example.com",

    process.env.VAPID_PUBLIC_KEY,

    process.env.VAPID_PRIVATE_KEY

  );

  const store = getStore({

    name: "reminder-subscribers",

    consistency: "strong"

  });

  const now = new Date();

  let cursor;

  let sent = 0;

  do {

    const page = await store.list({ cursor });

    cursor = page.cursor;

    for (const item of page.blobs) {

      try {

        const data = await store.get(item.key, {

          type: "json"

        });

        if (!data) continue;

        const local = localTime(now, data.timeZone);

        const [hour, minute] = data.time.split(":").map(Number);

        const target = hour * 60 + minute;

        if (

          local.minutes < target ||

          local.minutes >= target + 5 ||

          data.lastSentDate === local.day

        ) continue;

        const index =

          Math.floor(Date.parse(local.day) / 86400000) %

          wonders.length;

        await webpush.sendNotification(

          data.subscription,

          JSON.stringify({

            title: "The Beauty of Creation",

            body: wonders[index],

            url: "/"

          })

        );

        data.lastSentDate = local.day;

        await store.setJSON(item.key, data);

        sent++;

      } catch (error) {

        if ([404, 410].includes(error.statusCode)) {

          await store.delete(item.key);

        } else {

          console.error(error);

        }

      }

    }

  } while (cursor);

  return {

    statusCode: 200,

    body: JSON.stringify({ sent })

  };

};
