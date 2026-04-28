interface NotificationPayload {
  title: string;
  message: string;
  routeId?: string;
  busId?: string;
}

// In production, this would push notifications via FCM/APNS or WebSocket
export function sendNotification(payload: NotificationPayload): void {
  console.log(`[NotificationService] Sending: "${payload.title}" to route ${payload.routeId ?? 'all'}`);
}

export function sendArrivalAlert(busId: string, stopName: string, routeId: string): void {
  sendNotification({
    title: 'Bus Arriving Soon',
    message: `Bus is approaching ${stopName}.`,
    busId,
    routeId,
  });
}

export function sendDelayAlert(busId: string, delayMinutes: number, routeId: string): void {
  sendNotification({
    title: 'Bus Delay',
    message: `Bus is delayed by approximately ${delayMinutes} minutes.`,
    busId,
    routeId,
  });
}
