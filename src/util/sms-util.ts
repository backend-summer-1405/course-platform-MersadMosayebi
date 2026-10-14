import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!, 
  },
});

export const sendOtpCode = async (
  email: string,
  code: string
): Promise<void> => {
  await transporter.sendMail({
    from: `"نام اپ" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "کد تأیید",
    text: `کد تأیید شما: ${code}`,
    html: `کد تأیید شما:${code}`,
  });
};
