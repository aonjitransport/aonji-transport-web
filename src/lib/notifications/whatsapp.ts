import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendWhatsAppMessage({
  phone,
  lrNumber,
  deliveryDate,
  consigneeName,
}: {
  phone: string;
  lrNumber: string;
  deliveryDate: string;
  consigneeName: string;
}) {
  try {
    const phoneStr = String(phone); // handles number, string, anything

const formattedPhone = phoneStr.startsWith("+")
  ? phoneStr
  : `+91${phoneStr}`;

    const message = `📦 AONJI TRANSPORT

Hello ${consigneeName},

Your shipment has been booked.

LR Number: ${lrNumber}
Expected Delivery: ${deliveryDate}

Track here:
https://yourdomain.com/track/${lrNumber}

Thank you!`;

    const res = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedPhone}`,
      body: message,
    });

    console.log("WhatsApp sent:", res.sid);
    return true;
  } catch (error) {
    console.error("WhatsApp Error:", error);
    return false;
  }
}