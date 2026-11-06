

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", event => {

  event.waitUntil(self.clients.claim());

});

self.addEventListener("push", event => {

  let data = {};

  try {

    data = event.data?.json() || {};

  } catch {

    data = { body: "A new wonder awaits you." };

  }

  event.waitUntil(

    self.registration.showNotification(

      data.title || "The Beauty of Creation",

      {

        body: data.body || "Take a moment to notice creation.",

        icon: "/icon.svg",

        badge: "/icon.svg",

        tag: "daily-wonder",

        data: { url: data.url || "/" }

      }

    )

  );

});

self.addEventListener("notificationclick", event => {

  event.notification.close();

  event.waitUntil(

    clients.openWindow(event.notification.data?.url || "/")

  );

});
